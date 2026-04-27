import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_TOKENS } from '@/mocks/data';
import PriceChart from '@/components/token/PriceChart';
import TradeWidget from '@/components/token/TradeWidget';
import BondingCurveBar from '@/components/token/BondingCurveBar';
import { formatAddress, formatTokenAmount, timeAgo } from '@/utils/format';
import { GRADUATION_TARGET } from '@/config/constants';

const TokenDetailPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [activeInsightTab, setActiveInsightTab] = useState<'trades' | 'holders'>('trades');
  const [tradesPage, setTradesPage] = useState(1);
  const [holdersPage, setHoldersPage] = useState(1);
  
  const token = useMemo(() => 
    MOCK_TOKENS.find(t => t.contractAddress.toLowerCase() === address?.toLowerCase()),
    [address]
  );

  if (!token) {
    return (
      <div className="pt-32 text-center h-[70vh] flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">👻</div>
        <h2 className="text-3xl font-body font-black tracking-normal mb-4">Spell Not Found</h2>
        <p className="text-white/40 mb-8 font-body">The token you are looking for has vanished into the ether.</p>
        <Link to="/" className="text-primary hover:text-primary-bright font-body font-semibold uppercase tracking-[0.08em] text-sm">
          Return to Market
        </Link>
      </div>
    );
  }

  const graduationProgress = Number((token.reserveMon * 100n) / (GRADUATION_TARGET * 10n**18n));
  const recentTrades = [
    { wallet: '0x91d2...73f1', side: 'Buy', amount: '12,400', value: '◈ 38.2', time: '2m ago' },
    { wallet: '0xa812...9f02', side: 'Sell', amount: '5,980', value: '◈ 17.5', time: '5m ago' },
    { wallet: '0x03ef...51bd', side: 'Buy', amount: '20,100', value: '◈ 62.7', time: '8m ago' },
    { wallet: '0xc0d1...ab88', side: 'Buy', amount: '4,200', value: '◈ 12.6', time: '11m ago' },
  ];
  const topHolders = [
    { wallet: '0x91d2...73f1', share: '12.4%', amount: '124.0M' },
    { wallet: '0xa812...9f02', share: '9.8%', amount: '98.0M' },
    { wallet: '0x03ef...51bd', share: '7.2%', amount: '72.0M' },
    { wallet: '0xc0d1...ab88', share: '5.1%', amount: '51.0M' },
    { wallet: '0x6f33...d0aa', share: '4.7%', amount: '47.0M' },
  ];
  const tradesPerPage = 4;
  const holdersPerPage = 4;
  const totalTradesPages = Math.max(1, Math.ceil(recentTrades.length / tradesPerPage));
  const totalHoldersPages = Math.max(1, Math.ceil(topHolders.length / holdersPerPage));
  const visibleTrades = recentTrades.slice((tradesPage - 1) * tradesPerPage, tradesPage * tradesPerPage);
  const visibleHolders = topHolders.slice((holdersPage - 1) * holdersPerPage, holdersPage * holdersPerPage);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        <span className="text-sm font-body font-semibold uppercase tracking-[0.08em]">Back to Market</span>
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
                  <h1 className="text-4xl font-body font-black tracking-normal leading-tight text-white">{token.name}</h1>
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
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold mb-1">Market Cap</div>
                <div className="font-mono text-xl font-bold text-white/90">◈ {formatTokenAmount(token.marketCap)}</div>
              </div>
            </div>
          </div>

          <PriceChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-body font-extrabold tracking-normal mb-4 flex items-center gap-2">
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
              <h3 className="text-lg font-body font-extrabold tracking-normal mb-6 flex items-center gap-2">
                <span className="text-primary">🧬</span> Distribution
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-2">
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
                  <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-2">
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

          <div className="glass-card p-6 h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-body font-extrabold tracking-normal flex items-center gap-2">
                <span className="text-primary">{activeInsightTab === 'trades' ? '📈' : '🧠'}</span>
                {activeInsightTab === 'trades' ? 'Recent Trades' : 'Top Holders'}
              </h3>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveInsightTab('trades');
                    setTradesPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-[0.1em] font-semibold transition-colors ${
                    activeInsightTab === 'trades'
                      ? 'bg-primary/25 border border-primary/40 text-primary-highlight'
                      : 'text-white/45 hover:text-white/75'
                  }`}
                >
                  Recent Trades
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveInsightTab('holders');
                    setHoldersPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-[0.1em] font-semibold transition-colors ${
                    activeInsightTab === 'holders'
                      ? 'bg-primary/25 border border-primary/40 text-primary-highlight'
                      : 'text-white/45 hover:text-white/75'
                  }`}
                >
                  Top Holders
                </button>
              </div>
            </div>
            {activeInsightTab === 'trades' ? (
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-white/35 border-b border-white/10">
                      <th className="text-left py-3">Wallet</th>
                      <th className="text-left py-3">Side</th>
                      <th className="text-left py-3">Amount</th>
                      <th className="text-left py-3">Value</th>
                      <th className="text-right py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTrades.map((trade, index) => (
                      <tr key={`${trade.wallet}-${index}`} className="border-b border-white/5 text-sm">
                        <td className="py-3 text-white/80 font-mono">{trade.wallet}</td>
                        <td className={`py-3 font-semibold ${trade.side === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.side}</td>
                        <td className="py-3 text-white/70">{trade.amount}</td>
                        <td className="py-3 text-white/90 font-mono">{trade.value}</td>
                        <td className="py-3 text-right text-white/45">{trade.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/45">Page {tradesPage}/{totalTradesPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTradesPage((prev) => Math.max(1, prev - 1))}
                      disabled={tradesPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradesPage((prev) => Math.min(totalTradesPages, prev + 1))}
                      disabled={tradesPage === totalTradesPages}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {visibleHolders.map((holder, index) => (
                  <div key={`${holder.wallet}-${index}`} className="rounded-xl border border-white/10 bg-background/35 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/70 font-mono">{holder.wallet}</span>
                      <span className="text-xs text-primary-highlight font-semibold">{holder.share}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70" style={{ width: holder.share }} />
                    </div>
                    <div className="mt-2 text-[11px] text-white/45">Holding: {holder.amount} {token.symbol}</div>
                  </div>
                ))}
                </div>
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/45">Page {holdersPage}/{totalHoldersPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHoldersPage((prev) => Math.max(1, prev - 1))}
                      disabled={holdersPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoldersPage((prev) => Math.min(totalHoldersPages, prev + 1))}
                      disabled={holdersPage === totalHoldersPages}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px] font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Trade Widget & Progress */}
        <div className="lg:col-span-4 space-y-8">
          <TradeWidget />
          <div className="glass-card p-6">
            <BondingCurveBar progress={graduationProgress} />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-body font-extrabold tracking-normal mb-6 flex items-center gap-2">
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
