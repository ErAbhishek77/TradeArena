import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClockCountdown,
  RocketLaunch,
} from "@phosphor-icons/react";
import { BarChart3, Coins, Home, LayoutDashboard, ShieldCheck, Trophy, WalletCards } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTournamentInput,
  LeaderboardEntry,
  ParticipantView,
  PositionDirection,
  TournamentView,
} from "@/lib/arena";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { PriceTicker } from "@/components/ui/PriceTicker";
import { BGPattern } from "@/components/ui/bg-pattern";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { StatusPill as UiStatusPill } from "@/components/ui/StatusPill";
import { TournamentRow as FeatureTournamentRow } from "@/components/features/TournamentRow";
import { TradingChart } from "@/components/features/TradingChart";
import { OrderPanel } from "@/components/features/OrderPanel";
import { VaultStats } from "@/components/features/VaultStats";
import { PositionCard } from "@/components/features/PositionCard";
import { LeaderboardPanel } from "@/components/features/LeaderboardPanel";
import { AdminConsole } from "@/components/features/AdminConsole";
import { StepCards } from "@/components/features/StepCards";
import { MarketHeader } from "@/components/features/MarketHeader";
import { ProgressTracker } from "@/components/features/ProgressTracker";
import { ClaimCard } from "@/components/features/ClaimCard";
import { AdminOverviewPanel, AdminAuditBadge } from "@/components/features/AdminOverviewPanel";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ArenaCard } from "@/components/ui/arena-card";
import { LiveRankCard } from "@/components/ui/live-rank-card";
import { RewardCard } from "@/components/ui/reward-card";
import { QualificationBadge } from "@/components/ui/qualification-badge";
import { GlowTable } from "@/components/ui/glow-table";
import { VaultPositionCard } from "@/components/ui/vault-position-card";
import { AnimatedStat } from "@/components/ui/animated-stat";
import type {
  ClaimableReward,
  TournamentHistoryItem,
  TxHistoryItem,
  UiLeaderboardEntry,
  VaultPosition,
  VaultSummary,
} from "@/components/ui/arena-types";
import { fetchLiveBtcHistory, fetchLiveBtcPrice, type LivePricePoint } from "@/lib/live-price";
import {
  claimReward,
  closePosition,
  createTournament,
  endTournament,
  fetchAdmin,
  fetchCurrentMockPrice,
  fetchLeaderboard,
  fetchParticipant,
  fetchTournaments,
  joinTournament,
  openPosition,
  settleTournament,
  updateMockPrice,
} from "@/lib/arena";
import {
  describeCountdown,
  formatPercentBps,
  formatPlanck,
  formatSigned,
  formatTimestamp,
  isProgramIdLike,
  parsePlanck,
  parseUnsignedInteger,
  sameAddress,
  shortAddress,
  toBigIntValue,
  toDatetimeLocalValue,
} from "@/lib/format";
import { useChainApi, useWallet } from "@/providers/chain-provider";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const defaultCreateForm = () => ({
  name: "Weekend BTC Sprint",
  entryFee: "5",
  startTime: toDatetimeLocalValue(Date.now() + 15 * 60 * 1000),
  endTime: toDatetimeLocalValue(Date.now() + 75 * 60 * 1000),
  initialVirtualBalance: "1000",
  maxParticipants: "25",
});

type AppRoute = {
  page: "home" | "tournaments" | "leaderboard" | "vault" | "rewards" | "admin" | "tournament" | "trade";
  tournamentId?: string;
};

type TradeHistoryItem = {
  action: "OPEN" | "CLOSE";
  direction: PositionDirection;
  size: string;
  entryPrice: string;
  exitPrice?: string;
  pnl?: string;
  timestamp: number;
};

type ToastItem = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

export function App() {
  const queryClient = useQueryClient();
  const now = useNow();
  const { api, apiError, apiStatus, network, programId } = useChainApi();
  const {
    account,
    accounts,
    balance,
    connectWallet,
    disconnect,
    selectAccount,
    signer,
    walletError,
    walletStatus,
    wallets,
  } = useWallet();

  const [route, setRoute] = useHashRoute();
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [tradeDirection, setTradeDirection] = useState<PositionDirection>("Long");
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [tradeSize, setTradeSize] = useState("100");
  const [tradeFormError, setTradeFormError] = useState<string | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lastPriceSyncAt, setLastPriceSyncAt] = useState<number | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [adminAutoSyncEnabled, setAdminAutoSyncEnabled] = useState(false);
  const syncInFlightRef = useRef(false);

  const isChainReady = apiStatus === "ready" && Boolean(api);
  const hasProgramId = isProgramIdLike(programId);
  const txAccount = account ? { address: account.address, signer } : null;

  const pushToast = (tone: ToastItem["tone"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, tone, message }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  };

  const refreshArena = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin"] }),
      queryClient.invalidateQueries({ queryKey: ["current-price"] }),
      queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
      queryClient.invalidateQueries({ queryKey: ["participant"] }),
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
    ]);
  };

  const adminQuery = useQuery({
    queryKey: ["admin", network.endpoint, programId],
    queryFn: () => fetchAdmin(api!, programId),
    enabled: isChainReady && hasProgramId,
  });

  const currentPriceQuery = useQuery({
    queryKey: ["current-price", network.endpoint, programId],
    queryFn: () => fetchCurrentMockPrice(api!, programId),
    enabled: isChainReady && hasProgramId,
    refetchInterval: 15_000,
  });

  const livePriceQuery = useQuery({
    queryKey: ["live-btc-price"],
    queryFn: fetchLiveBtcPrice,
    refetchInterval: 60_000,
  });

  const liveHistoryQuery = useQuery({
    queryKey: ["live-btc-history"],
    queryFn: fetchLiveBtcHistory,
    refetchInterval: 5 * 60_000,
  });

  const tournamentsQuery = useQuery({
    queryKey: ["tournaments", network.endpoint, programId],
    queryFn: () => fetchTournaments(api!, programId),
    enabled: isChainReady && hasProgramId,
    refetchInterval: 15_000,
  });

  const tournaments = (tournamentsQuery.data ?? []).slice().sort((left, right) =>
    Number(toBigIntValue(right.tournament_id) - toBigIntValue(left.tournament_id)),
  );

  useEffect(() => {
    if (!tournaments.length) {
      setSelectedTournamentId("");
      return;
    }

    const existing = tournaments.some(
      (tournament) => tournament.tournament_id === selectedTournamentId,
    );
    if (!selectedTournamentId || !existing) {
      const preferred =
        tournaments.find((tournament) => tournament.status === "Active") ??
        tournaments.find((tournament) => tournament.status === "Upcoming") ??
        tournaments[0];
      setSelectedTournamentId(preferred.tournament_id);
    }
  }, [selectedTournamentId, tournaments]);

  const selectedTournament =
    tournaments.find((tournament) => tournament.tournament_id === selectedTournamentId) ?? null;
  const selectedTournamentEnd = selectedTournament
    ? Number(toBigIntValue(selectedTournament.end_time))
    : null;
  const selectedTournamentExpired =
    selectedTournamentEnd != null ? now >= selectedTournamentEnd : false;

  useEffect(() => {
    if (!account?.address || !selectedTournamentId) {
      setTradeHistory([]);
      return;
    }

    setTradeHistory(readTradeHistory(programId, account.address, selectedTournamentId));
  }, [account?.address, programId, selectedTournamentId]);

  useEffect(() => {
    if (route.page === "tournament" && route.tournamentId) {
      setSelectedTournamentId(route.tournamentId);
    }
  }, [route.page, route.tournamentId]);

  useEffect(() => {
    setWalletPickerOpen(false);
  }, [route]);

  const participantQuery = useQuery({
    queryKey: [
      "participant",
      network.endpoint,
      programId,
      selectedTournament?.tournament_id,
      account?.address,
    ],
    queryFn: () =>
      fetchParticipant(
        api!,
        programId,
        toBigIntValue(selectedTournament?.tournament_id),
        account!.address,
      ),
    enabled: isChainReady && hasProgramId && Boolean(selectedTournament) && Boolean(account),
    retry: false,
    refetchInterval:
      account && selectedTournament?.status === "Active" ? 3_000 : 15_000,
  });

  const participantErrorMessage = extractErrorMessage(participantQuery.error);
  const participantNotFound = participantErrorMessage.includes("ParticipantNotFound");
  const participant = participantNotFound ? null : participantQuery.data ?? null;

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", network.endpoint, programId, selectedTournament?.tournament_id],
    queryFn: () =>
      fetchLeaderboard(api!, programId, toBigIntValue(selectedTournament?.tournament_id)),
    enabled: isChainReady && hasProgramId && Boolean(selectedTournament),
    refetchInterval: selectedTournament?.status === "Active" ? 3_000 : 15_000,
  });

  const isAdmin = sameAddress(account?.address, adminQuery.data);
  const walletActionReason = getWalletActionReason(walletStatus);

  const createTournamentMutation = useMutation({
    mutationFn: async (input: CreateTournamentInput) => {
      if (!api || !txAccount) throw new Error("Connect a wallet to create a tournament.");
      return createTournament(api, programId, txAccount, input);
    },
    onSuccess: async (created) => {
      await refreshArena();
      setSelectedTournamentId(created.tournament_id);
      setCreateForm(defaultCreateForm());
      setCreateFormError(null);
      pushToast("success", `Tournament #${created.tournament_id} created.`);
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const updatePriceMutation = useMutation({
    mutationFn: async (newPrice: bigint) => {
      if (!api || !txAccount) throw new Error("Connect a wallet to update the price.");
      return updateMockPrice(api, programId, txAccount, newPrice);
    },
    onSuccess: async () => {
      await refreshArena();
      setLastPriceSyncAt(Date.now());
      setSyncWarning(null);
    },
    onError: () => setSyncWarning("Price sync failed. Try again in a moment."),
  });

  const joinMutation = useMutation({
    mutationFn: async (tournament: TournamentView) => {
      if (!api || !txAccount) throw new Error("Connect a wallet to join.");
      return joinTournament(
        api,
        programId,
        txAccount,
        toBigIntValue(tournament.tournament_id),
        toBigIntValue(tournament.entry_fee),
      );
    },
    onSuccess: async (_result, tournament) => {
      await refreshArena();
      pushToast(
        "success",
        `Joined tournament. ${formatPlanck(tournament.entry_fee)} entry fee submitted.`,
      );
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const openPositionMutation = useMutation({
    mutationFn: async ({
      direction,
      size,
    }: {
      direction: PositionDirection;
      size: bigint;
    }) => {
      if (!api || !txAccount || !selectedTournament) {
        throw new Error("Select a tournament and connect a wallet first.");
      }

      return openPosition(
        api,
        programId,
        txAccount,
        toBigIntValue(selectedTournament.tournament_id),
        direction,
        size,
      );
    },
    onSuccess: async (_result, variables) => {
      if (account?.address && selectedTournament?.tournament_id && currentPriceValue > 0n) {
        const nextHistory = appendTradeHistory(
          programId,
          account.address,
          selectedTournament.tournament_id,
          tradeHistory,
          {
            action: "OPEN",
            direction: variables.direction,
            size: variables.size.toString(),
            entryPrice: currentPriceValue.toString(),
            timestamp: Date.now(),
          },
        );
        setTradeHistory(nextHistory);
      }

      await refreshArena();
      pushToast(
        "success",
        `${variables.direction} position opened at $${currentPriceValue.toLocaleString()}.`,
      );
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const closePositionMutation = useMutation({
    mutationFn: async () => {
      if (!api || !txAccount || !selectedTournament) {
        throw new Error("Select a tournament and connect a wallet first.");
      }

      return closePosition(
        api,
        programId,
        txAccount,
        toBigIntValue(selectedTournament.tournament_id),
      );
    },
    onSuccess: async (result) => {
      if (
        account?.address &&
        selectedTournament?.tournament_id &&
        participant?.position &&
        currentPriceValue > 0n
      ) {
        const nextHistory = appendTradeHistory(
          programId,
          account.address,
          selectedTournament.tournament_id,
          tradeHistory,
          {
            action: "CLOSE",
            direction: participant.position.direction,
            size: participant.position.size,
            entryPrice: participant.position.entry_price,
            exitPrice: currentPriceValue.toString(),
            pnl: result.realized_pnl,
            timestamp: Date.now(),
          },
        );
        setTradeHistory(nextHistory);
      }

      await refreshArena();
      pushToast(
        "success",
        `Position closed with ${formatSigned(result.realized_pnl)} PnL at $${currentPriceValue.toLocaleString()}.`,
      );
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const tournamentLifecycleMutation = useMutation({
    mutationFn: async () => {
      if (!api || !txAccount || !selectedTournament) {
        throw new Error("Select a tournament and connect a wallet first.");
      }

      const tournamentId = toBigIntValue(selectedTournament.tournament_id);
      const expired = Number(toBigIntValue(selectedTournament.end_time)) <= Date.now();

      if (selectedTournament.status === "Settled") {
        throw new Error("Tournament is already settled.");
      }

      if (selectedTournament.status === "Upcoming") {
        throw new Error("Tournament cannot be settled before it goes live.");
      }

      if (selectedTournament.status === "Active" && !expired) {
        throw new Error("Tournament is still live.");
      }

      if (selectedTournament.status === "Active") {
        await endTournament(api, programId, txAccount, tournamentId);
      }

      return settleTournament(api, programId, txAccount, tournamentId);
    },
    onSuccess: async () => {
      await refreshArena();
      pushToast("success", "Tournament ended and settled.");
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      if (!api || !txAccount || !selectedTournament) {
        throw new Error("Select a tournament and connect a wallet first.");
      }

      return claimReward(
        api,
        programId,
        txAccount,
        toBigIntValue(selectedTournament.tournament_id),
      );
    },
    onSuccess: async (value) => {
      await refreshArena();
      pushToast("success", `Reward claimed: ${formatPlanck(value)}.`);
    },
    onError: (error) => pushToast("error", extractErrorMessage(error)),
  });

  const handleCreateTournament = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTournamentMutation.reset();
    setCreateFormError(null);

    try {
      if (!hasProgramId) throw new Error("Paste a deployed program ID before using admin actions.");
      if (!txAccount) throw new Error("Connect the admin wallet first.");
      if (!isAdmin) throw new Error("Only the contract admin can create tournaments.");

      const name = createForm.name.trim();
      if (!name) throw new Error("Tournament name is required.");

      const startTime = new Date(createForm.startTime).getTime();
      const endTime = new Date(createForm.endTime).getTime();
      if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
        throw new Error("Start and end times must be valid timestamps.");
      }

      const input: CreateTournamentInput = {
        name,
        entryFee: parsePlanck(createForm.entryFee),
        startTime: BigInt(startTime),
        endTime: BigInt(endTime),
        initialVirtualBalance: parseUnsignedInteger(
          createForm.initialVirtualBalance,
          "Initial virtual balance",
        ),
        maxParticipants: Number(
          parseUnsignedInteger(createForm.maxParticipants, "Max participants"),
        ),
      };

      if (input.maxParticipants <= 0) {
        throw new Error("Max participants must be greater than zero.");
      }

      createTournamentMutation.mutate(input);
    } catch (error) {
      setCreateFormError(extractErrorMessage(error));
    }
  };

  const handleOpenPosition = () => {
    openPositionMutation.reset();
    setTradeFormError(null);

    try {
      if (!selectedTournament) throw new Error("Pick a tournament first.");
      if (!txAccount) throw new Error(walletActionReason);
      if (!participant) {
        throw new Error("Join the selected tournament before opening a position.");
      }
      const tradingBlockedReason = getTradingDisabledReason(selectedTournament, participant, now);
      if (tradingBlockedReason) {
        throw new Error(tradingBlockedReason);
      }

      openPositionMutation.mutate({
        direction: tradeDirection,
        size: parseUnsignedInteger(tradeSize, "Position size"),
      });
    } catch (error) {
      setTradeFormError(extractErrorMessage(error));
    }
  };

  const currentPriceValue = currentPriceQuery.data ? toBigIntValue(currentPriceQuery.data) : 0n;
  const livePriceValue = livePriceQuery.data ? BigInt(Math.round(livePriceQuery.data.price)) : 0n;
  const livePriceChange24h = livePriceQuery.data?.change24h ?? 0;
  const liveHistory = useMemo(
    () => mergeLivePriceHistory(liveHistoryQuery.data ?? [], livePriceQuery.data?.price ?? null),
    [liveHistoryQuery.data, livePriceQuery.data?.price],
  );
  const previousLivePriceValue =
    liveHistory.length > 1
      ? BigInt(Math.round(liveHistory[liveHistory.length - 2]?.price ?? livePriceQuery.data?.price ?? 0))
      : livePriceValue;
  const priceDelta = livePriceValue - previousLivePriceValue;
  const projectedPrice = currentPriceValue + priceDelta;
  const tradeSizeValue = /^\d+$/.test(tradeSize.trim()) ? BigInt(tradeSize.trim()) : 0n;
  const estimatedTradePnl =
    currentPriceValue > 0n && tradeSizeValue > 0n
      ? calculateSyntheticPnl(tradeDirection, tradeSizeValue, currentPriceValue, projectedPrice)
      : 0n;

  const featuredTournaments = tournaments.slice(0, 3);
  const canSyncTournamentPrice =
    isAdmin && selectedTournament?.status === "Active" && !selectedTournamentExpired;
  const selectedTournamentState = selectedTournament
    ? getTournamentLifecycleState(selectedTournament, now)
    : null;
  const selectedTournamentStatusKind = selectedTournamentState
    ? mapStatusKind(selectedTournamentState)
    : "ended";
  const selectedTournamentStatusLabel = selectedTournamentState
    ? mapStatusLabel(selectedTournamentState)
    : "Idle";
  const syncStatusLabel = getPriceSyncStatus({
    livePriceValue,
    currentPriceValue,
    isSyncing: updatePriceMutation.isPending,
    lastPriceSyncAt,
    now,
    tournamentState: selectedTournamentState,
  });
  const tournamentPriceHelperText =
    selectedTournamentState === "Live"
      ? syncStatusLabel === "Price feed delayed"
        ? "Tournament price is synced by admin/oracle. The live feed is delayed right now."
        : "Tournament price is synced by admin/oracle."
      : "Tournament price is fixed once the tournament closes.";

  const openTournament = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setRoute({ page: "trade", tournamentId });
  };

  const syncTournamentPrice = useCallback(
    (nextPrice: bigint) => {
      if (!hasProgramId) {
        throw new Error("Missing deployed program ID.");
      }
      if (!txAccount) {
        throw new Error("Connect the admin wallet first.");
      }
      if (!isAdmin) {
        throw new Error("Only the contract admin can update the tournament price.");
      }
      if (nextPrice <= 0n) {
        throw new Error("Tournament price must be greater than zero.");
      }
      if (syncInFlightRef.current || updatePriceMutation.isPending) return;
      if (nextPrice === currentPriceValue) return;

      syncInFlightRef.current = true;
      updatePriceMutation.mutate(nextPrice);
    },
    [currentPriceValue, hasProgramId, isAdmin, txAccount, updatePriceMutation],
  );

  useEffect(() => {
    if (!canSyncTournamentPrice) {
      setSyncWarning(null);
      setAdminAutoSyncEnabled(false);
    }
  }, [canSyncTournamentPrice]);

  useEffect(() => {
    syncInFlightRef.current = updatePriceMutation.isPending;
  }, [updatePriceMutation.isPending]);

  const handleManualPriceSync = useCallback(() => {
    try {
      if (livePriceValue <= 0n) throw new Error("Live BTC price is not ready.");
      syncTournamentPrice(livePriceValue);
    } catch (error) {
      setSyncWarning(extractErrorMessage(error));
    }
  }, [livePriceValue, syncTournamentPrice]);

  useEffect(() => {
    if (!adminAutoSyncEnabled) return;
    if (!canSyncTournamentPrice) return;
    if (route.page !== "admin") return;

    const runSync = () => {
      if (syncInFlightRef.current || updatePriceMutation.isPending) return;
      if (livePriceValue <= 0n || livePriceValue === currentPriceValue) return;
      try {
        syncTournamentPrice(livePriceValue);
      } catch (error) {
        setSyncWarning(extractErrorMessage(error));
      }
    };

    const id = window.setInterval(runSync, 15_000);
    return () => window.clearInterval(id);
  }, [
    adminAutoSyncEnabled,
    canSyncTournamentPrice,
    currentPriceValue,
    livePriceValue,
    route.page,
    syncTournamentPrice,
    updatePriceMutation.isPending,
  ]);

  const handleConnectWallet = () => {
    if (wallets.length === 1) {
      connectWallet(wallets[0]);
      setWalletPickerOpen(false);
      return;
    }

    setWalletPickerOpen((current) => !current);
  };

  const banner = resolveBanner({
    apiError,
    apiStatus,
    hasProgramId,
    networkName: network.name,
    walletError,
    walletStatus,
    accountAddress: account?.address ?? null,
  });

  const preferredTradeTournament =
    selectedTournament ??
    tournaments.find((tournament) => tournament.status === "Active") ??
    tournaments.find((tournament) => tournament.status === "Upcoming") ??
    tournaments[0] ??
    null;

  const tradeRoute: AppRoute = preferredTradeTournament
    ? { page: "trade", tournamentId: preferredTradeTournament.tournament_id }
    : { page: "trade" };

  const pageTitle =
    route.page === "home"
      ? "TradeVault Arena"
      : route.page === "tournaments"
        ? "Tournaments"
      : route.page === "trade" || route.page === "tournament"
          ? selectedTournament?.name ?? "Trade"
          : route.page === "leaderboard"
            ? "Leaderboard"
            : route.page === "rewards"
              ? "Rewards"
            : route.page === "vault"
              ? "My Vault"
              : "Admin";

  const activeRouteKey =
    (route.page === "tournament" || route.page === "trade") && route.tournamentId
      ? `${route.page}-${route.tournamentId}`
      : route.page;

  const shellActiveKey =
    route.page === "tournament" || route.page === "trade"
      ? "trade"
      : route.page === "rewards"
        ? "rewards"
      : route.page === "vault"
        ? "vault"
        : route.page;

  const shellNavItems = [
    { key: "home", label: "Home", icon: <Home size={16} />, onClick: () => setRoute({ page: "home" }) },
    { key: "tournaments", label: "Tournaments", icon: <LayoutDashboard size={16} />, onClick: () => setRoute({ page: "tournaments" }) },
    { key: "trade", label: "Trade", icon: <BarChart3 size={16} />, onClick: () => setRoute(tradeRoute) },
    { key: "leaderboard", label: "Leaderboard", icon: <Trophy size={16} />, onClick: () => setRoute({ page: "leaderboard" }) },
    { key: "rewards", label: "Rewards", icon: <Coins size={16} />, onClick: () => setRoute({ page: "rewards" }) },
    { key: "vault", label: "My Vault", icon: <WalletCards size={16} />, onClick: () => setRoute({ page: "vault" }) },
    ...(isAdmin ? [{ key: "admin", label: "Admin", badge: "Admin", icon: <ShieldCheck size={16} />, onClick: () => setRoute({ page: "admin" }) }] : []),
  ];

  const leaderboardEntries = leaderboardQuery.data ?? [];
  const leaderboardProjection = useMemo(
    () =>
      buildLeaderboardProjection({
        entries: leaderboardEntries,
        tournament: selectedTournament,
        currentAccount: account?.address ?? null,
        currentTradeCount: tradeHistory.length,
      }),
    [account?.address, leaderboardEntries, selectedTournament, tradeHistory.length],
  );
  const leaderboardPodium = leaderboardProjection.qualified.slice(0, 3).map((entry) => ({
    key: `podium-${entry.rank}-${entry.participant}`,
    rank: entry.rank,
    address: shortAddress(entry.participant),
    returnPct: formatPercentBps(entry.return_percentage_bps),
    prize: entry.rank === 1 ? "60%" : entry.rank === 2 ? "30%" : "10%",
    highlight: sameAddress(entry.participant, account?.address ?? null),
  }));
  const leaderboardRows = leaderboardProjection.qualified.map((entry) => {
    const returnBps = toBigIntValue(entry.return_percentage_bps);
    return {
      key: `row-${entry.rank}-${entry.participant}`,
      rank: entry.rank,
      address: shortAddress(entry.participant),
      returnPct: formatPercentBps(entry.return_percentage_bps),
      pnl: formatSigned(entry.realized_pnl),
      vault: toBigIntValue(entry.final_value).toLocaleString(),
      highlight: sameAddress(entry.participant, account?.address ?? null),
      positive: returnBps > 0n,
      negative: returnBps < 0n,
    };
  });
  const leaderboardInactiveRows = leaderboardProjection.inactive.map((entry) => ({
    key: `inactive-${entry.participant}`,
    address: shortAddress(entry.participant),
    note: "Not qualified: no trades placed",
    highlight: sameAddress(entry.participant, account?.address ?? null),
  }));
  const participantLeaderboardEntry = participant
    ? leaderboardProjection.qualified.find((entry) =>
        sameAddress(entry.participant, participant.participant),
      ) ?? null
    : null;
  const participantWinner = selectedTournament?.winners.find((winner) =>
    sameAddress(winner.participant, participant?.participant ?? null),
  ) ?? null;
  const participantQualified = participant
    ? isParticipantQualified({
        participantAddress: participant.participant,
        finalValue: participant.final_value,
        realizedPnl: participant.realized_pnl,
        unrealizedPnl: participant.unrealized_pnl,
        positionOpen: Boolean(participant.position?.is_open),
        tournament: selectedTournament,
        currentAccount: account?.address ?? null,
        currentTradeCount: tradeHistory.length,
      })
    : false;
  const claimableRewardValue = participant ? toBigIntValue(participant.claimable_reward) : 0n;
  const settledRewardValue = participantWinner ? toBigIntValue(participantWinner.payout) : 0n;
  const canClaimReward =
    Boolean(selectedTournament) &&
    selectedTournament?.status === "Settled" &&
    Boolean(participant) &&
    claimableRewardValue > 0n;
  const rewardStatus = getRewardStatus({
    participant,
    participantQualified,
    tournament: selectedTournament,
    winner: participantWinner,
    claimableRewardValue,
  });
  const rewardRankLabel = participantLeaderboardEntry
    ? `#${participantLeaderboardEntry.rank}`
    : rewardStatus === "Not qualified"
      ? "Not qualified"
      : participantWinner
        ? `#${participantWinner.rank}`
        : "—";
  const rewardAmountLabel =
    claimableRewardValue > 0n
      ? formatPlanck(claimableRewardValue)
      : settledRewardValue > 0n
        ? formatPlanck(settledRewardValue)
        : rewardStatus === "Not joined"
          ? "Join and trade to compete"
          : rewardStatus === "Not qualified" || rewardStatus === "Not eligible"
            ? "No reward available for this tournament"
            : "Pending settlement";
  const lifecycleActionAvailable =
    isAdmin &&
    Boolean(selectedTournament) &&
    (selectedTournamentState === "Settling" || selectedTournamentState === "Ended");
  const lifecycleActionLabel = selectedTournament?.status === "Ended"
    ? "End & Settle Tournament"
    : "End & Settle Tournament";
  const currentUserTradeCount = tradeHistory.filter((item) => item.action === "OPEN").length;
  const leaderboardUiEntries: UiLeaderboardEntry[] = leaderboardProjection.qualified.map((entry) => ({
    rank: entry.rank,
    address: entry.participant,
    pnlPercent: Number(entry.return_percentage_bps) / 100,
    tradeCount: entry.tradeCount,
    virtualBalance: Number(toBigIntValue(entry.final_value)),
    rewardEstimate: entry.rank === 1 ? 60 : entry.rank === 2 ? 30 : entry.rank === 3 ? 10 : undefined,
    isCurrentUser: sameAddress(entry.participant, account?.address ?? null),
    isQualified: true,
  }));
  const notQualifiedUiEntries: UiLeaderboardEntry[] = leaderboardProjection.inactive.map((entry) => ({
    rank: 0,
    address: entry.participant,
    pnlPercent: Number(entry.return_percentage_bps) / 100,
    tradeCount: 0,
    virtualBalance: Number(toBigIntValue(entry.final_value)),
    isCurrentUser: sameAddress(entry.participant, account?.address ?? null),
    isQualified: false,
  }));
  const vaultSummaryView: VaultSummary = {
    walletAddress: account?.address ?? "",
    varaBalance: balance ? `${balance} VARA` : "—",
    totalClaimableRewards: Number(claimableRewardValue) / 1e12,
    totalClaimedRewards: rewardStatus === "Claimed" ? Number(settledRewardValue) / 1e12 : 0,
    activePositions: participant?.position?.is_open ? 1 : 0,
    completedTournaments: participant ? 1 : 0,
  };
  const claimableRewardsView: ClaimableReward[] = selectedTournament
    ? [
        {
          tournamentId: selectedTournament.tournament_id,
          tournamentName: selectedTournament.name,
          rank: participantLeaderboardEntry?.rank ?? participantWinner?.rank ?? 0,
          pnlPercent: participant ? Number(participant.return_percentage_bps) / 100 : 0,
          amountVara: Number(claimableRewardValue > 0n ? claimableRewardValue : settledRewardValue) / 1e12,
          status:
            rewardStatus === "Ready to claim"
              ? "claimable"
              : rewardStatus === "Claimed"
                ? "claimed"
                : rewardStatus === "Not eligible" || rewardStatus === "Not qualified"
                  ? "not_eligible"
                  : claimRewardMutation.isPending
                    ? "claiming"
                    : "not_eligible",
        },
      ]
    : [];
  const vaultPositionsView: VaultPosition[] = participant?.position?.is_open && selectedTournament
    ? [
        {
          id: `${selectedTournament.tournament_id}-${participant.position.direction}`,
          tournamentName: selectedTournament.name,
          side: participant.position.direction === "Long" ? "long" : "short",
          entryPrice: Number(toBigIntValue(participant.position.entry_price)),
          currentPrice: Number(currentPriceValue),
          pnlPercent: Number(participant.return_percentage_bps) / 100,
          endsAt: describeCountdown(selectedTournament.start_time, selectedTournament.end_time, now),
          status: "open",
        },
      ]
    : [];
  const tournamentHistoryView: TournamentHistoryItem[] = selectedTournament
    ? [
        {
          id: selectedTournament.tournament_id,
          tournamentName: selectedTournament.name,
          finalRank: participantLeaderboardEntry?.rank ?? participantWinner?.rank ?? null,
          pnlPercent: participant ? Number(participant.return_percentage_bps) / 100 : null,
          rewardEarned: Number(claimableRewardValue > 0n ? claimableRewardValue : settledRewardValue) / 1e12,
          status:
            rewardStatus === "Claimed"
              ? "claimed"
              : rewardStatus === "Not qualified"
                ? "not_qualified"
                : claimableRewardValue > 0n || settledRewardValue > 0n
                  ? "won"
                  : "no_reward",
        },
      ]
    : [];
  const txHistoryView: TxHistoryItem[] = [];
  const hasJoinedTournament = Boolean(participant);
  const hasOpenPosition = Boolean(participant?.position?.is_open);
  const hasClaimableReward = rewardStatus === "Ready to claim";
  const firstTimeUser = Boolean(account) && !hasJoinedTournament && tradeHistory.length === 0;
  const endedUnqualified = Boolean(selectedTournament) && rewardStatus === "Not qualified";
  const primaryArenaAction = hasClaimableReward
    ? "Claim your reward"
    : hasOpenPosition
      ? "Continue trading"
      : hasJoinedTournament
        ? "Open trade terminal"
        : "Start your first arena";
  const adminOverviewMetrics = [
    {
      label: "Upcoming",
      value: String(tournaments.filter((t) => getTournamentLifecycleState(t, now) === "Upcoming").length),
      meta: "Tournaments waiting to open",
    },
    {
      label: "Live",
      value: String(tournaments.filter((t) => getTournamentLifecycleState(t, now) === "Live").length),
      meta: "Tournaments accepting trades",
      tone: "positive" as const,
    },
    {
      label: "Pending Settlement",
      value: String(tournaments.filter((t) => getTournamentLifecycleState(t, now) === "Settling").length),
      meta: "Need admin chain action",
      tone: "warning" as const,
    },
    {
      label: "Claim Open",
      value: String(tournaments.filter((t) => getTournamentLifecycleState(t, now) === "Claim Open").length),
      meta: "Winners can withdraw now",
    },
  ];

  const vaultCards = participant
    ? [
        {
          label: "Current Vault",
          value: toBigIntValue(participant.final_value).toLocaleString(),
          meta: "Tournament score",
        },
        {
          label: "Total Profit / Loss",
          value: formatSigned(participant.realized_pnl),
          tone:
            toBigIntValue(participant.realized_pnl) > 0n
              ? ("positive" as const)
              : toBigIntValue(participant.realized_pnl) < 0n
                ? ("negative" as const)
                : ("default" as const),
          meta: "Closed trades",
        },
        {
          label: "Return %",
          value: formatPercentBps(participant.return_percentage_bps),
          tone:
            toBigIntValue(participant.return_percentage_bps) > 0n
              ? ("positive" as const)
              : toBigIntValue(participant.return_percentage_bps) < 0n
                ? ("negative" as const)
                : ("default" as const),
          meta: "Leaderboard score",
        },
        {
          label: "Tournaments",
          value: "1",
          meta: "Current joined arena",
        },
      ]
    : [
        { label: "Current Vault", value: "—", meta: "Join a tournament" },
        { label: "Total Profit / Loss", value: "—", meta: "No active trades" },
        { label: "Return %", value: "—", meta: "No score yet" },
        { label: "Tournaments", value: "0", meta: "Not joined" },
      ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-100">
      <AnimatePresence>
        {toasts.length ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4"
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} tone={toast.tone} message={toast.message} />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AppShell
        navItems={shellNavItems}
        mobileNavItems={shellNavItems}
        activeKey={shellActiveKey}
        sidebarFooter={
          <div className="rounded-[10px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
              How it works
            </p>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <p>1. Pick a tournament</p>
              <p>2. Trade BTC with virtual balance</p>
              <p>3. Top Return % wins real VARA</p>
            </div>
          </div>
        }
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-4 sm:px-6 lg:px-6 lg:pb-8 lg:pt-6">
          <TopBar
            title={pageTitle}
            right={
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <PriceTicker
                    label="BTC/USD"
                    price={livePriceValue ? `$${livePriceValue.toLocaleString()}` : "BTC --"}
                    change={`${livePriceChange24h >= 0 ? "+" : ""}${livePriceChange24h.toFixed(2)}%`}
                  />
                </div>
                {!account ? (
                  <div className="relative shrink-0">
                    <Button
                      variant="primary"
                      onClick={handleConnectWallet}
                      disabled={walletStatus === "loading" || wallets.length === 0}
                    >
                      {walletStatus === "loading" ? "Loading Wallets" : "Connect Wallet"}
                    </Button>
                    {walletPickerOpen && wallets.length > 1 ? (
                      <div className="surface-card absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[220px] space-y-2 p-3">
                        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                          Choose Wallet
                        </p>
                        {wallets.map((source) => (
                          <Button
                            key={source}
                            variant="secondary"
                            fullWidth
                            className="justify-start"
                            onClick={() => {
                              setWalletPickerOpen(false);
                              connectWallet(source);
                            }}
                          >
                            {source}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <WalletPill
                    accountName={account.meta.name ?? "Wallet"}
                    address={account.address}
                    balance={balance}
                    isAdmin={isAdmin}
                    accounts={accounts}
                    selectedAddress={account.address}
                    onSelectAddress={(address) => {
                      const next = accounts.find((candidate) => candidate.address === address);
                      if (next) selectAccount(next);
                    }}
                    onDisconnect={disconnect}
                  />
                )}
              </div>
            }
          />

          <div className="mt-6">
            {banner ? (
              <div className="mb-6">
                <Notice tone={banner.tone}>{banner.message}</Notice>
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRouteKey}
                variants={stagger}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
                className="space-y-6"
              >
          {route.page === "home" ? (
            <>
              <motion.section variants={fadeUp}>
                <div className="relative overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-[var(--panel)] px-6 py-8 sm:px-8 sm:py-8">
                  <BGPattern
                    variant="grid"
                    mask="fade-edges"
                    size={28}
                    fill="rgba(103,247,177,0.05)"
                    className="opacity-60"
                  />
                  <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
                    <div className="space-y-5">
                      <div className="inline-flex rounded-full border border-[var(--border-hi)] bg-[rgba(103,247,177,0.06)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-strong)]">
                        {hasClaimableReward
                          ? "Claim ready"
                          : hasOpenPosition
                            ? "Active arena"
                            : firstTimeUser
                              ? "First arena"
                              : "Control centre"}
                      </div>
                      <div className="inline-flex">
                        <PriceTicker
                          label="BTC/USD"
                          price={livePriceValue ? `$${livePriceValue.toLocaleString()}` : "BTC --"}
                          change={`${livePriceChange24h >= 0 ? "+" : ""}${livePriceChange24h.toFixed(2)}%`}
                        />
                      </div>
                      <AnimatedText
                        text="Compete in BTC Trading Tournaments"
                        className="items-start"
                        textClassName="text-left text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-4xl"
                        underlineClassName="text-[var(--primary)]"
                      />
                      <p className="max-w-xl text-base leading-7 text-[var(--muted)]">
                        {hasClaimableReward
                          ? "Your arena is settled. Review your final result and claim the exact VARA reward now."
                          : hasOpenPosition
                            ? "Your arena is live. Keep trading with virtual balance while the leaderboard updates around the tournament price."
                            : endedUnqualified
                              ? "This arena finished without a qualifying trade. Review the result and jump into the next tournament."
                              : firstTimeUser
                                ? "Choose an arena, join with VARA, and place your first paper BTC trade to qualify for rewards."
                                : "Trade with virtual balance. Win real VARA from an on-chain prize pool."}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {!account ? (
                          <Button
                            variant="primary"
                            onClick={handleConnectWallet}
                            disabled={walletStatus === "loading" || wallets.length === 0}
                          >
                            Connect Wallet
                          </Button>
                        ) : hasClaimableReward ? (
                          <Button variant="primary" onClick={() => setRoute({ page: "rewards" })}>
                            Claim Reward
                          </Button>
                        ) : hasJoinedTournament ? (
                          <Button variant="primary" onClick={() => setRoute(tradeRoute)}>
                            Continue Trading
                          </Button>
                        ) : (
                          <Button variant="primary" onClick={() => setRoute({ page: "tournaments" })}>
                            Start Your First Arena
                          </Button>
                        )}
                        <Button variant="secondary" onClick={() => setRoute({ page: "tournaments" })}>
                          View Arenas
                        </Button>
                      </div>
                      {account ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <InfoStat
                            label="Current Rank"
                            value={participantLeaderboardEntry ? `#${participantLeaderboardEntry.rank}` : "—"}
                            inverted
                          />
                          <InfoStat
                            label="PnL %"
                            value={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                            inverted
                          />
                          <InfoStat
                            label="Virtual Balance"
                            value={participant ? toBigIntValue(participant.final_value).toLocaleString() : "—"}
                            inverted
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      {hasClaimableReward ? (
                        <ClaimCard
                          title="Claim your arena reward"
                          status="Settlement complete. Your payout is ready on-chain."
                          reward={rewardAmountLabel}
                          rank={rewardRankLabel}
                          returnPct={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                          tone="claimable"
                          action={
                            <Button
                              variant="primary"
                              onClick={() => {
                                claimRewardMutation.reset();
                                claimRewardMutation.mutate();
                              }}
                              disabled={!canClaimReward || claimRewardMutation.isPending}
                            >
                              {claimRewardMutation.isPending ? "Claiming..." : "Claim Reward"}
                            </Button>
                          }
                        />
                      ) : (
                        <div className="product-card p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="section-kicker">Live Arena Summary</p>
                              <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                                {selectedTournament?.name ?? "No arena selected"}
                              </p>
                            </div>
                            {selectedTournamentState ? (
                              <UiStatusPill kind={selectedTournamentStatusKind} label={selectedTournamentStatusLabel} />
                            ) : null}
                          </div>
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <InfoStat label="Prize Pool" value={selectedTournament ? formatPlanck(selectedTournament.prize_pool) : "—"} inverted />
                            <InfoStat label="Participants" value={selectedTournament ? `${selectedTournament.participant_count}/${selectedTournament.max_participants}` : "—"} inverted />
                            <InfoStat label="Countdown" value={selectedTournament ? describeCountdown(selectedTournament.start_time, selectedTournament.end_time, now) : "Choose an arena"} inverted />
                            <InfoStat label="Scoring" value="Top Return %" inverted />
                          </div>
                          <div className="mt-4 rounded-[14px] border border-[var(--border-soft)] bg-[rgba(8,20,15,0.66)] p-4">
                            <p className="text-sm font-semibold text-[var(--text)]">{primaryArenaAction}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                              {firstTimeUser
                                ? "Every trader starts with the same virtual balance. One valid trade qualifies you for rewards."
                                : "Live arenas stay fair by scoring every position against the same tournament price feed."}
                            </p>
                          </div>
                        </div>
                      )}

                      {endedUnqualified ? (
                        <ClaimCard
                          title="Not qualified"
                          status="No trades were placed, so this arena did not qualify for reward ranking."
                          reward="No reward available for this tournament"
                          rank="—"
                          returnPct={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                          tone="warning"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={fadeUp}>
                {firstTimeUser ? (
                  <div className="space-y-4">
                    <div>
                      <p className="section-kicker">Start your first arena</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Follow the first-time flow once. After your first trade, the app becomes a live control centre.
                      </p>
                    </div>
                    <ProgressTracker
                      steps={[
                        { id: "01", title: "Choose arena", copy: "Compare prize pools, timing, and entry fee.", active: !hasJoinedTournament },
                        { id: "02", title: "Join with VARA", copy: "Pay the exact entry fee to lock your seat.", active: hasJoinedTournament && tradeHistory.length === 0, done: hasJoinedTournament },
                        { id: "03", title: "Place your first paper trade", copy: "Open one valid long or short position to qualify.", active: hasJoinedTournament && tradeHistory.length === 0, done: tradeHistory.length > 0 },
                      ]}
                    />
                    <div className="product-card p-5">
                      <p className="section-kicker">How scoring works</p>
                      <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
                        <p>All traders begin with the same virtual balance.</p>
                        <p>Return % is calculated from the tournament price used for scoring, not your wallet balance.</p>
                        <p>At least one valid trade is required to qualify for rewards.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <StepCards />
                )}
              </motion.section>

              <motion.section variants={fadeUp}>
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="product-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Current Focus</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text)]">What to do next</p>
                      </div>
                      <ClockCountdown size={18} className="text-[var(--primary-strong)]" />
                    </div>
                    <div className="mt-4 rounded-[14px] border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                      <p className="text-base font-semibold text-[var(--text)]">{primaryArenaAction}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {hasClaimableReward
                          ? "Open the rewards view to claim your payout and review the final leaderboard."
                          : hasOpenPosition
                            ? "Your PnL updates from the tournament price. Watch the chart and manage risk before the timer ends."
                            : selectedTournament
                              ? "This arena is ready. Join, place a trade, and qualify for the prize pool."
                              : "No arena is selected yet. Browse arenas and pick the one you want to play."}
                      </p>
                    </div>
                  </div>

                  <div className="product-card p-5">
                    <p className="section-kicker">Glossary</p>
                    <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                      <p><span className="font-semibold text-[var(--text)]">Paper trading:</span> positions use virtual balance only.</p>
                      <p><span className="font-semibold text-[var(--text)]">Prize pool:</span> real VARA collected from entry fees.</p>
                      <p><span className="font-semibold text-[var(--text)]">Return %:</span> the score used to rank traders fairly.</p>
                      <p><span className="font-semibold text-[var(--text)]">Settlement:</span> the moment final winners and payouts are locked on-chain.</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={fadeUp}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="section-kicker">Featured Arenas</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Join a BTC arena, place a qualifying trade, and push for the top Return %.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setRoute({ page: "tournaments" })}>
                      View All
                    </Button>
                  </div>
                  {renderMutationNotice(joinMutation, {
                    pending: "Join transaction submitted...",
                    success: "Joined tournament.",
                  })}
                  {tournamentsQuery.isLoading ? (
                    <CardSkeletonGrid count={3} />
                  ) : featuredTournaments.length ? (
                    <div className="space-y-3">
                      {featuredTournaments.map((tournament) => (
                        <FeatureTournamentRow
                          key={tournament.tournament_id}
                          tournament={tournament}
                          statusLabel={mapStatusLabel(getTournamentLifecycleState(tournament, now))}
                          statusKind={mapStatusKind(getTournamentLifecycleState(tournament, now))}
                          entryFee={formatPlanck(tournament.entry_fee)}
                          prizePool={formatPlanck(tournament.prize_pool)}
                          players={`${tournament.participant_count}/${tournament.max_participants}`}
                          timeLeft={describeCountdown(tournament.start_time, tournament.end_time, now)}
                          endsAt={formatTimestamp(tournament.end_time)}
                          primaryLabel="Trade"
                          onPrimary={() => openTournament(tournament.tournament_id)}
                          secondaryLabel="Enter"
                          secondaryDisabled={Boolean(
                            getJoinReason(tournament, now, txAccount, hasProgramId, walletActionReason),
                          ) || joinMutation.isPending}
                          secondaryTitle={
                            getJoinReason(tournament, now, txAccount, hasProgramId, walletActionReason) ?? undefined
                          }
                          onSecondary={() => {
                            joinMutation.reset();
                            joinMutation.mutate(tournament);
                          }}
                          active={selectedTournamentId === tournament.tournament_id}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyStatePanel
                      eyebrow="Arenas"
                      title="No arenas are live right now"
                      copy="When the next BTC tournament opens, you will be able to review prize pool, timing, and entry fee here."
                      action={<Button variant="secondary" onClick={() => setRoute({ page: "admin" })}>View Admin Status</Button>}
                    />
                  )}
                </div>
              </motion.section>
            </>
          ) : null}

          {route.page === "tournaments" ? (
            <motion.section variants={fadeUp}>
              <Section
                title="Arenas"
                subtitle="Review timing, prize pool, and entry fee. Join once, place at least one trade, and qualify for rewards."
                action={
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {tournaments.length ? `${tournaments.length} available` : "No arenas"}
                  </span>
                }
              >
                {tournamentsQuery.isLoading ? <CardSkeletonGrid count={6} /> : null}
                {tournamentsQuery.error ? (
                  <Notice tone="error">{extractErrorMessage(tournamentsQuery.error)}</Notice>
                ) : null}
                {renderMutationNotice(joinMutation, {
                  pending: "Join transaction submitted...",
                  success: "Joined tournament.",
                })}
                {!tournaments.length && !tournamentsQuery.isLoading ? (
                  <EmptyStatePanel
                    eyebrow="Arenas"
                    title="No arenas are available"
                    copy="When the next BTC tournament opens, this screen will show entry fee, timing, prize pool, and the action to join."
                  />
                ) : null}
                <div className="space-y-3">
                  {tournaments.map((tournament) => (
                    <FeatureTournamentRow
                      key={tournament.tournament_id}
                      tournament={tournament}
                      statusLabel={mapStatusLabel(getTournamentLifecycleState(tournament, now))}
                      statusKind={mapStatusKind(getTournamentLifecycleState(tournament, now))}
                      entryFee={formatPlanck(tournament.entry_fee)}
                      prizePool={formatPlanck(tournament.prize_pool)}
                      players={`${tournament.participant_count}/${tournament.max_participants}`}
                      timeLeft={describeCountdown(tournament.start_time, tournament.end_time, now)}
                      endsAt={formatTimestamp(tournament.end_time)}
                      primaryLabel="Trade"
                      onPrimary={() => openTournament(tournament.tournament_id)}
                      secondaryLabel="Enter"
                      secondaryDisabled={Boolean(
                        getJoinReason(tournament, now, txAccount, hasProgramId, walletActionReason),
                      ) || joinMutation.isPending}
                      secondaryTitle={
                        getJoinReason(tournament, now, txAccount, hasProgramId, walletActionReason) ?? undefined
                      }
                      onSecondary={() => {
                        joinMutation.reset();
                        joinMutation.mutate(tournament);
                      }}
                      active={selectedTournamentId === tournament.tournament_id}
                    />
                  ))}
                </div>
              </Section>
            </motion.section>
          ) : null}

          {route.page === "tournament" || route.page === "trade" ? (
            <motion.section variants={fadeUp}>
              {!selectedTournament ? (
                <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                  <p className="section-kicker">Trade</p>
                  <Notice tone="warning">Open a tournament from the tournaments page.</Notice>
                </div>
              ) : (
                <div className="space-y-6">
                  {participantQuery.isLoading && account ? (
                    <Notice tone="info">Loading your tournament state...</Notice>
                  ) : null}
                  {participantNotFound && account ? (
                    <Notice tone="warning">Join this tournament to unlock your trading terminal.</Notice>
                  ) : null}
                  {participantQuery.error && !participantNotFound ? (
                    <Notice tone="error">{extractErrorMessage(participantQuery.error)}</Notice>
                  ) : null}
                  {!account ? (
                    <Notice tone="warning">Connect a wallet to view your vault and start trading.</Notice>
                  ) : null}

                  {renderMutationNotice(joinMutation, {
                    pending: "Join transaction submitted...",
                    success: "Joined tournament.",
                  })}
                  {renderMutationNotice(openPositionMutation, {
                    pending: "Submitting position...",
                    success: "Position opened.",
                  })}
                  {renderMutationNotice(closePositionMutation, {
                    pending: "Closing position...",
                    success: "Position closed.",
                  })}

                  {!participant ? (
                    <div className="flex">
                      <Button
                        variant="primary"
                        onClick={() => {
                          joinMutation.reset();
                          joinMutation.mutate(selectedTournament);
                        }}
                        disabled={
                          Boolean(
                            getJoinReason(
                              selectedTournament,
                              now,
                              txAccount,
                              hasProgramId,
                              walletActionReason,
                            ),
                          ) || joinMutation.isPending
                        }
                        title={
                          getJoinReason(
                            selectedTournament,
                            now,
                            txAccount,
                            hasProgramId,
                            walletActionReason,
                          ) ?? undefined
                        }
                      >
                        Join Tournament
                      </Button>
                    </div>
                  ) : null}

                  {selectedTournamentState === "Settling" ? (
                    <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="section-kicker">Tournament Complete</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            Trading is now closed. {isAdmin
                              ? "Finalize the leaderboard and open claims for winners."
                              : "The admin is finalizing settlement and prize distribution."}
                          </p>
                        </div>
                        {lifecycleActionAvailable ? (
                          <Button
                            variant="primary"
                            onClick={() => {
                              tournamentLifecycleMutation.reset();
                              tournamentLifecycleMutation.mutate();
                            }}
                            disabled={tournamentLifecycleMutation.isPending}
                          >
                            {tournamentLifecycleMutation.isPending ? "Finalizing..." : lifecycleActionLabel}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <MarketHeader
                      title={selectedTournament.name}
                      livePrice={livePriceValue ? `$${livePriceValue.toLocaleString()}` : "$0"}
                      tournamentPrice={`$${currentPriceValue.toLocaleString()}`}
                      syncStatus={syncStatusLabel}
                      timeLeft={describeCountdown(selectedTournament.start_time, selectedTournament.end_time, now)}
                      statusKind={selectedTournamentStatusKind}
                      statusLabel={selectedTournamentStatusLabel}
                    />

                    <div className="grid gap-3 md:grid-cols-4">
                      <InfoPanel title="Current Rank" value={participantLeaderboardEntry ? `#${participantLeaderboardEntry.rank}` : "—"} />
                      <InfoPanel title="PnL %" value={participant ? formatPercentBps(participant.return_percentage_bps) : "—"} />
                      <InfoPanel title="Virtual Balance" value={participant ? toBigIntValue(participant.final_value).toLocaleString() : "—"} />
                      <div className="product-card-soft p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">Qualification</p>
                        <div className="mt-3">
                          <QualificationBadge qualified={participantQualified} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <TradingChart
                      livePrice={livePriceValue ? `$${livePriceValue.toLocaleString()}` : "$0"}
                      liveChange={`${livePriceChange24h >= 0 ? "+" : ""}${livePriceChange24h.toFixed(2)}%`}
                      tournamentPrice={`$${currentPriceValue.toLocaleString()}`}
                      priceHistory={liveHistory}
                      tournamentPriceValue={currentPriceValue}
                      entryPriceValue={
                        participant?.position?.is_open
                          ? toBigIntValue(participant.position.entry_price)
                          : null
                      }
                    />
                    <OrderPanel
                      tournamentName={selectedTournament.name}
                      timeLeft={describeCountdown(selectedTournament.start_time, selectedTournament.end_time, now)}
                      prizePool={formatPlanck(selectedTournament.prize_pool)}
                      direction={tradeDirection}
                      onDirectionChange={setTradeDirection}
                      size={tradeSize}
                      onSizeChange={setTradeSize}
                      availableBalance={participant ? toBigIntValue(participant.final_value).toLocaleString() : "Join to unlock"}
                      entryPrice={`$${currentPriceValue.toLocaleString()}`}
                      currentPrice={`$${livePriceValue.toLocaleString()}`}
                      estimatedPnl={{
                        value: formatSigned(estimatedTradePnl),
                        tone: estimatedTradePnl > 0n ? "positive" : estimatedTradePnl < 0n ? "negative" : "default",
                      }}
                      actionLabel={tradeDirection === "Long" ? "Open Long Position" : "Open Short Position"}
                      actionVariant={tradeDirection === "Long" ? "positive" : "danger"}
                      onAction={handleOpenPosition}
                      actionDisabled={Boolean(getTradingDisabledReason(selectedTournament, participant, now)) || openPositionMutation.isPending || Boolean(participant?.position?.is_open)}
                      secondaryActionLabel={participant?.position?.is_open ? "Close Position" : undefined}
                      onSecondaryAction={
                        participant?.position?.is_open
                          ? () => {
                              closePositionMutation.reset();
                              closePositionMutation.mutate();
                            }
                          : undefined
                      }
                      secondaryDisabled={!participant?.position?.is_open || closePositionMutation.isPending}
                      helper={tournamentPriceHelperText}
                      warning={tradeFormError ?? getTradingDisabledReason(selectedTournament, participant, now) ?? undefined}
                    />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                        <p className="section-kicker">My Vault</p>
                        <div className="mt-4">
                          <VaultStats cards={vaultCards} />
                        </div>
                        <div className="mt-4">
                          <RewardPanel
                            rankLabel={rewardRankLabel}
                            returnLabel={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                            rewardLabel={rewardAmountLabel}
                            statusLabel={rewardStatus}
                          />
                        </div>
                        {renderMutationNotice(claimRewardMutation, {
                          pending: "Claiming reward...",
                          success: claimRewardMutation.data
                            ? `Reward claimed: ${formatPlanck(claimRewardMutation.data)}`
                            : "Reward claimed.",
                        })}
                        {participant ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                claimRewardMutation.reset();
                                claimRewardMutation.mutate();
                              }}
                              disabled={!canClaimReward || claimRewardMutation.isPending}
                            >
                              {claimRewardMutation.isPending ? "Claiming..." : "Claim Reward"}
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                        <p className="section-kicker">Open Position</p>
                        <div className="mt-4">
                          <PositionCard
                            hasPosition={Boolean(participant?.position?.is_open)}
                            direction={participant?.position?.direction ?? null}
                            size={participant?.position ? toBigIntValue(participant.position.size).toLocaleString() : null}
                            entryPrice={
                              participant?.position
                                ? `$${toBigIntValue(participant.position.entry_price).toLocaleString()}`
                                : null
                            }
                            currentPrice={`$${currentPriceValue.toLocaleString()}`}
                            unrealizedPnl={
                              participant
                                ? {
                                    label: formatSigned(participant.unrealized_pnl),
                                    positive: toBigIntValue(participant.unrealized_pnl) > 0n,
                                    negative: toBigIntValue(participant.unrealized_pnl) < 0n,
                                    key: participant.unrealized_pnl,
                                  }
                                : null
                            }
                            returnPct={
                              participant
                                ? {
                                    label: formatPercentBps(participant.return_percentage_bps),
                                    positive: toBigIntValue(participant.return_percentage_bps) > 0n,
                                    negative: toBigIntValue(participant.return_percentage_bps) < 0n,
                                    key: participant.return_percentage_bps,
                                  }
                                : null
                            }
                            onClose={() => {
                              closePositionMutation.reset();
                              closePositionMutation.mutate();
                            }}
                            closePending={closePositionMutation.isPending}
                          />
                        </div>
                      </div>

                      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                        <p className="section-kicker">Leaderboard</p>
                        <div className="mt-4">
                          {leaderboardQuery.isLoading ? <LeaderboardSkeleton count={5} /> : null}
                          {leaderboardQuery.error ? (
                            <Notice tone="error">{extractErrorMessage(leaderboardQuery.error)}</Notice>
                          ) : null}
                          {!leaderboardQuery.isLoading && !leaderboardEntries.length ? (
                            <EmptyState
                              title="Leaderboard waiting for traders"
                              copy="Ranks appear as soon as participants join the tournament and open positions."
                            />
                          ) : null}
                          {leaderboardEntries.length ? (
                            <LeaderboardPanel podium={leaderboardPodium} rows={leaderboardRows} />
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                        <p className="section-kicker">Trade History</p>
                        <div className="mt-4">
                          <TradeHistoryPanel history={tradeHistory} currentPrice={currentPriceValue} />
                        </div>
                      </div>

                      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                        <p className="section-kicker">Rules</p>
                        <div className="mt-4 space-y-4">
                          <FairTradingRulesCard />
                          <InfoPanel title="Prize Split" value="60% / 30% / 10%" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          ) : null}

          {route.page === "leaderboard" ? (
            <motion.section variants={fadeUp}>
              <div className="space-y-4">
                <ArenaCard glow className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker">Leaderboard</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Qualified Traders Only</h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Ranked by Return %. At least one valid trade is required to appear in reward positions.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <UiStatusPill kind={selectedTournamentStatusKind} label={selectedTournamentStatusLabel} />
                      <UiStatusPill
                        kind={selectedTournamentState === "Live" ? "live" : selectedTournamentState === "Settling" ? "settling" : "idle"}
                        label={selectedTournament ? describeCountdown(selectedTournament.start_time, selectedTournament.end_time, now) : "No arena"}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <TournamentSelector
                      tournaments={tournaments}
                      selectedTournamentId={selectedTournamentId}
                      onSelect={setSelectedTournamentId}
                    />
                  </div>
                </ArenaCard>

                {selectedTournament ? (
                  <>
                    <div className="grid gap-4 xl:grid-cols-4">
                      <LiveRankCard
                        label="Current Rank"
                        value={participantLeaderboardEntry?.rank ?? 0}
                        caption={participantLeaderboardEntry ? "Among qualified traders" : "Unranked"}
                        kind="rank"
                      />
                      <LiveRankCard
                        label="PnL %"
                        value={participant ? Number(participant.return_percentage_bps) / 100 : 0}
                        caption="Live tournament score"
                        tone={participant && toBigIntValue(participant.return_percentage_bps) > 0n ? "positive" : participant && toBigIntValue(participant.return_percentage_bps) < 0n ? "negative" : "default"}
                        kind="pnl"
                      />
                      <LiveRankCard
                        label="Trade Count"
                        value={currentUserTradeCount}
                        caption="Valid trades placed"
                        kind="trades"
                      />
                      <ArenaCard className="min-h-[160px]" glow={participantQualified}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">Qualification</p>
                            <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                              {participantQualified ? "Qualified" : "Not Qualified"}
                            </p>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              {participantQualified ? "Eligible for reward ranking." : "Place at least one trade to qualify."}
                            </p>
                          </div>
                          <QualificationBadge qualified={participantQualified} />
                        </div>
                      </ArenaCard>
                    </div>

                    {leaderboardQuery.isLoading ? <LeaderboardSkeleton count={5} /> : null}
                    {leaderboardQuery.error ? (
                      <Notice tone="error">{extractErrorMessage(leaderboardQuery.error)}</Notice>
                    ) : null}

                    {!leaderboardUiEntries.length && !leaderboardQuery.isLoading ? (
                      <EmptyStatePanel
                        eyebrow="Leaderboard"
                        title="No qualified traders yet"
                        copy="No trader has placed a qualifying trade yet. Join the arena and place your first paper trade."
                        action={<Button variant="primary" onClick={() => openTournament(selectedTournament.tournament_id)}>Place your first trade</Button>}
                      />
                    ) : null}

                    {leaderboardUiEntries.length ? (
                      <ArenaCard className="p-5">
                        <GlowTable
                          header={
                            <div className="grid gap-3 md:grid-cols-[72px_1.4fr_0.9fr_0.9fr_0.8fr_0.9fr]">
                              <span>Rank</span>
                              <span>Trader</span>
                              <span>PnL %</span>
                              <span>Trades</span>
                              <span>Vault</span>
                              <span>Reward</span>
                            </div>
                          }
                          rows={leaderboardUiEntries.map((entry) => ({
                            key: `${entry.rank}-${entry.address}`,
                            highlight: Boolean(entry.isCurrentUser),
                            podium: entry.rank <= 3 ? (entry.rank as 1 | 2 | 3) : undefined,
                            content: (
                              <div className="grid gap-4 md:grid-cols-[72px_1.4fr_0.9fr_0.9fr_0.8fr_0.9fr] md:items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-[var(--text)]">#{entry.rank}</span>
                                  {entry.isCurrentUser ? (
                                    <span className="rounded-full bg-[rgba(28,203,120,0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-strong)]">
                                      You
                                    </span>
                                  ) : null}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[var(--text)]">{shortAddress(entry.address)}</p>
                                  <p className="mt-1 text-xs text-[var(--muted)]">{entry.agentName ?? "Arena trader"}</p>
                                </div>
                                <p className={`font-mono text-sm font-semibold tabular-nums ${entry.pnlPercent >= 0 ? "text-[var(--primary-strong)]" : "text-[var(--short)]"}`}>
                                  {entry.pnlPercent >= 0 ? "+" : ""}{entry.pnlPercent.toFixed(2)}%
                                </p>
                                <p className="font-mono text-sm text-[var(--text)] tabular-nums">{entry.tradeCount}</p>
                                <p className="font-mono text-sm text-[var(--text)] tabular-nums">{entry.virtualBalance.toLocaleString()}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <QualificationBadge qualified={entry.isQualified} />
                                  {entry.rewardEstimate ? (
                                    <span className="rounded-full bg-[rgba(28,203,120,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary-strong)]">
                                      {entry.rewardEstimate}% pool
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ),
                          }))}
                        />
                      </ArenaCard>
                    ) : null}

                    {notQualifiedUiEntries.length ? (
                      <ArenaCard className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="section-kicker">Not Qualified</p>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              Traders below did not place a valid trade and are excluded from reward ranking.
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {notQualifiedUiEntries.map((entry) => (
                            <div
                              key={`inactive-${entry.address}`}
                              className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-4 py-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--text)]">{shortAddress(entry.address)}</p>
                                  <p className="mt-1 text-xs text-[var(--muted)]">Not qualified: no trades placed</p>
                                </div>
                                <QualificationBadge qualified={false} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ArenaCard>
                    ) : null}
                  </>
                ) : (
                  <EmptyStatePanel
                    eyebrow="Leaderboard"
                    title="Select an arena"
                    copy="Choose an arena to see the qualified ranking, reward positions, and inactive traders."
                  />
                )}
              </div>
            </motion.section>
          ) : null}

          {route.page === "rewards" ? (
            <motion.section variants={fadeUp}>
              <div className="space-y-4">
                <div className="product-card p-5">
                  <p className="section-kicker">Rewards</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Review your final rank, qualification status, and exact claimable VARA for each arena.
                  </p>
                </div>
                {!account ? (
                  <EmptyStatePanel
                    eyebrow="Rewards"
                    title="Connect a wallet to track rewards"
                    copy="Claimable rewards, final PnL, and settled payout status appear here after you finish an arena."
                    action={
                      <Button
                        variant="primary"
                        onClick={handleConnectWallet}
                        disabled={walletStatus === "loading" || wallets.length === 0}
                      >
                        Connect Wallet
                      </Button>
                    }
                  />
                ) : !selectedTournament ? (
                  <EmptyStatePanel
                    eyebrow="Rewards"
                    title="No arena selected"
                    copy="Pick an arena to see whether you qualified, what you earned, and whether claims are open."
                    action={<Button variant="secondary" onClick={() => setRoute({ page: "tournaments" })}>Browse Arenas</Button>}
                  />
                ) : (
                  <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                    <ClaimCard
                      title={selectedTournament.name}
                      status={
                        rewardStatus === "Ready to claim"
                          ? "Status: Ready to claim"
                          : rewardStatus === "Claimed"
                            ? "Status: Claimed"
                            : rewardStatus === "Not qualified"
                              ? "Not qualified — no trades placed"
                              : rewardStatus === "Not eligible"
                                ? "No reward available for this tournament"
                                : `Status: ${rewardStatus}`
                      }
                      reward={rewardAmountLabel}
                      rank={rewardRankLabel}
                      returnPct={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                      tone={hasClaimableReward ? "claimable" : rewardStatus === "Not qualified" ? "warning" : "default"}
                      action={
                        canClaimReward ? (
                          <Button
                            variant="primary"
                            onClick={() => {
                              claimRewardMutation.reset();
                              claimRewardMutation.mutate();
                            }}
                            disabled={!canClaimReward || claimRewardMutation.isPending}
                          >
                            {claimRewardMutation.isPending ? "Claiming..." : "Claim Reward"}
                          </Button>
                        ) : undefined
                      }
                    />
                    <div className="product-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-kicker">Qualification</p>
                          <p className="mt-2 text-lg font-semibold text-[var(--text)]">Reward rules</p>
                        </div>
                        <QualificationBadge
                          qualified={participantQualified}
                          label={participantQualified ? "Qualified for ranking" : "Not qualified"}
                        />
                      </div>
                      <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                        <p>At least one valid trade is required to qualify for reward ranking.</p>
                        <p>Qualified traders are ranked by Return %. Ties resolve by trade activity and earlier ranking order.</p>
                        <p>Claims open only after the arena is fully settled on-chain.</p>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <InfoPanel title="Settlement State" value={selectedTournamentStatusLabel} />
                        <InfoPanel title="Claim Status" value={rewardStatus} />
                        <InfoPanel title="Prize Pool" value={formatPlanck(selectedTournament.prize_pool)} />
                        <InfoPanel title="Your Result" value={participant ? formatSigned(participant.realized_pnl) : "—"} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          ) : null}

          {route.page === "vault" ? (
            <motion.section variants={fadeUp}>
              <div className="space-y-4">
                <ArenaCard glow className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker">My Vault</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Personal Command Centre</h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Track wallet status, claimable rewards, active paper trades, and completed arena outcomes in one place.
                      </p>
                    </div>
                    {account ? <UiStatusPill kind="active" label="Connected" /> : null}
                  </div>
                </ArenaCard>
                {!account ? (
                  <EmptyStatePanel
                    eyebrow="Vault"
                    title="Connect a wallet to open your vault"
                    copy="Your personal vault shows rewards, active positions, tournament history, and transaction activity after you connect."
                    action={
                      <Button
                        variant="primary"
                        onClick={handleConnectWallet}
                        disabled={walletStatus === "loading" || wallets.length === 0}
                      >
                        Connect Wallet
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <TournamentSelector
                      tournaments={tournaments}
                      selectedTournamentId={selectedTournamentId}
                      onSelect={setSelectedTournamentId}
                    />
                    {selectedTournament ? (
                      <div className="mt-5 space-y-4">
                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                          <ArenaCard className="p-5" glow>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="section-kicker">Wallet Summary</p>
                                <p className="mt-2 text-lg font-semibold text-[var(--text)]">{shortAddress(vaultSummaryView.walletAddress)}</p>
                              </div>
                              <Button variant="secondary" onClick={() => openTournament(selectedTournament.tournament_id)}>
                                Open Arena
                              </Button>
                            </div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="VARA Balance" value={Number(balance ?? 0)} suffix=" VARA" decimals={2} />
                              </div>
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="Claimable Rewards" value={vaultSummaryView.totalClaimableRewards} suffix=" VARA" decimals={2} tone="positive" />
                              </div>
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="Claimed Rewards" value={vaultSummaryView.totalClaimedRewards} suffix=" VARA" decimals={2} />
                              </div>
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="Active Positions" value={vaultSummaryView.activePositions} />
                              </div>
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="Completed Arenas" value={vaultSummaryView.completedTournaments} />
                              </div>
                              <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-4">
                                <AnimatedStat label="Current Rank" value={participantLeaderboardEntry?.rank ?? 0} caption={participantLeaderboardEntry ? "Qualified board" : "Not ranked"} />
                              </div>
                            </div>
                          </ArenaCard>

                          <RewardCard
                            title={claimableRewardsView[0]?.tournamentName ?? selectedTournament.name}
                            amount={rewardAmountLabel}
                            rank={rewardRankLabel}
                            pnlPercent={participant ? formatPercentBps(participant.return_percentage_bps) : "—"}
                            status={
                              claimableRewardsView[0]?.status === "claimable"
                                ? "Ready to claim"
                                : claimableRewardsView[0]?.status === "claimed"
                                  ? "Claimed"
                                  : claimableRewardsView[0]?.status === "claiming"
                                    ? "Claiming..."
                                    : "No reward available"
                            }
                            claimable={hasClaimableReward}
                            action={
                              canClaimReward ? (
                                <Button
                                  variant="primary"
                                  onClick={() => {
                                    claimRewardMutation.reset();
                                    claimRewardMutation.mutate();
                                  }}
                                  disabled={!canClaimReward || claimRewardMutation.isPending}
                                >
                                  {claimRewardMutation.isPending ? "Claiming..." : "Claim VARA"}
                                </Button>
                              ) : undefined
                            }
                          />
                        </div>
                        {participantQuery.isLoading ? <Notice tone="info">Loading your vault...</Notice> : null}
                        {participantNotFound ? (
                          <Notice tone="warning">You have not joined this tournament yet.</Notice>
                        ) : null}
                        {participantQuery.error && !participantNotFound ? (
                          <Notice tone="error">{extractErrorMessage(participantQuery.error)}</Notice>
                        ) : null}
                        <div className="grid gap-4 xl:grid-cols-2">
                          <ArenaCard className="p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="section-kicker">Active Positions</p>
                                <p className="mt-2 text-sm text-[var(--muted)]">Open paper trades and their live tournament performance.</p>
                              </div>
                              <UiStatusPill kind={vaultPositionsView.length ? "live" : "idle"} label={vaultPositionsView.length ? "Live position" : "No positions"} />
                            </div>
                            <div className="mt-4 space-y-4">
                              {vaultPositionsView.length ? (
                                vaultPositionsView.map((position) => (
                                  <VaultPositionCard
                                    key={position.id}
                                    title={position.tournamentName}
                                    side={position.side}
                                    entryPrice={`$${position.entryPrice.toLocaleString()}`}
                                    currentPrice={`$${position.currentPrice.toLocaleString()}`}
                                    pnlPercent={`${position.pnlPercent >= 0 ? "+" : ""}${position.pnlPercent.toFixed(2)}%`}
                                    endsAt={position.endsAt}
                                    status={position.status}
                                    action={
                                      participant?.position?.is_open ? (
                                        <Button
                                          variant="secondary"
                                          onClick={() => {
                                            closePositionMutation.reset();
                                            closePositionMutation.mutate();
                                          }}
                                          disabled={closePositionMutation.isPending}
                                        >
                                          {closePositionMutation.isPending ? "Closing..." : "Close Position"}
                                        </Button>
                                      ) : undefined
                                    }
                                  />
                                ))
                              ) : (
                                <EmptyStatePanel
                                  eyebrow="Positions"
                                  title="No active positions"
                                  copy="Open a long or short position in an active arena to start tracking live PnL here."
                                  action={<Button variant="secondary" onClick={() => openTournament(selectedTournament.tournament_id)}>Open Trade Terminal</Button>}
                                />
                              )}
                            </div>
                          </ArenaCard>

                          <ArenaCard className="p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="section-kicker">Tournament History</p>
                                <p className="mt-2 text-sm text-[var(--muted)]">Final outcomes, ranks, and rewards from completed arenas.</p>
                              </div>
                            </div>
                            <div className="mt-4 space-y-3">
                              {tournamentHistoryView.length ? (
                                tournamentHistoryView.map((item) => (
                                  <div key={item.id} className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-4 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-[var(--text)]">{item.tournamentName}</p>
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                          {item.finalRank ? `Final rank #${item.finalRank}` : "No final rank"} · {item.pnlPercent !== null ? `${item.pnlPercent >= 0 ? "+" : ""}${item.pnlPercent.toFixed(2)}%` : "No PnL"}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-mono text-sm font-semibold text-[var(--text)]">{item.rewardEarned.toFixed(2)} VARA</p>
                                        <p className="mt-1 text-xs text-[var(--muted)]">{item.status.replace(/_/g, " ")}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <EmptyStatePanel
                                  eyebrow="History"
                                  title="Join your first arena to build your vault"
                                  copy="Completed arena results, rewards, and final ranks appear here after you trade and settle an arena."
                                />
                              )}
                            </div>
                          </ArenaCard>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                          <ArenaCard className="p-5">
                            <p className="section-kicker">Transaction History</p>
                            <div className="mt-4">
                              {txHistoryView.length ? (
                                <GlowTable
                                  header={
                                    <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr_1fr_1fr]">
                                      <span>Type</span>
                                      <span>Hash</span>
                                      <span>Status</span>
                                      <span>Created</span>
                                    </div>
                                  }
                                  rows={txHistoryView.map((item) => ({
                                    key: item.id,
                                    content: (
                                      <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr_1fr_1fr] md:items-center">
                                        <span className="text-sm font-semibold capitalize text-[var(--text)]">{item.type}</span>
                                        <span className="font-mono text-sm text-[var(--muted)]">{item.hash}</span>
                                        <span className="text-sm text-[var(--text)]">{item.status}</span>
                                        <span className="text-sm text-[var(--muted)]">{item.createdAt}</span>
                                      </div>
                                    ),
                                  }))}
                                />
                              ) : (
                                <EmptyStatePanel
                                  eyebrow="Transactions"
                                  title="No transaction history yet"
                                  copy="Join, trade, settlement, and claim transactions will appear here once the app starts tracking them. TODO: wire explorer hashes when available from chain responses."
                                />
                              )}
                            </div>
                          </ArenaCard>

                          <ArenaCard className="p-5">
                            <p className="section-kicker">Trade History</p>
                            <div className="mt-4">
                              <TradeHistoryPanel history={tradeHistory} currentPrice={currentPriceValue} />
                            </div>
                          </ArenaCard>
                        </div>
                        {renderMutationNotice(claimRewardMutation, {
                          pending: "Claiming reward...",
                          success: claimRewardMutation.data
                            ? `Reward claimed: ${formatPlanck(claimRewardMutation.data)}`
                            : "Reward claimed.",
                        })}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => openTournament(selectedTournament.tournament_id)}>
                            Trade This Tournament
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              claimRewardMutation.reset();
                              claimRewardMutation.mutate();
                            }}
                            disabled={!canClaimReward || claimRewardMutation.isPending}
                          >
                            {claimRewardMutation.isPending ? "Claiming..." : "Claim Reward"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <EmptyStatePanel
                        eyebrow="Vault"
                        title="No arenas are available to inspect yet"
                        copy="Join a BTC arena to start building your vault, rewards, and trade history."
                      />
                    )}
                  </>
                )}
              </div>
            </motion.section>
          ) : null}

          {route.page === "admin" ? (
            <motion.section variants={fadeUp}>
              {!isAdmin ? (
                <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                  <Notice tone="error">You do not have permission to access this page.</Notice>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Admin</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Create tournaments and manage active tournament state.
                        </p>
                      </div>
                      <UiStatusPill kind="admin" label="Admin" />
                    </div>
                  </div>

                  <AdminOverviewPanel metrics={adminOverviewMetrics} />

                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="product-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-kicker">Live Control</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">Price feed health, active arena status, and manual intervention warnings.</p>
                        </div>
                        <AdminAuditBadge label={syncStatusLabel} />
                      </div>
                    </div>
                    <div className="product-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-kicker">Settlements</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">Ending soon and pending settlement arenas are surfaced here first.</p>
                        </div>
                        <AdminAuditBadge label={`${adminOverviewMetrics[2]?.value ?? "0"} pending`} />
                      </div>
                    </div>
                    <div className="product-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-kicker">Claims</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">Track when settled tournaments move into claim-open state for users.</p>
                        </div>
                        <AdminAuditBadge label={`${adminOverviewMetrics[3]?.value ?? "0"} claim open`} />
                      </div>
                    </div>
                  </div>

                  <AdminConsole
                    createForm={
                      <form onSubmit={handleCreateTournament} className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="section-kicker">Create Tournament</p>
                            <h3 className="mt-1 text-lg font-semibold text-slate-50">New event configuration</h3>
                          </div>
                          <RocketLaunch size={22} className="text-slate-500" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Tournament name" className="sm:col-span-2">
                            <input
                              value={createForm.name}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, name: event.target.value }))
                              }
                              className="input-base"
                            />
                          </Field>
                          <Field label="Entry fee (VARA)">
                            <input
                              value={createForm.entryFee}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, entryFee: event.target.value }))
                              }
                              className="input-base"
                            />
                          </Field>
                          <Field label="Initial virtual balance">
                            <input
                              value={createForm.initialVirtualBalance}
                              onChange={(event) =>
                                setCreateForm((current) => ({
                                  ...current,
                                  initialVirtualBalance: event.target.value,
                                }))
                              }
                              className="input-base"
                            />
                          </Field>
                          <Field label="Start time">
                            <input
                              type="datetime-local"
                              value={createForm.startTime}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, startTime: event.target.value }))
                              }
                              className="input-base"
                            />
                          </Field>
                          <Field label="End time">
                            <input
                              type="datetime-local"
                              value={createForm.endTime}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, endTime: event.target.value }))
                              }
                              className="input-base"
                            />
                          </Field>
                          <Field label="Max participants">
                            <input
                              value={createForm.maxParticipants}
                              onChange={(event) =>
                                setCreateForm((current) => ({
                                  ...current,
                                  maxParticipants: event.target.value,
                                }))
                              }
                              className="input-base"
                            />
                          </Field>
                        </div>
                        {createFormError ? <Notice tone="error">{createFormError}</Notice> : null}
                        {renderMutationNotice(createTournamentMutation, {
                          pending: "Creating tournament...",
                          success: createTournamentMutation.data
                            ? `Tournament #${createTournamentMutation.data.tournament_id} created.`
                            : "Tournament created.",
                        })}
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={createTournamentMutation.isPending || !hasProgramId}
                        >
                          Create Tournament
                        </Button>
                      </form>
                    }
                    management={
                      <div className="space-y-4">
                        <div>
                          <p className="section-kicker">Live Price Sync</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <InfoPanel
                              title="Status"
                              value={canSyncTournamentPrice ? syncStatusLabel : "Waiting for active tournament"}
                            />
                            <InfoPanel
                              title="Last synced"
                              value={
                                lastPriceSyncAt
                                  ? new Intl.DateTimeFormat(undefined, {
                                      timeStyle: "short",
                                      dateStyle: "medium",
                                    }).format(lastPriceSyncAt)
                                  : "Not synced yet"
                              }
                            />
                            <InfoPanel
                              title="Current live BTC price"
                              value={livePriceValue ? `$${livePriceValue.toLocaleString()}` : "Not loaded"}
                            />
                            <InfoPanel
                              title="Current tournament price"
                              value={currentPriceValue ? `$${currentPriceValue.toLocaleString()}` : "Not loaded"}
                            />
                          </div>
                          {syncWarning ? <p className="mt-3 text-sm text-amber-300">{syncWarning}</p> : null}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              variant="primary"
                              onClick={handleManualPriceSync}
                              disabled={
                                !canSyncTournamentPrice ||
                                !livePriceValue ||
                                updatePriceMutation.isPending ||
                                livePriceValue === currentPriceValue
                              }
                            >
                              {updatePriceMutation.isPending ? "Syncing..." : "Sync Tournament Price"}
                            </Button>
                            <Button
                              variant={adminAutoSyncEnabled ? "positive" : "secondary"}
                              onClick={() => setAdminAutoSyncEnabled((current) => !current)}
                              disabled={!canSyncTournamentPrice}
                            >
                              {adminAutoSyncEnabled ? "Auto Sync On" : "Auto Sync Off"}
                            </Button>
                          </div>
                          {adminAutoSyncEnabled ? (
                            <p className="mt-3 text-sm text-amber-300">
                              This will request wallet approval for each on-chain price update.
                            </p>
                          ) : null}
                        </div>

                        <Notice tone="warning">
                          Ending or settling a tournament changes real on-chain tournament state.
                        </Notice>

                        <TournamentSelector
                          tournaments={tournaments}
                          selectedTournamentId={selectedTournamentId}
                          onSelect={setSelectedTournamentId}
                        />
                        {selectedTournament ? (
                          <div className="space-y-4">
                            <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel-soft)] p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="section-kicker">Selected Tournament</p>
                                  <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{selectedTournament.name}</h3>
                                </div>
                                <UiStatusPill
                                  kind={selectedTournamentStatusKind}
                                  label={selectedTournamentStatusLabel}
                                />
                              </div>
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <InfoPanel title="Entry Fee" value={formatPlanck(selectedTournament.entry_fee)} />
                                <InfoPanel title="Prize Pool" value={formatPlanck(selectedTournament.prize_pool)} />
                                <InfoPanel title="Start" value={formatTimestamp(selectedTournament.start_time)} />
                                <InfoPanel title="End" value={formatTimestamp(selectedTournament.end_time)} />
                              </div>
                            </div>

                            {renderMutationNotice(tournamentLifecycleMutation, {
                              pending: "Finalizing tournament and leaderboard...",
                              success: "Tournament ended and settled.",
                            })}

                            {lifecycleActionAvailable ? (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="primary"
                                  onClick={() => {
                                    tournamentLifecycleMutation.reset();
                                    tournamentLifecycleMutation.mutate();
                                  }}
                                  disabled={tournamentLifecycleMutation.isPending}
                                >
                                  {tournamentLifecycleMutation.isPending ? "Finalizing..." : lifecycleActionLabel}
                                </Button>
                              </div>
                            ) : (
                              <Notice tone="info">
                                {selectedTournamentStatusLabel === "Claim Open"
                                  ? "Tournament is settled. Winners can claim rewards now."
                                  : selectedTournamentStatusLabel === "Live"
                                    ? "Trading is open. Settlement actions unlock after the timer ends."
                                    : "Settlement action will appear when this tournament is ready."}
                              </Notice>
                            )}

                    {leaderboardEntries.length ? (
                      <LeaderboardPanel
                        podium={leaderboardPodium}
                        rows={leaderboardRows}
                        inactiveRows={leaderboardInactiveRows}
                      />
                    ) : (
                              <EmptyState
                                title="No leaderboard entries yet"
                                copy="Participants need to join this tournament before there is anything to settle."
                              />
                            )}
                          </div>
                        ) : (
                          <Notice tone="warning">Select a tournament to manage it.</Notice>
                        )}
                      </div>
                    }
                  />
                </div>
              )}
            </motion.section>
          ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </AppShell>
    </div>
  );
}

function WalletPill({
  accountName,
  address,
  balance,
  isAdmin,
  accounts,
  selectedAddress,
  onSelectAddress,
  onDisconnect,
}: {
  accountName: string;
  address: string;
  balance: string | null;
  isAdmin: boolean;
  accounts: { address: string; meta: { name?: string } }[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  onDisconnect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-hi)] bg-[rgba(12,27,20,0.92)] px-3 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.24)]"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
      <div className="text-sm font-medium text-[var(--text)]">{shortAddress(address)}</div>
      {balance ? <div className="font-mono text-sm tabular-nums text-[var(--muted)]">{balance} VARA</div> : null}
      {isAdmin ? <UiStatusPill kind="admin" label="Admin" /> : null}
      {accounts.length > 1 ? (
        <select
          value={selectedAddress}
          onChange={(event) => onSelectAddress(event.target.value)}
          className="rounded-full border border-[var(--border-soft)] bg-[var(--sidebar)] px-3 py-1.5 text-xs text-[var(--text)] outline-none"
        >
          {accounts.map((candidate) => (
            <option key={candidate.address} value={candidate.address}>
              {(candidate.meta.name ?? accountName).trim()} · {shortAddress(candidate.address)}
            </option>
          ))}
        </select>
      ) : null}
      <button type="button" onClick={onDisconnect} className="text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
        Disconnect
      </button>
    </motion.div>
  );
}

function TournamentSelector({
  tournaments,
  selectedTournamentId,
  onSelect,
  onOpen,
}: {
  tournaments: TournamentView[];
  selectedTournamentId: string;
  onSelect: (tournamentId: string) => void;
  onOpen?: (tournamentId: string) => void;
}) {
  if (!tournaments.length) {
    return <Notice tone="warning">No tournaments available yet.</Notice>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tournaments.map((tournament) => {
        const active = selectedTournamentId === tournament.tournament_id;
        return (
          <button
            key={tournament.tournament_id}
            type="button"
            onClick={() => {
              onSelect(tournament.tournament_id);
              onOpen?.(tournament.tournament_id);
            }}
            className={
              active
                ? "rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[#04130c]"
                : "rounded-full border border-[var(--border-soft)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--border-hi)] hover:text-[var(--text)]"
            }
          >
            {tournament.name}
          </button>
        );
      })}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="surface-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">
            {title}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[15px]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}


function InfoStat({
  label,
  value,
  inverted,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${inverted ? "border-[var(--border-soft)] bg-[rgba(17,39,29,0.8)]" : "border-[var(--border-soft)] bg-[rgba(8,20,15,0.8)]"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${inverted ? "text-[var(--subtle)]" : "text-[var(--subtle)]"}`}>
        {label}
      </p>
      <p className={`mt-2 text-sm font-semibold ${inverted ? "text-[var(--text)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoPanel({
  title,
  value,
  tone = "default",
}: {
  title: ReactNode;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-[var(--primary-strong)]"
      : tone === "negative"
        ? "text-[var(--short)]"
        : "text-[var(--text)]";
  return (
    <motion.div
      layout
      className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] p-3"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
        {title}
      </p>
      <motion.p
        key={`${typeof title === "string" ? title : "panel"}-${value}`}
        initial={{ opacity: 0.75, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-2 text-sm font-semibold ${toneClass}`}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

function TradeHistoryPanel({
  history,
  currentPrice,
}: {
  history: TradeHistoryItem[];
  currentPrice: bigint;
}) {
  return (
    <div className="product-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--subtle)]">Trade History</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--text)]">Your Activity</h3>
        </div>
        <span className="text-xs text-[var(--subtle)]">{history.length} entries</span>
      </div>
      {history.length ? (
        <div className="space-y-2">
          {[...history].reverse().map((item, index) => (
            <div
              key={`${item.action}-${item.timestamp}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {item.action === "OPEN" ? "Opened" : "Closed"} {item.direction}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Entry ${toBigIntValue(item.entryPrice).toLocaleString()}
                  {item.exitPrice ? ` · Exit $${toBigIntValue(item.exitPrice).toLocaleString()}` : ` · Current $${currentPrice.toLocaleString()}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text)]">
                  {item.pnl ? formatSigned(item.pnl) : `${toBigIntValue(item.size).toLocaleString()} size`}
                </p>
                <p className="text-xs text-[var(--subtle)]">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Trades will appear here after you open or close positions in this tournament.
        </p>
      )}
    </div>
  );
}

function FairTradingRulesCard() {
  const rules = [
    "Every trader starts with the same virtual balance.",
    "Everyone uses the same BTC/USD price feed from the contract.",
    "One open position per trader.",
    "No leverage in MVP.",
    "No liquidation in MVP.",
    "Entry fees go into one on-chain prize pool.",
    "Leaderboard ranks by percentage return.",
    "Settlement pays the top 3 automatically.",
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {rules.map((rule) => (
          <div key={rule} className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-3 py-3 text-sm text-[var(--muted)]">
            {rule}
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardPanel({
  rankLabel,
  returnLabel,
  rewardLabel,
  statusLabel,
}: {
  rankLabel: string;
  returnLabel: string;
  rewardLabel: string;
  statusLabel: string;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border-soft)] bg-[var(--panel-soft)] p-4">
      <p className="section-kicker">Reward</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoPanel title="Your Rank" value={rankLabel} />
        <InfoPanel title="Final PnL %" value={returnLabel} />
        <InfoPanel title="Claimable Reward" value={rewardLabel} />
        <InfoPanel title="Status" value={statusLabel} />
      </div>
    </div>
  );
}


function Toast({
  tone,
  message,
}: {
  tone: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success: "border-[rgba(28,203,120,0.28)] bg-[rgba(28,203,120,0.14)] text-[var(--text)]",
    error: "border-[rgba(255,107,107,0.28)] bg-[rgba(255,107,107,0.14)] text-[var(--text)]",
    info: "border-[rgba(103,247,177,0.24)] bg-[rgba(103,247,177,0.12)] text-[var(--text)]",
  } satisfies Record<typeof tone, string>;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-[0_16px_36px_rgba(2,6,23,0.35)] backdrop-blur ${styles[tone]}`}
    >
      {message}
    </motion.div>
  );
}

function CardSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[26px] border border-[var(--border-soft)] bg-[rgba(12,27,20,0.76)] p-5"
        >
          <div className="h-3 w-28 rounded-full bg-[rgba(103,247,177,0.08)]" />
          <div className="mt-4 h-7 w-2/3 rounded-full bg-[rgba(103,247,177,0.08)]" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((__, cell) => (
              <div key={cell} className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.8)] p-3">
                <div className="h-3 w-16 rounded-full bg-[rgba(103,247,177,0.08)]" />
                <div className="mt-3 h-4 w-20 rounded-full bg-[rgba(103,247,177,0.08)]" />
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-10 flex-1 rounded-full bg-[rgba(103,247,177,0.08)]" />
            <div className="h-10 w-28 rounded-full bg-[rgba(103,247,177,0.08)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[24px] border border-[var(--border-soft)] bg-[rgba(12,27,20,0.76)] p-4"
        >
          <div className="grid gap-3 md:grid-cols-[64px_1.3fr_repeat(4,0.9fr)]">
            <div className="h-12 w-12 rounded-2xl bg-[rgba(103,247,177,0.08)]" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full bg-[rgba(103,247,177,0.08)]" />
              <div className="h-3 w-20 rounded-full bg-[rgba(103,247,177,0.08)]" />
            </div>
            {Array.from({ length: 4 }).map((__, cell) => (
              <div key={cell} className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.8)] p-3">
                <div className="h-3 w-16 rounded-full bg-[rgba(103,247,177,0.08)]" />
                <div className="mt-3 h-4 w-20 rounded-full bg-[rgba(103,247,177,0.08)]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-5 py-8 text-center">
      <p className="text-lg font-semibold text-[var(--text)]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{copy}</p>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "warning" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "border-[rgba(103,247,177,0.24)] bg-[rgba(103,247,177,0.1)] text-[var(--text)]",
    warning: "border-[rgba(244,201,93,0.28)] bg-[rgba(244,201,93,0.1)] text-[var(--text)]",
    error: "border-[rgba(255,107,107,0.28)] bg-[rgba(255,107,107,0.1)] text-[var(--text)]",
  } satisfies Record<typeof tone, string>;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${styles[tone]}`}>{children}</div>
  );
}

function renderMutationNotice<TData>(
  mutation: {
    isPending: boolean;
    error: unknown;
    data?: TData;
  },
  copy: { pending: string; success: string },
) {
  if (mutation.isPending) return <Notice tone="info">{copy.pending}</Notice>;
  if (mutation.error) return <Notice tone="error">{extractErrorMessage(mutation.error)}</Notice>;
  if (mutation.data !== undefined) return <Notice tone="info">{copy.success}</Notice>;
  return null;
}

function mapStatusKind(
  status: string,
): "live" | "soon" | "ended" | "settled" | "settling" | "claim" {
  if (status === "Live" || status === "Active") return "live";
  if (status === "Upcoming" || status === "Soon") return "soon";
  if (status === "Settling") return "settling";
  if (status === "Claim Open") return "claim";
  if (status === "Settled") return "settled";
  return "ended";
}

function mapStatusLabel(status: string): string {
  if (status === "Active") return "Live";
  if (status === "Upcoming") return "Soon";
  return status;
}

function getTournamentLifecycleState(
  tournament: TournamentView,
  now: number,
): "Upcoming" | "Live" | "Ended" | "Settling" | "Settled" | "Claim Open" {
  const start = Number(toBigIntValue(tournament.start_time));
  const end = Number(toBigIntValue(tournament.end_time));

  if (tournament.status === "Settled") {
    return tournament.winners.length ? "Claim Open" : "Settled";
  }
  if (tournament.status === "Ended") return "Settling";
  if (tournament.status === "Upcoming") {
    return now >= start ? "Live" : "Upcoming";
  }
  if (tournament.status === "Active") {
    return now >= end ? "Settling" : "Live";
  }

  return "Ended";
}

function getJoinReason(
  tournament: TournamentView,
  now: number,
  txAccount: { address: string; signer?: unknown | null } | null,
  hasProgramId: boolean,
  walletActionReason: string,
): string | null {
  if (!hasProgramId) return "Paste a deployed program ID first.";
  if (!txAccount) return walletActionReason;
  const start = Number(toBigIntValue(tournament.start_time));
  if (tournament.status !== "Upcoming" || now >= start) {
    return "Joining closes when the tournament starts.";
  }
  if (tournament.participant_count >= tournament.max_participants) return "Tournament is full.";
  return null;
}

function getTradingDisabledReason(
  tournament: TournamentView,
  participant: ParticipantView | null,
  now: number,
): string | null {
  if (!participant) return "Join this tournament before trading.";
  const end = Number(toBigIntValue(tournament.end_time));
  if (tournament.status !== "Active" || now >= end) return "Tournament not active.";
  if (participant.position?.is_open) return "Position already open.";
  return null;
}

function getWalletActionReason(walletStatus: string): string {
  switch (walletStatus) {
    case "loading":
      return "Wallets are still loading.";
    case "unavailable":
      return "No Vara-compatible wallet extension found.";
    case "connecting":
      return "Wallet is still connecting.";
    default:
      return "Connect a wallet first.";
  }
}

function extractErrorMessage(error: unknown): string {
  const message = rawErrorMessage(error);
  return mapArenaErrorMessage(message);
}

function rawErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unexpected error";
  }
}

function mapArenaErrorMessage(message: string): string {
  if (message.includes("TournamentNotActive")) return "Tournament not active.";
  if (message.includes("TournamentNotUpcoming")) return "Tournament already started.";
  if (message.includes("AlreadyJoined")) return "Already joined.";
  if (message.includes("PositionAlreadyOpen")) return "Position already open.";
  if (message.includes("PositionNotOpen")) return "No open position.";
  if (message.includes("WrongEntryFee")) return "Join requires the exact entry fee.";
  if (message.includes("ParticipantNotFound")) return "Join this tournament before trading.";
  return message;
}

function calculateSyntheticPnl(
  direction: PositionDirection,
  size: bigint,
  entryPrice: bigint,
  exitPrice: bigint,
): bigint {
  if (entryPrice <= 0n) return 0n;
  const diff = direction === "Long" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return (size * diff) / entryPrice;
}

function mergeLivePriceHistory(
  history: LivePricePoint[],
  latestPrice: number | null,
): LivePricePoint[] {
  if (!history.length && latestPrice == null) return [];
  if (latestPrice == null) return history;

  const nextPoint = { price: latestPrice, timestamp: Date.now() };
  const previous = history[history.length - 1];
  if (!previous) return [nextPoint];

  if (Math.abs(previous.price - latestPrice) < 0.0001) {
    return [...history.slice(0, -1), { ...previous, timestamp: nextPoint.timestamp }];
  }

  return [...history, nextPoint].slice(-72);
}

function getPriceSyncStatus({
  livePriceValue,
  currentPriceValue,
  isSyncing,
  lastPriceSyncAt,
  now,
  tournamentState,
}: {
  livePriceValue: bigint;
  currentPriceValue: bigint;
  isSyncing: boolean;
  lastPriceSyncAt: number | null;
  now: number;
  tournamentState: "Upcoming" | "Live" | "Ended" | "Settling" | "Settled" | "Claim Open" | null;
}): string {
  if (isSyncing) return "Syncing...";
  if (tournamentState && tournamentState !== "Live") {
    return lastPriceSyncAt ? `Live price synced · ${formatRelativeSeconds(lastPriceSyncAt, now)}` : "Live price synced";
  }
  if (livePriceValue <= 0n || currentPriceValue <= 0n) return "Price feed delayed";
  if (livePriceValue === currentPriceValue) {
    return lastPriceSyncAt ? `Live price synced · ${formatRelativeSeconds(lastPriceSyncAt, now)}` : "Live price synced";
  }
  if (lastPriceSyncAt && now - lastPriceSyncAt <= 45_000) {
    return `Last synced ${formatRelativeSeconds(lastPriceSyncAt, now)}`;
  }
  return "Price feed delayed";
}

function formatRelativeSeconds(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  return `${seconds}s ago`;
}

function isParticipantQualified({
  participantAddress,
  finalValue,
  realizedPnl,
  unrealizedPnl,
  positionOpen,
  tournament,
  currentAccount,
  currentTradeCount,
}: {
  participantAddress: string;
  finalValue: string;
  realizedPnl: string;
  unrealizedPnl: string;
  positionOpen: boolean;
  tournament: TournamentView | null;
  currentAccount: string | null;
  currentTradeCount: number;
}): boolean {
  if (!tournament) return false;
  if (sameAddress(participantAddress, currentAccount) && currentTradeCount > 0) return true;

  const initialBalance = toBigIntValue(tournament.initial_virtual_balance);
  return (
    positionOpen ||
    toBigIntValue(realizedPnl) !== 0n ||
    toBigIntValue(unrealizedPnl) !== 0n ||
    toBigIntValue(finalValue) !== initialBalance
  );
}

function buildLeaderboardProjection({
  entries,
  tournament,
  currentAccount,
  currentTradeCount,
}: {
  entries: LeaderboardEntry[];
  tournament: TournamentView | null;
  currentAccount: string | null;
  currentTradeCount: number;
}) {
  const projected = entries.map((entry, index) => {
    const qualified = isParticipantQualified({
      participantAddress: entry.participant,
      finalValue: entry.final_value,
      realizedPnl: entry.realized_pnl,
      unrealizedPnl: entry.unrealized_pnl,
      positionOpen: Boolean(entry.position?.is_open),
      tournament,
      currentAccount,
      currentTradeCount,
    });
    const tradeCount = sameAddress(entry.participant, currentAccount)
      ? currentTradeCount
      : qualified
        ? 1
        : 0;

    return { ...entry, qualified, tradeCount, originalIndex: index };
  });

  const qualified = projected
    .filter((entry) => entry.qualified)
    .sort((left, right) => {
      const returnDiff = toBigIntValue(right.return_percentage_bps) - toBigIntValue(left.return_percentage_bps);
      if (returnDiff !== 0n) return returnDiff > 0n ? 1 : -1;
      if (right.tradeCount !== left.tradeCount) return right.tradeCount - left.tradeCount;
      return left.originalIndex - right.originalIndex;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const inactive = projected.filter((entry) => !entry.qualified);

  return { qualified, inactive };
}

function getRewardStatus({
  participant,
  participantQualified,
  tournament,
  winner,
  claimableRewardValue,
}: {
  participant: ParticipantView | null;
  participantQualified: boolean;
  tournament: TournamentView | null;
  winner: TournamentView["winners"][number] | null;
  claimableRewardValue: bigint;
}): string {
  if (!participant) return "Not joined";
  if (!participantQualified) return "Not qualified";
  if (!tournament) return "No tournament selected";
  if (tournament.status !== "Settled") {
    return getTournamentLifecycleState(tournament, Date.now()) === "Settling"
      ? "Awaiting settlement"
      : "Tournament still live";
  }
  if (claimableRewardValue > 0n) return "Ready to claim";
  if (winner && toBigIntValue(winner.payout) > 0n) return "Claimed";
  return "Not eligible";
}

function tradeHistoryStorageKey(programId: string, address: string, tournamentId: string): string {
  return `tradevaultArena.tradeHistory.${programId}.${address}.${tournamentId}`;
}

function readTradeHistory(programId: string, address: string, tournamentId: string): TradeHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(tradeHistoryStorageKey(programId, address, tournamentId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as TradeHistoryItem[] : [];
  } catch {
    return [];
  }
}

function appendTradeHistory(
  programId: string,
  address: string,
  tournamentId: string,
  current: TradeHistoryItem[],
  nextItem: TradeHistoryItem,
): TradeHistoryItem[] {
  const next = [...current, nextItem].slice(-20);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      tradeHistoryStorageKey(programId, address, tournamentId),
      JSON.stringify(next),
    );
  }
  return next;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return now;
}

function useHashRoute(): [AppRoute, (route: AppRoute) => void] {
  const [route, setRouteState] = useState<AppRoute>(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRouteState(parseHashRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setRoute = (next: AppRoute) => {
    const hash = toHashRoute(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRouteState(next);
    }
  };

  return [route, setRoute];
}

function parseHashRoute(hash: string): AppRoute {
  const normalized = hash.replace(/^#/, "");

  if (normalized.startsWith("/tournaments/")) {
    const tournamentId = normalized.replace("/tournaments/", "").trim();
    return tournamentId ? { page: "trade", tournamentId } : { page: "tournaments" };
  }

  switch (normalized) {
    case "/tournaments":
      return { page: "tournaments" };
    case "/trade":
      return { page: "trade" };
    case "/leaderboard":
      return { page: "leaderboard" };
    case "/rewards":
      return { page: "rewards" };
    case "/vault":
      return { page: "vault" };
    case "/admin":
      return { page: "admin" };
    default:
      return { page: "home" };
  }
}

function toHashRoute(route: AppRoute): string {
  switch (route.page) {
    case "tournaments":
      return "#/tournaments";
    case "leaderboard":
      return "#/leaderboard";
    case "rewards":
      return "#/rewards";
    case "vault":
      return "#/vault";
    case "admin":
      return "#/admin";
    case "trade":
      return route.tournamentId ? `#/tournaments/${route.tournamentId}` : "#/trade";
    case "tournament":
      return route.tournamentId ? `#/tournaments/${route.tournamentId}` : "#/tournaments";
    default:
      return "#/";
  }
}

function resolveBanner({
  apiError,
  apiStatus,
  hasProgramId,
  networkName,
  walletError,
  walletStatus,
  accountAddress,
}: {
  apiError: string | null;
  apiStatus: string;
  hasProgramId: boolean;
  networkName: string;
  walletError: string | null;
  walletStatus: string;
  accountAddress: string | null;
}): { tone: "info" | "warning" | "error"; message: string } | null {
  if (!hasProgramId) {
    return {
      tone: "error",
      message: "TradeVault Arena is missing its deployed program configuration.",
    };
  }

  if (apiError) {
    return { tone: "error", message: apiError };
  }

  if (apiStatus !== "ready") {
    return { tone: "warning", message: `Connecting to ${networkName}...` };
  }

  if (walletError) {
    return { tone: "error", message: walletError };
  }

  if (walletStatus === "unavailable") {
    return {
      tone: "warning",
      message: "No Vara-compatible wallet extension was detected. Install SubWallet, Talisman, or Polkadot.js.",
    };
  }

  if (!accountAddress) {
    return {
      tone: "warning",
      message: "Connect a wallet to join tournaments, trade BTC/USD, and claim rewards.",
    };
  }

  return null;
}
