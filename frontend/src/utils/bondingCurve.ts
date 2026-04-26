import { BASE_PRICE, TOTAL_SUPPLY } from '../config/constants';

/**
 * Calculates the cost in MON to buy a certain amount of tokens
 * Cost = BASE_PRICE * (TOTAL_SUPPLY/3) * [(1 + (currentSupply + amount)/TOTAL_SUPPLY)^3 - (1 + currentSupply/TOTAL_SUPPLY)^3]
 */
export const calculateBuyCost = (currentSupply: bigint, amountToBuy: bigint): number => {
  const S = Number(TOTAL_SUPPLY);
  const s1 = Number(currentSupply);
  const s2 = s1 + Number(amountToBuy);
  const B = BASE_PRICE;

  const cost = (B * S / 3) * (Math.pow(1 + s2 / S, 3) - Math.pow(1 + s1 / S, 3));
  return cost;
};

/**
 * Calculates how many tokens you get for a certain amount of MON
 * Inverse of the cost function
 */
export const calculateTokensForMon = (currentSupply: bigint, monIn: number): bigint => {
  const S = Number(TOTAL_SUPPLY);
  const s1 = Number(currentSupply);
  const B = BASE_PRICE;

  const term1 = (3 * monIn) / (B * S);
  const term2 = Math.pow(1 + s1 / S, 3);
  const s2 = S * (Math.pow(term1 + term2, 1 / 3) - 1);
  
  return BigInt(Math.floor(s2 - s1));
};

export const getCurrentPrice = (currentSupply: bigint): number => {
  const s = Number(currentSupply);
  const S = Number(TOTAL_SUPPLY);
  return BASE_PRICE * Math.pow(1 + s / S, 2);
};
