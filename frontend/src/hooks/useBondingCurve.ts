import { useMemo } from 'react';
import { calculateBuyCost, calculateTokensForMon, getCurrentPrice } from '../utils/bondingCurve';

export const useBondingCurve = (currentSupply: bigint) => {
  return useMemo(() => ({
    getBuyCost: (amount: bigint) => calculateBuyCost(currentSupply, amount),
    getTokensOut: (monAmount: number) => calculateTokensForMon(currentSupply, monAmount),
    currentPrice: getCurrentPrice(currentSupply),
  }), [currentSupply]);
};
