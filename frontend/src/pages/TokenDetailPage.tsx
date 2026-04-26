import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_TOKENS } from '@/mocks/data';
import PriceChart from '@/components/token/PriceChart';
import TradeWidget from '@/components/token/TradeWidget';
import BondingCurveBar from '@/components/token/BondingCurveBar';
import { formatAddress, formatTokenAmount, timeAgo } from '@/utils/format';
import { GRADUATION_TARGET } from '@/config/constants';

const TokenDetailPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  
  const token = useMemo(() => 
    MOCK_TOKENS.find(t => t.contractAddress.toLowerCase() === address?.toLowerCase()),
    [address]
  );

  if (!token) {
    return (
      <div className="pt-32 text-center h-[70vh] flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">👻</div>
        <h2 className="text-3xl font-display font-bold mb-4">Spell Not Found</h2>
        <p className="text-white/40 mb-8 font-body">The token you are looking for has vanished into the ether.</p>
        <Link to="/" className="text-primary hover:text-primary-bright font-display font-bold uppercase tracking-widest text-sm">
          Return to Market
        </Link>
      </div>
    );
  }

  const graduationProgress = Number((token.reserveMon * 100n) / (GRADUATION_TARGET * 10n**18n));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        <span className="text-sm font-display font-bold uppercase tracking-widest">Back to Market</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Chart & Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Token Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <img 
                src={token.imageUrl} 
                alt={token.name} 
                className="w-24 h-24 rounded-2xl ring-4 ring-primary/20 shadow-[0_0_40px_rgba(139,92,246,0.2)]"
              />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-display font-bold">{token.name}</h1>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-sm font-bold text-white/40">
                    {token.symbol}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-white/20">Creator:</span>
                    <span className="text-primary-highlight">{formatAddress(token.creatorAddress)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/20">Born:</span>
                    <span className="text-white/60">{timeAgo(token.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="px-6 py-3 rounded-2xl bg-surface border border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Market Cap</div>
                <div className="font-mono text-xl font-bold text-white/90">◈ {formatTokenAmount(token.marketCap)}</div>
              </div>
            </div>
          </div>

          <PriceChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <span className="text-primary">📜</span> Token Lore
              </h3>
              <p className="text-sm text-white/60 font-body leading-relaxed">
                {token.description}
              </p>
              <div className="pt-4 flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-background/50 border border-white/5 text-[10px] font-mono font-bold text-white/40 uppercase">
                  Contract: {formatAddress(token.contractAddress)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-background/50 border border-white/5 text-[10px] font-mono font-bold text-white/40 uppercase">
                  Finality: Instant
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
                <span className="text-primary">🧬</span> Distribution
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                    <span>Circulating</span>
                    <span>{((Number(token.circulatingSupply) / Number(token.totalSupply)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-highlight"
                      style={{ width: `${(Number(token.circulatingSupply) / Number(token.totalSupply)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                    <span>Locked (Bonding)</span>
                    <span>{(100 - (Number(token.circulatingSupply) / Number(token.totalSupply)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/10"
                      style={{ width: `${100 - (Number(token.circulatingSupply) / Number(token.totalSupply)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Trade Widget & Progress */}
        <div className="lg:col-span-4 space-y-8">
          <TradeWidget />
          <div className="glass-card p-6">
            <BondingCurveBar progress={graduationProgress} />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
              <span className="text-primary">💬</span> Alchemist Chat
            </h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
              <div className="text-center py-12 text-white/20">
                <div className="text-3xl mb-2">🧊</div>
                <p className="text-sm">Crystal ball is quiet... <br /> Be the first to speak!</p>
              </div>
            </div>
            <div className="relative">
              <textarea 
                placeholder="Cast your message..." 
                className="w-full bg-background/50 border border-white/5 rounded-xl py-4 px-5 text-sm font-body focus:outline-none focus:border-primary/50 min-h-[100px] resize-none"
              />
              <button className="absolute bottom-4 right-4 text-primary hover:text-primary-bright transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailPage;
