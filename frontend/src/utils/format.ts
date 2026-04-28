import { formatEther } from 'viem';

export const formatMON = (wei: any): string => {
  if (!wei) return '0 ◈';
  const val = typeof wei === 'bigint' ? parseFloat(formatEther(wei)) : parseFloat(wei.toString()) / 1e18;
  return (isNaN(val) ? 0 : val).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ◈';
};

export const formatAddress = (addr: string): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const formatTokenAmount = (n: any): string => {
  if (n === null || n === undefined) return '0';
  const num = typeof n === 'bigint' ? Number(n) / 1e18 : Number(n);
  if (isNaN(num)) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  if (num < 1 && num > 0) return num.toFixed(4);
  return num.toFixed(2);
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
