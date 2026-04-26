import type { GearApi } from "@gear-js/api";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import idlRaw from "@/assets/tradevault_arena_client.idl?raw";
import { toActorId } from "@/lib/format";

export type TournamentStatus = "Upcoming" | "Active" | "Ended" | "Settled";
export type PositionDirection = "Long" | "Short";

export type Position = {
  entry_price: string;
  size: string;
  direction: PositionDirection;
  is_open: boolean;
};

export type ParticipantView = {
  tournament_id: string;
  participant: string;
  initial_virtual_balance: string;
  realized_pnl: string;
  unrealized_pnl: string;
  final_value: string;
  return_percentage_bps: string;
  position: Position | null;
  claimable_reward: string;
};

export type WinnerPayout = {
  rank: number;
  participant: string;
  payout: string;
  final_value: string;
  return_percentage_bps: string;
};

export type TournamentView = {
  tournament_id: string;
  name: string;
  entry_fee: string;
  start_time: string;
  end_time: string;
  initial_virtual_balance: string;
  max_participants: number;
  participant_count: number;
  prize_pool: string;
  status: TournamentStatus;
  final_btc_price: string | null;
  winners: WinnerPayout[];
};

export type LeaderboardEntry = {
  rank: number;
  participant: string;
  final_value: string;
  realized_pnl: string;
  unrealized_pnl: string;
  return_percentage_bps: string;
  position: Position | null;
};

export type SettlementResult = {
  tournament_id: string;
  final_btc_price: string;
  prize_pool: string;
  winners: WinnerPayout[];
};

export type TxAccount = {
  address: string;
  signer?: unknown | null;
};

export type CreateTournamentInput = {
  name: string;
  entryFee: bigint;
  startTime: bigint;
  endTime: bigint;
  initialVirtualBalance: bigint;
  maxParticipants: number;
};

let cachedApi: GearApi | null = null;
let cachedSails: Promise<Sails> | null = null;

async function getService(api: GearApi, programId: string): Promise<any> {
  if (!cachedSails || cachedApi !== api) {
    cachedApi = api;
    cachedSails = (async () => {
      const parser = await SailsIdlParser.new();
      const sails = new Sails(parser);
      sails.setApi(api);
      sails.parseIdl(idlRaw);
      return sails;
    })();
  }

  const sails = await cachedSails;
  sails.setProgramId(programId as `0x${string}`);

  const service =
    sails.services?.TradevaultArena ??
    sails.services?.tradevaultArena ??
    sails.services?.tradevaultarena ??
    Object.values(sails.services ?? {})[0];

  if (!service) {
    throw new Error("TradeVaultArena service was not found in the current IDL.");
  }

  return service;
}

async function runTransaction<T>(
  api: GearApi,
  programId: string,
  account: TxAccount,
  factory: (service: any) => any,
  value?: bigint,
): Promise<T> {
  const service = await getService(api, programId);
  const tx = factory(service);

  if (value && value > 0n) {
    tx.withValue(value);
  }

  tx.withAccount(account.address, account.signer ? { signer: account.signer } : undefined);
  await tx.calculateGas();

  const result = await tx.signAndSend();
  return result.response();
}

export async function fetchAdmin(api: GearApi, programId: string): Promise<string> {
  const service = await getService(api, programId);
  return service.queries.Admin().call();
}

export async function fetchCurrentMockPrice(api: GearApi, programId: string): Promise<string> {
  const service = await getService(api, programId);
  return service.queries.CurrentMockPrice().call();
}

export async function fetchTournaments(
  api: GearApi,
  programId: string,
): Promise<TournamentView[]> {
  const service = await getService(api, programId);
  return service.queries.Tournaments().call();
}

export async function fetchParticipant(
  api: GearApi,
  programId: string,
  tournamentId: bigint,
  participant: string,
): Promise<ParticipantView> {
  const service = await getService(api, programId);
  const participantActorId = toActorId(participant);
  console.log("[TradeVaultArena] participant ActorId bytes", participantActorId.length);
  return service.queries.Participant(tournamentId, participantActorId).call();
}

export async function fetchLeaderboard(
  api: GearApi,
  programId: string,
  tournamentId: bigint,
): Promise<LeaderboardEntry[]> {
  const service = await getService(api, programId);
  return service.queries.Leaderboard(tournamentId).call();
}

export async function createTournament(
  api: GearApi,
  programId: string,
  account: TxAccount,
  input: CreateTournamentInput,
): Promise<TournamentView> {
  return runTransaction<TournamentView>(api, programId, account, (service) =>
    service.functions.CreateTournament(
      input.name,
      input.entryFee,
      input.startTime,
      input.endTime,
      input.initialVirtualBalance,
      input.maxParticipants,
    ),
  );
}

export async function updateMockPrice(
  api: GearApi,
  programId: string,
  account: TxAccount,
  newPrice: bigint,
): Promise<string> {
  return runTransaction<string>(api, programId, account, (service) =>
    service.functions.UpdateMockPrice(newPrice),
  );
}

export async function joinTournament(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
  entryFee: bigint,
): Promise<ParticipantView> {
  return runTransaction<ParticipantView>(
    api,
    programId,
    account,
    (service) => service.functions.JoinTournament(tournamentId),
    entryFee,
  );
}

export async function openPosition(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
  direction: PositionDirection,
  size: bigint,
): Promise<ParticipantView> {
  return runTransaction<ParticipantView>(api, programId, account, (service) =>
    service.functions.OpenPosition(tournamentId, direction, size),
  );
}

export async function closePosition(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
): Promise<ParticipantView> {
  return runTransaction<ParticipantView>(api, programId, account, (service) =>
    service.functions.ClosePosition(tournamentId),
  );
}

export async function endTournament(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
): Promise<TournamentView> {
  return runTransaction<TournamentView>(api, programId, account, (service) =>
    service.functions.EndTournament(tournamentId),
  );
}

export async function settleTournament(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
): Promise<SettlementResult> {
  return runTransaction<SettlementResult>(api, programId, account, (service) =>
    service.functions.SettleTournament(tournamentId),
  );
}

export async function claimReward(
  api: GearApi,
  programId: string,
  account: TxAccount,
  tournamentId: bigint,
): Promise<string> {
  return runTransaction<string>(api, programId, account, (service) =>
    service.functions.ClaimReward(tournamentId),
  );
}
