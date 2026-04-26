import React, { useState, useMemo } from 'react';
import LiveTicker from '@/components/home/LiveTicker';
import TabFilter from '@/components/home/TabFilter';
import TokenGrid from '@/components/home/TokenGrid';
import { MOCK_TOKENS } from '@/mocks/data';

const MarketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    let list = [...MOCK_TOKENS];
    
    if (activeTab === 'new') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'graduated') {
      list = list.filter(t => t.graduated);
    }
    
    if (searchQuery) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return list;
  }, [activeTab, searchQuery]);

  return (
    <div className="pb-20">
      <LiveTicker />

      {/* Market Header */}
      <section className="max-w-7xl mx-auto px-6 mt-16 text-center mb-20">
        <h1 className="text-5xl font-display font-bold mb-4">The Arena</h1>
        <p className="text-white/40 font-body max-w-lg mx-auto">
          Explore the most legendary memes forging their path on the Monad ecosystem.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
          <TabFilter activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="w-full lg:w-96 relative">
            <input 
              type="text" 
              placeholder="Search by token name or symbol..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all font-body"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
          </div>
        </div>

        <TokenGrid tokens={filteredTokens} />
        
        {filteredTokens.length === 0 && (
          <div className="py-32 text-center">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-display font-bold text-white/60">No tokens found in the crystal ball</h3>
            <p className="text-white/20 font-body">Try adjusting your filters or search query.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MarketPage;
