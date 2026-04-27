import React, { useMemo, useState } from 'react';
import { MOCK_TOKENS } from '@/mocks/data';
import { formatTokenAmount, timeAgo } from '@/utils/format';
import { Link } from 'react-router-dom';

const LeaderboardPage: React.FC = () => {
  const sortedTokens = [...MOCK_TOKENS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 20);
  const tokensPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedTokens.length / tokensPerPage));
  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * tokensPerPage;
    return sortedTokens.slice(startIndex, startIndex + tokensPerPage);
  }, [currentPage, sortedTokens]);
  const graduatedCount = sortedTokens.filter((token) => token.graduated).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="glass-card p-8 md:p-10 border-primary/20 bg-surface/40 mb-10 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-14 w-56 h-56 bg-monad/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5">
              <span className="text-sm">🏆</span>
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/70">Top Performers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-body font-black tracking-normal leading-[1.08] text-white mb-3">
              Hall of Fame
            </h1>
            <p className="text-white/60 font-body text-base md:text-lg leading-relaxed">
              A leaderboard of the strongest meme projects that climbed the curve and earned their legend status.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-full sm:min-w-[300px] lg:min-w-[340px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <div className="text-2xl font-body font-extrabold text-primary-highlight">{sortedTokens.length}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35 mt-1">Ranked</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <div className="text-2xl font-body font-extrabold text-white">{graduatedCount}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35 mt-1">Graduated</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/10 bg-surface/35">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white/5 text-[10px] uppercase tracking-[0.12em] font-semibold text-white/35 backdrop-blur-md">
              <th className="px-5 md:px-8 py-5">Rank</th>
              <th className="px-5 md:px-8 py-5">Token</th>
              <th className="px-5 md:px-8 py-5">Market Cap</th>
              <th className="px-5 md:px-8 py-5">Born</th>
              <th className="px-5 md:px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTokens.map((token, index) => {
              const rank = (currentPage - 1) * tokensPerPage + index + 1;
              return (
              <tr key={token.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-5 md:px-8 py-6">
                  <span className={`font-mono font-bold text-lg ${rank <= 3 ? 'text-gold' : 'text-white/20'}`}>
                    #{rank}
                  </span>
                </td>
                <td className="px-5 md:px-8 py-6">
                  <Link to={`/token/${token.contractAddress}`} className="flex items-center gap-4">
                    <img src={token.imageUrl} alt={token.name} className="w-11 h-11 rounded-xl ring-2 ring-white/5 group-hover:ring-primary transition-all" />
                    <div>
                      <div className="font-body font-extrabold tracking-normal text-white group-hover:text-primary-bright transition-colors">{token.name}</div>
                      <div className="font-mono text-[10px] text-white/20 uppercase tracking-[0.08em]">{token.symbol}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-5 md:px-8 py-6">
                  <div className="font-mono font-bold text-white/90">◈ {formatTokenAmount(token.marketCap)}</div>
                </td>
                <td className="px-5 md:px-8 py-6">
                  <div className="text-sm text-white/40 font-body">{timeAgo(token.createdAt)}</div>
                </td>
                <td className="px-5 md:px-8 py-6 text-right">
                  {token.graduated ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.08em]">
                      Graduated
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-semibold text-primary-highlight uppercase tracking-[0.08em]">
                      Bonding
                    </span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/45 font-body">
          Page {currentPage} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setCurrentPage(pageNumber)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                currentPage === pageNumber
                  ? 'bg-primary/25 border border-primary/50 text-primary-highlight'
                  : 'bg-white/[0.03] border border-white/10 text-white/70 hover:border-primary/35'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
