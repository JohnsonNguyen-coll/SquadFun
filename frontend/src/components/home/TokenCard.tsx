import React from 'react';
import { Link } from 'react-router-dom';
import type { Token } from '@/mocks/data';
import { formatMON, formatTokenAmount, timeAgo, getPriceChangeColor } from '@/utils/format';
import { GRADUATION_TARGET } from '@/config/constants';
import { parseEther } from 'viem';

interface TokenCardProps {
  token: Token;
  rank?: number;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, rank }) => {
  const graduationProgress = Math.min(100, Number((parseEther(token.reserveMon?.toString() || '0') * 100n) / (GRADUATION_TARGET * 10n**18n)));
  const isNew = new Date().getTime() - new Date(token.createdAt).getTime() < 3600000;

  return (
    <Link 
      to={`/token/${token.contractAddress}`}
      className="token-card group block glass-card p-5 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(236,72,153,0.18)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <img 
            src={token.imageUrl} 
            alt={token.name} 
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/5 group-hover:ring-primary group-hover:rotate-1 transition-all"
          />
          {rank === 1 && (
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-gold rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-background animate-bounce">
              👑
            </div>
          )}
          {isNew && !rank && (
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary text-[8px] font-semibold rounded-md uppercase tracking-[0.1em] border border-white/20">
              New
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-white/40 mb-1">{timeAgo(token.createdAt)}</div>
          <div className={`font-mono text-sm font-bold ${getPriceChangeColor(token.priceChange24h || 0)}`}>
            {(token.priceChange24h || 0) > 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-body font-extrabold tracking-normal leading-snug truncate text-white">{token.name}</h3>
          <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[10px] text-white/40 font-bold uppercase">
            {token.symbol}
          </span>
        </div>
        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
          {token.description}
        </p>
      </div>

        <div className="grid grid-cols-2 gap-4 mb-5 p-3 rounded-lg bg-background/50 border border-primary/10">
        <div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-white/30 font-semibold mb-1">Meme Cap</div>
          <div className="font-mono text-sm font-bold text-white/90">◈ {formatTokenAmount(token.marketCap)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.1em] text-white/30 font-semibold mb-1">Reserve</div>
          <div className="font-mono text-sm font-bold text-primary-highlight">{formatMON(token.reserveMon)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Graduation</span>
            {graduationProgress >= 95 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <span className="font-mono text-[10px] font-bold text-white/60">{graduationProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${graduationProgress}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default TokenCard;
