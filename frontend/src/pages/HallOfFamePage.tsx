import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/constants';

interface GraduatedToken {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  contractAddress: string;
  marketCap: number;
  graduatedAt: string;
}

const HallOfFamePage: React.FC = () => {
  const [tokens, setTokens] = useState<GraduatedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraduatedTokens = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tokens`);
        const data = await response.json();
        // Filter graduated tokens locally for now or update API to support filter
        const graduated = data.filter((t: any) => t.graduated);
        setTokens(graduated);
      } catch (error) {
        console.error('Error fetching graduated tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraduatedTokens();
  }, []);

  const totalPages = Math.max(1, Math.ceil(tokens.length / itemsPerPage));
  const visibleTokens = tokens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="pb-24">
      {/* Hall of Fame Header */}
      <section className="max-w-7xl mx-auto px-6 mt-14 mb-12">
        <div className="glass-card p-8 md:p-10 border-primary/20 bg-surface/40 relative overflow-hidden">
          <div className="absolute -top-20 -right-10 w-56 h-56 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-14 w-56 h-56 bg-monad/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
                <span className="w-2 h-2 rounded-full bg-primary-highlight animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary-highlight">Hall of Fame</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-body font-black tracking-normal leading-[1.08] text-white mb-4">
                The Legends
              </h1>
              <p className="text-white/60 font-body text-base md:text-lg leading-relaxed">
                Honoring the most powerful tokens that have successfully graduated the bonding curve and reached the open market.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xl md:text-2xl font-body font-extrabold text-primary-highlight">{tokens.length}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 mt-1">Graduated</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xl md:text-2xl font-body font-extrabold text-white">
                  ◈ {(tokens.reduce((sum, t) => sum + Number(t.marketCap || 0), 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 mt-1">Total Cap</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-white/5 bg-surface/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30 w-20">Rank</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Token</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Market Cap</th>
                  <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Graduated On</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleTokens.map((token, index) => {
                  const actualRank = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr 
                      key={token.id}
                      className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => navigate(`/token/${token.contractAddress}`)}
                    >
                      <td className="px-8 py-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm ${
                          actualRank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                          actualRank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                          actualRank === 3 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/30' :
                          'text-white/20'
                        }`}>
                          {actualRank}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={token.imageUrl} 
                              alt={token.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-primary/50 transition-all"
                            />
                            {actualRank === 1 && <span className="absolute -top-2 -left-2 text-lg">👑</span>}
                          </div>
                          <div>
                            <div className="font-body font-bold text-white group-hover:text-primary-highlight transition-colors">{token.name}</div>
                            <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest font-bold">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-mono text-base font-black text-emerald-400">
                          ◈ {Number(token.marketCap).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-white/40 font-body">
                        {new Date(token.graduatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-lg">
                          View Lore
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {tokens.length > 0 && (
            <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/30 font-mono">
                Showing {Math.min(tokens.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(tokens.length, currentPage * itemsPerPage)} of {tokens.length} Legends
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Prev
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {tokens.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-body font-black text-white/20 italic">The Hall is currently empty...</h3>
              <p className="text-white/10 text-sm mt-2">Who will be the first legend?</p>
            </div>
          )}
        </div>
      )}
      </section>
    </div>
  );
};

export default HallOfFamePage;
