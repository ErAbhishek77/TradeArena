export type LivePricePoint = {
  price: number;
  timestamp: number;
};

const COINGECKO_SIMPLE_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
const COINGECKO_MARKET_CHART_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly";

export async function fetchLiveBtcPrice(): Promise<{ price: number; change24h: number }> {
  const response = await fetch(COINGECKO_SIMPLE_PRICE_URL);
  if (!response.ok) {
    throw new Error("Unable to load live BTC/USD price.");
  }

  const data = (await response.json()) as {
    bitcoin?: { usd?: number; usd_24h_change?: number };
  };

  const price = data.bitcoin?.usd;
  const change24h = data.bitcoin?.usd_24h_change;
  if (typeof price !== "number") {
    throw new Error("Live BTC/USD price response was invalid.");
  }

  return {
    price,
    change24h: typeof change24h === "number" ? change24h : 0,
  };
}

export async function fetchLiveBtcHistory(): Promise<LivePricePoint[]> {
  const response = await fetch(COINGECKO_MARKET_CHART_URL);
  if (!response.ok) {
    throw new Error("Unable to load live BTC/USD chart data.");
  }

  const data = (await response.json()) as { prices?: [number, number][] };
  if (!Array.isArray(data.prices)) {
    throw new Error("Live BTC/USD history response was invalid.");
  }

  return data.prices.map(([timestamp, price]) => ({ timestamp, price }));
}
