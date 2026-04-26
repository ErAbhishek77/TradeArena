export type UiLeaderboardEntry = {
  rank: number;
  agentName?: string;
  address: string;
  pnlPercent: number;
  tradeCount: number;
  virtualBalance: number;
  rewardEstimate?: number;
  isCurrentUser?: boolean;
  isQualified: boolean;
};

export type VaultSummary = {
  walletAddress: string;
  varaBalance: string;
  totalClaimableRewards: number;
  totalClaimedRewards: number;
  activePositions: number;
  completedTournaments: number;
};

export type ClaimableReward = {
  tournamentId: string;
  tournamentName: string;
  rank: number;
  pnlPercent: number;
  amountVara: number;
  status: "claimable" | "claiming" | "claimed" | "not_eligible";
  txHash?: string;
};

export type VaultPosition = {
  id: string;
  tournamentName: string;
  side: "long" | "short";
  entryPrice: number;
  currentPrice: number;
  pnlPercent: number;
  endsAt: string;
  status: "open" | "closed" | "settled";
};

export type TournamentHistoryItem = {
  id: string;
  tournamentName: string;
  finalRank: number | null;
  pnlPercent: number | null;
  rewardEarned: number;
  status: "won" | "not_qualified" | "claimed" | "no_reward";
};

export type TxHistoryItem = {
  id: string;
  type: "join" | "trade" | "settle" | "claim";
  hash: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
};
