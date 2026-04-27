export type LivePriceSource = "binance" | "fallback";
export type LivePriceFeedStatus = "connecting" | "streaming" | "reconnecting";

export type LivePricePoint = {
  price: number;
  timestamp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type LivePriceSnapshot = {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  openTime?: number;
  closeTime?: number;
  updatedAt: number;
  source: LivePriceSource;
};

const BINANCE_TICKER_URL =
  "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT";
const BINANCE_SPOT_PRICE_URL =
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
const BINANCE_KLINES_URL =
  "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=120";
const BINANCE_TICKER_STREAM_URL =
  "wss://stream.binance.com:9443/ws/btcusdt@ticker";

type StreamListener = {
  onUpdate: (snapshot: LivePriceSnapshot) => void;
  onStatusChange?: (status: LivePriceFeedStatus) => void;
};

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectDelayMs = 2_000;
const streamListeners = new Set<StreamListener>();

type BinanceTickerResponse = {
  lastPrice?: string;
  priceChangePercent?: string;
  highPrice?: string;
  lowPrice?: string;
  openTime?: number;
  closeTime?: number;
};

type BinanceSpotPriceResponse = {
  symbol?: string;
  price?: string;
};

type BinanceTickerStreamResponse = {
  c?: string;
  P?: string;
  h?: string;
  l?: string;
  E?: number;
};

function parseNumber(value: string | number | undefined): number | null {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchBinanceTicker(): Promise<LivePriceSnapshot> {
  const response = await fetch(BINANCE_TICKER_URL);
  if (!response.ok) {
    throw new Error("Unable to load Binance BTC/USDT price.");
  }

  const data = (await response.json()) as BinanceTickerResponse;
  const price = parseNumber(data.lastPrice);
  const change24h = parseNumber(data.priceChangePercent);
  const high24h = parseNumber(data.highPrice);
  const low24h = parseNumber(data.lowPrice);

  if (price == null) {
    throw new Error("Binance BTC/USDT price response was invalid.");
  }

  return {
    price,
    change24h: change24h ?? 0,
    high24h: high24h ?? price,
    low24h: low24h ?? price,
    openTime: data.openTime,
    closeTime: data.closeTime,
    updatedAt: data.closeTime ?? Date.now(),
    source: "fallback",
  };
}

export async function fetchLiveBtcPrice(): Promise<LivePriceSnapshot> {
  return fetchBinanceTicker();
}

export async function fetchLiveBtcSpotPrice(): Promise<number> {
  const response = await fetch(BINANCE_SPOT_PRICE_URL);
  if (!response.ok) {
    throw new Error("Unable to load Binance BTC/USDT spot price.");
  }

  const data = (await response.json()) as BinanceSpotPriceResponse;
  const price = parseNumber(data.price);
  if (price == null || price <= 0) {
    throw new Error("Binance BTC/USDT spot price response was invalid.");
  }

  return price;
}

export async function fetchLiveBtcHistory(): Promise<LivePricePoint[]> {
  const response = await fetch(BINANCE_KLINES_URL);
  if (!response.ok) {
    throw new Error("Unable to load Binance BTC/USDT chart data.");
  }

  const data = (await response.json()) as unknown[];
  if (!Array.isArray(data)) {
    throw new Error("Binance BTC/USDT history response was invalid.");
  }

  return data.reduce<LivePricePoint[]>((points, entry) => {
    if (!Array.isArray(entry)) return points;

    const timestamp = parseNumber(entry[0]);
    const open = parseNumber(entry[1]);
    const high = parseNumber(entry[2]);
    const low = parseNumber(entry[3]);
    const close = parseNumber(entry[4]);
    const volume = parseNumber(entry[5]);

    if (
      timestamp == null ||
      open == null ||
      high == null ||
      low == null ||
      close == null
    ) {
      return points;
    }

    points.push({
      timestamp,
      price: close,
      open,
      high,
      low,
      close,
      volume: volume ?? undefined,
    });

    return points;
  }, []);
}

export function mapBinanceStreamTicker(message: string): LivePriceSnapshot | null {
  let data: BinanceTickerStreamResponse;
  try {
    data = JSON.parse(message) as BinanceTickerStreamResponse;
  } catch {
    return null;
  }
  const price = parseNumber(data.c);
  if (price == null) return null;

  return {
    price,
    change24h: parseNumber(data.P) ?? 0,
    high24h: parseNumber(data.h) ?? price,
    low24h: parseNumber(data.l) ?? price,
    closeTime: data.E,
    updatedAt: data.E ?? Date.now(),
    source: "binance",
  };
}

export function connectLiveBtcTickerStream({
  onUpdate,
  onStatusChange,
}: {
  onUpdate: (snapshot: LivePriceSnapshot) => void;
  onStatusChange?: (status: LivePriceFeedStatus) => void;
}): () => void {
  const listener: StreamListener = { onUpdate, onStatusChange };
  streamListeners.add(listener);

  const emitStatus = (status: LivePriceFeedStatus) => {
    for (const current of streamListeners) {
      current.onStatusChange?.(status);
    }
  };

  const emitUpdate = (snapshot: LivePriceSnapshot) => {
    for (const current of streamListeners) {
      current.onUpdate(snapshot);
    }
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer != null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const disconnectSocket = () => {
    if (!socket) return;
    const currentSocket = socket;
    socket = null;
    currentSocket.onopen = null;
    currentSocket.onclose = null;
    currentSocket.onerror = null;
    currentSocket.onmessage = null;
    currentSocket.close();
  };

  const scheduleReconnect = () => {
    if (!streamListeners.size || reconnectTimer != null) return;
    emitStatus("reconnecting");
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      openSocket();
    }, reconnectDelayMs);
    reconnectDelayMs = Math.min(10_000, reconnectDelayMs * 2);
  };

  const openSocket = () => {
    if (socket || !streamListeners.size) return;

    emitStatus(reconnectTimer != null ? "reconnecting" : "connecting");

    try {
      socket = new WebSocket(BINANCE_TICKER_STREAM_URL);
    } catch {
      socket = null;
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      reconnectDelayMs = 2_000;
      clearReconnectTimer();
      emitStatus("streaming");
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const next = mapBinanceStreamTicker(event.data);
      if (next) {
        emitUpdate(next);
      }
    };

    socket.onerror = () => {
      disconnectSocket();
      scheduleReconnect();
    };

    socket.onclose = () => {
      socket = null;
      scheduleReconnect();
    };
  };

  if (socket?.readyState === WebSocket.OPEN) {
    onStatusChange?.("streaming");
  } else if (reconnectTimer != null) {
    onStatusChange?.("reconnecting");
  } else {
    onStatusChange?.("connecting");
  }

  openSocket();

  return () => {
    streamListeners.delete(listener);
    if (streamListeners.size === 0) {
      clearReconnectTimer();
      disconnectSocket();
      reconnectDelayMs = 2_000;
    }
  };
}
