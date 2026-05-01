import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GearApi, GearKeyring } from "@gear-js/api";
import { Sails } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import { PROGRAM_ID } from "../src/config";

type TournamentStatus = "Upcoming" | "Active" | "Ended" | "Settled";

type TournamentView = {
  tournament_id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: TournamentStatus;
};

type KeeperTickSummary = {
  price_updated: boolean;
  positions_closed: number;
  tournament_ended: boolean;
  tournament_settled: boolean;
};

const AUTO_CLOSE_BEFORE_END_MS = 5_000;
const SETTLEMENT_DELAY_MS = 120_000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = resolve(__dirname, "..");
const IDL_PATH = resolve(FRONTEND_DIR, "src/assets/tradevault_arena_client.idl");
const BINANCE_STREAM_URL = "wss://stream.binance.com:9443/ws/btcusdt@ticker";

const endpoint = process.env.VARA_WSS ?? "wss://testnet.vara.network";
const programId = process.env.PROGRAM_ID?.trim() || PROGRAM_ID;
const keeperSuri = process.env.KEEPER_SURI?.trim();
const intervalMs = Number(process.env.INTERVAL_MS ?? "15000");
const configuredTournamentIds = (process.env.TOURNAMENT_IDS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!keeperSuri) {
  throw new Error("KEEPER_SURI is required.");
}

const idlRaw = readFileSync(IDL_PATH, "utf8");
const latestPriceState: { value: number | null } = { value: null };
const inFlight = new Set<string>();

function normalizeTimestampMs(value: string): number {
  const raw = Number(BigInt(value));
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw < 1_000_000_000_000 ? raw * 1000 : raw;
}

function getDisplayStatus(tournament: TournamentView, now = Date.now()): "Upcoming" | "Live" | "Ended" | "Settled" {
  if (tournament.status === "Settled") return "Settled";
  const start = normalizeTimestampMs(tournament.start_time);
  const end = normalizeTimestampMs(tournament.end_time);
  if (now < start) return "Upcoming";
  if (now >= start && now < end && tournament.status !== "Ended") return "Live";
  return "Ended";
}

function connectBinanceTicker() {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const open = () => {
    socket = new WebSocket(BINANCE_STREAM_URL);
    socket.onopen = () => {
      console.log("[keeper] connected to Binance BTCUSDT stream");
    };
    socket.onmessage = (event) => {
      const payload = JSON.parse(String(event.data)) as { c?: string };
      const nextPrice = Number(payload.c);
      if (Number.isFinite(nextPrice) && nextPrice > 0) {
        latestPriceState.value = nextPrice;
      }
    };
    socket.onerror = () => {
      socket?.close();
    };
    socket.onclose = () => {
      console.log("[keeper] Binance stream disconnected, reconnecting...");
      socket = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          open();
        }, 2_000);
      }
    };
  };

  open();
}

async function createService() {
  const api = await GearApi.create({ providerAddress: endpoint });
  const keyring = await GearKeyring.fromSuri(keeperSuri, "TradeVault Keeper");
  const parser = await SailsIdlParser.new();
  const sails = new Sails(parser);
  sails.setApi(api);
  sails.parseIdl(idlRaw);
  sails.setProgramId(programId as `0x${string}`);

  const service =
    sails.services?.TradevaultArena ??
    sails.services?.tradevaultArena ??
    sails.services?.tradevaultarena ??
    Object.values(sails.services ?? {})[0];

  if (!service) {
    throw new Error("TradeVaultArena service not found in IDL.");
  }

  return { api, keyring, service };
}

async function fetchTournament(service: any, tournamentId: string): Promise<TournamentView> {
  return service.queries.Tournament(BigInt(tournamentId)).call();
}

async function fetchTournaments(service: any): Promise<TournamentView[]> {
  return service.queries.Tournaments().call();
}

async function runKeeperTick(service: any, keyring: any, tournamentId: string, price: number) {
  const roundedPrice = BigInt(Math.floor(price * 100));
  const tx = service.functions.KeeperTick(BigInt(tournamentId), roundedPrice);
  tx.withAccount(keyring);
  await tx.calculateGas();
  const result = await tx.signAndSend();
  return (await result.response()) as KeeperTickSummary;
}

async function runProcessTournament(service: any, keyring: any, tournamentId: string) {
  const tx = service.functions.ProcessTournament(BigInt(tournamentId));
  tx.withAccount(keyring);
  await tx.calculateGas();
  const result = await tx.signAndSend();
  return (await result.response()) as KeeperTickSummary;
}

function tradingCutoffTime(tournament: TournamentView): number {
  return normalizeTimestampMs(tournament.end_time) - AUTO_CLOSE_BEFORE_END_MS;
}

function settlementReadyTime(tournament: TournamentView): number {
  return normalizeTimestampMs(tournament.end_time) + SETTLEMENT_DELAY_MS;
}

function shouldManageTournament(tournament: TournamentView, now: number): boolean {
  const displayStatus = getDisplayStatus(tournament, now);
  if (displayStatus === "Upcoming" && now < tradingCutoffTime(tournament)) {
    return false;
  }
  return tournament.status !== "Settled";
}

async function listManagedTournaments(service: any): Promise<TournamentView[]> {
  const tournaments = await fetchTournaments(service);
  const selectedIds = configuredTournamentIds.length
    ? new Set(configuredTournamentIds)
    : null;

  return tournaments.filter((tournament) =>
    selectedIds ? selectedIds.has(tournament.tournament_id) : true,
  );
}

async function main() {
  connectBinanceTicker();
  const { api, keyring, service } = await createService();
  console.log(`[keeper] keeper address ${keyring.address}`);
  console.log(`[keeper] endpoint ${endpoint}`);
  console.log(`[keeper] program ${programId}`);
  console.log(
    `[keeper] tournaments ${configuredTournamentIds.length ? configuredTournamentIds.join(", ") : "auto-discovery"}`,
  );

  const tick = async () => {
    const latestPrice = latestPriceState.value;
    if (!latestPrice || !Number.isFinite(latestPrice)) {
      console.log("[keeper] waiting for Binance price...");
      return;
    }

    const tournaments = await listManagedTournaments(service);
    const now = Date.now();

    for (const tournament of tournaments) {
      const tournamentId = tournament.tournament_id;
      if (inFlight.has(tournamentId)) continue;
      if (!shouldManageTournament(tournament, now)) continue;
      inFlight.add(tournamentId);

      try {
        const refreshedTournament = await fetchTournament(service, tournamentId);
        const refreshedNow = Date.now();
        const cutoffAt = tradingCutoffTime(refreshedTournament);
        const settleAt = settlementReadyTime(refreshedTournament);
        const displayStatus = getDisplayStatus(refreshedTournament, refreshedNow);

        if (refreshedTournament.status === "Settled") {
          continue;
        }

        if (displayStatus === "Upcoming" && refreshedNow < cutoffAt) {
          continue;
        }

        if (
          refreshedTournament.status === "Ended" &&
          refreshedNow < settleAt
        ) {
          console.log(
            `[keeper] tournament=${tournamentId} waiting for settlement window (${Math.ceil((settleAt - refreshedNow) / 1000)}s left)`,
          );
          continue;
        }

        const summary =
          refreshedTournament.status === "Ended"
            ? await runProcessTournament(service, keyring, tournamentId)
            : await runKeeperTick(service, keyring, tournamentId, latestPrice);
        console.log(
          `[keeper] tournament=${tournamentId} status=${refreshedTournament.status} price=${latestPrice.toFixed(2)} closed=${summary.positions_closed} ended=${summary.tournament_ended} settled=${summary.tournament_settled}`,
        );
      } catch (error) {
        console.error(`[keeper] tournament=${tournamentId} failed`, error);
      } finally {
        inFlight.delete(tournamentId);
      }
    }
  };

  await tick();
  setInterval(() => {
    void tick();
  }, intervalMs);

  const shutdown = async () => {
    console.log("[keeper] shutting down");
    await api.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

void main().catch((error) => {
  console.error("[keeper] fatal", error);
  process.exit(1);
});
