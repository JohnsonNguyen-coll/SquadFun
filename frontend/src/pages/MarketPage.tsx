import React, { useState, useMemo, useEffect } from 'react';
import LiveTicker from '@/components/home/LiveTicker';
import TabFilter from '@/components/home/TabFilter';
import TokenGrid from '@/components/home/TokenGrid';
import { API_BASE_URL } from '@/config/constants';
import type { Token } from '@/mocks/data';

const MarketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`);
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const filteredTokens = useMemo(() => {
    let list = [...tokens];
    
    if (activeTab === 'new') {
      // Sắp xếp theo thời gian tạo mới nhất
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'graduated') {
      // Lọc các token đã tốt nghiệp
      list = list.filter(t => t.graduated);
    } else {
      // Mặc định cho Trending: Sắp xếp theo Market Cap giảm dần
      list.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    }
    
    if (searchQuery) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return list;
  }, [activeTab, searchQuery, tokens]);

  return (
    <div className="pb-24">
      <LiveTicker />

      {/* Market Header */}
      <section className="max-w-7xl mx-auto px-6 mt-14 mb-12">
        <div className="glass-card p-8 md:p-10 border-primary/20 bg-surface/40 relative overflow-hidden">
          <div className="absolute -top-20 -right-10 w-56 h-56 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-14 w-56 h-56 bg-monad/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/70">Live Market Feed</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-body font-black tracking-normal leading-[1.08] text-white mb-4">
                The Arena
              </h1>
              <p className="text-white/60 font-body text-base md:text-lg leading-relaxed">
                Track trending meme beasts, discover fresh launches, and snipe the next legend before the crowd catches up.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 min-w-full sm:min-w-[420px] lg:min-w-[430px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xl md:text-2xl font-body font-extrabold text-primary-highlight">{tokens.length}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 mt-1">Listed</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xl md:text-2xl font-body font-extrabold text-white">{tokens.filter((t) => t.graduated).length}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 mt-1">Graduated</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xl md:text-2xl font-body font-extrabold text-primary-highlight">
                  ◈ {Math.round(tokens.reduce((sum, token) => sum + token.marketCap, 0) / 1000)}K
                </div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 mt-1">Market Cap</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass-card p-4 md:p-5 border-white/10 bg-surface/30 mb-10">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
          <TabFilter activeTab={activeTab} setActiveTab={setActiveTab} />
          
            <div className="w-full lg:w-96 relative">
              <input
                type="text"
                placeholder="Search token by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 transition-all font-body"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/40 font-body">Seeking new memes in the abyss...</p>
          </div>
        ) : (
          <>
            <TokenGrid tokens={filteredTokens} />
            
            {filteredTokens.length === 0 && (
              <div className="py-32 text-center">
                <div className="text-4xl mb-4">🔮</div>
                <h3 className="text-xl font-body font-extrabold tracking-normal text-white/60">No tokens found in the crystal ball</h3>
                <p className="text-white/20 font-body">Try adjusting your filters or search query.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MarketPage;
