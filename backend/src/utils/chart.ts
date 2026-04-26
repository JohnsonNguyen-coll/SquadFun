import { Trade } from '@prisma/client';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function aggregateToCandles(trades: any[], timeframeMs: number): Candle[] {
  const candles: Map<number, Candle> = new Map();

  trades.forEach(trade => {
    const time = Math.floor(new Date(trade.timestamp).getTime() / timeframeMs) * timeframeMs;
    const price = Number(trade.priceAtTrade);
    const amount = Number(trade.tokenAmount);

    if (!candles.has(time)) {
      candles.set(time, {
        time,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: amount
      });
    } else {
      const candle = candles.get(time)!;
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += amount;
    }
  });

  return Array.from(candles.values()).sort((a, b) => a.time - b.time);
}
