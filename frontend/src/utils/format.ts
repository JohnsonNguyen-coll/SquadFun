import { formatEther } from 'viem';

export const formatMON = (wei: bigint): string => {
  const val = parseFloat(formatEther(wei));
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ◈';
};

export const formatAddress = (addr: string): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const formatTokenAmount = (n: bigint | number): string => {
  const num = typeof n === 'bigint' ? Number(n) / 1e18 : n;
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
};

export const timeAgo = (timestamp: number | string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
};

export const getPriceChangeColor = (pct: number): string => {
  if (pct > 0) return 'text-emerald-400';
  if (pct < 0) return 'text-red-400';
  return 'text-gray-400';
};
