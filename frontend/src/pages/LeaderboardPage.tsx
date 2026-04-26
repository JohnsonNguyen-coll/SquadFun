import React from 'react';
import { MOCK_TOKENS } from '@/mocks/data';
import { formatTokenAmount, timeAgo } from '@/utils/format';
import { Link } from 'react-router-dom';

const LeaderboardPage: React.FC = () => {
  const sortedTokens = [...MOCK_TOKENS].sort((a, b) => b.marketCap - a.marketCap).slice(0, 20);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-5xl font-display font-bold mb-4 tracking-tight">Hall of Fame</h1>
        <p className="text-white/40 font-body">The legends that forged their path on Monad.</p>
      </div>

      <div className="glass-card overflow-hidden border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">
              <th className="px-8 py-5">Rank</th>
              <th className="px-8 py-5">Token</th>
              <th className="px-8 py-5">Market Cap</th>
              <th className="px-8 py-5">Born</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedTokens.map((token, index) => (
              <tr key={token.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <span className={`font-mono font-bold text-lg ${index < 3 ? 'text-gold' : 'text-white/20'}`}>
                    #{index + 1}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <Link to={`/token/${token.contractAddress}`} className="flex items-center gap-4">
                    <img src={token.imageUrl} alt={token.name} className="w-10 h-10 rounded-lg ring-2 ring-white/5 group-hover:ring-primary transition-all" />
                    <div>
                      <div className="font-display font-bold text-white group-hover:text-primary-bright transition-colors">{token.name}</div>
                      <div className="font-mono text-[10px] text-white/20 uppercase tracking-widest">{token.symbol}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-8 py-6">
                  <div className="font-mono font-bold text-white/90">◈ {formatTokenAmount(token.marketCap)}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-white/40 font-body">{timeAgo(token.createdAt)}</div>
                </td>
                <td className="px-8 py-6 text-right">
                  {token.graduated ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Graduated
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary-highlight uppercase tracking-widest">
                      Bonding
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
