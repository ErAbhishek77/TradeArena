import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { LivePricePoint } from "@/lib/live-price";

type LivePriceChartProps = {
  priceHistory: LivePricePoint[];
  tournamentPrice?: bigint;
  entryPrice?: bigint | null;
};

type SeriesPoint = {
  time: UTCTimestamp;
  value: number;
};

export function LivePriceChart({
  priceHistory,
  tournamentPrice,
  entryPrice,
}: LivePriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const tournamentLineRef = useRef<IPriceLine | null>(null);
  const entryLineRef = useRef<IPriceLine | null>(null);

  const data = useMemo<SeriesPoint[]>(
    () =>
      priceHistory.map((point) => ({
        time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
        value: point.price,
      })),
    [priceHistory],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(34, 211, 238, 0.45)", width: 1 },
        horzLine: { color: "rgba(34, 211, 238, 0.2)", width: 1 },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const series = chart.addAreaSeries({
      lineColor: "#22d3ee",
      lineWidth: 2,
      topColor: "rgba(34, 211, 238, 0.32)",
      bottomColor: "rgba(34, 211, 238, 0.02)",
      priceLineColor: "#22d3ee",
      crosshairMarkerBackgroundColor: "#22d3ee",
      lastValueVisible: true,
      priceLineVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
      chart.timeScale().fitContent();
    });

    resizeObserver.observe(container);
    chart.timeScale().fitContent();

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;

    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    if (tournamentLineRef.current) {
      series.removePriceLine(tournamentLineRef.current);
      tournamentLineRef.current = null;
    }

    if (entryLineRef.current) {
      series.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }

    if (tournamentPrice && tournamentPrice > 0n) {
      tournamentLineRef.current = series.createPriceLine({
        price: Number(tournamentPrice),
        color: "#8B5CF6",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Tournament",
      });
    }

    if (entryPrice && entryPrice > 0n) {
      entryLineRef.current = series.createPriceLine({
        price: Number(entryPrice),
        color: "#22C55E",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Entry",
      });
    }
  }, [entryPrice, tournamentPrice]);

  if (!priceHistory.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-[22px] border border-slate-800 bg-slate-900/60 text-sm text-slate-500">
        Waiting for BTC/USD market data...
      </div>
    );
  }

  const high = Math.max(...priceHistory.map((point) => point.price));
  const low = Math.min(...priceHistory.map((point) => point.price));
  const latest = priceHistory[priceHistory.length - 1];

  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Live BTC/USD Chart
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            ${Math.round(latest.price).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-right text-xs sm:text-sm">
          <ChartLegend label="Live BTC" color="#22D3EE" />
          {tournamentPrice && tournamentPrice > 0n ? (
            <ChartLegend label="Tournament price" color="#8B5CF6" />
          ) : null}
          {entryPrice && entryPrice > 0n ? <ChartLegend label="Entry price" color="#22C55E" /> : null}
        </div>
        <div className="grid grid-cols-3 gap-2 text-right text-xs sm:text-sm">
          <ChartStat label="High" value={`$${Math.round(high).toLocaleString()}`} />
          <ChartStat label="Low" value={`$${Math.round(low).toLocaleString()}`} />
          <ChartStat
            label="Updated"
            value={new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(latest.timestamp)}
          />
        </div>
      </div>
      <div ref={containerRef} className="h-[280px] w-full" />
    </div>
  );
}

function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-200">{value}</p>
    </div>
  );
}

function ChartLegend({ label, color }: { label: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
