import type { Trade } from '@prisma/client';
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export declare function aggregateToCandles(trades: Trade[], timeframeMs: number): Candle[];
//# sourceMappingURL=chart.d.ts.map