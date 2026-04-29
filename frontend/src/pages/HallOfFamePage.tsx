import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import { useNavigate } from 'react-router-dom';

interface GraduatedToken {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  contractAddress: string;
  marketCap: string;
  graduatedAt: string;
}

const HallOfFamePage: React.FC = () => {
  const [tokens, setTokens] = useState<GraduatedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraduatedTokens = async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('isGraduated', true)
        .order('graduatedAt', { ascending: false });

      if (error) {
        console.error('Error fetching graduated tokens:', error);
      } else {
        setTokens(data || []);
      }
      setLoading(true); // Still show demo if empty for now
      setTimeout(() => setLoading(false), 500);
    };

    fetchGraduatedTokens();
  }, []);

  // Mock data for demo if no real graduates yet
  const displayTokens = tokens.length > 0 ? tokens : [
    {
      id: 'demo-1',
      name: 'Monad Dragon',
      symbol: 'DRAGON',
      imageUrl: 'https://via.placeholder.com/400',
      contractAddress: '0x123...',
      marketCap: '9857143',
      graduatedAt: new Date().toISOString()
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 relative z-10">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary-highlight">Legendary Spells</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-body font-black tracking-tighter mb-4 relative z-10">
          Hall of <span className="text-primary-highlight italic">Fame</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto font-body text-lg relative z-10">
          Honoring the most powerful tokens that have successfully graduated the bonding curve and reached the open market.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTokens.map((token) => (
            <div 
              key={token.id}
              onClick={() => navigate(`/token/${token.contractAddress}`)}
              className="group glass-card border-primary/20 bg-surface/40 overflow-hidden cursor-pointer hover:border-primary/60 transition-all duration-500"
            >
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={token.imageUrl} 
                  alt={token.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 rounded-full bg-primary-highlight text-background text-[10px] font-black uppercase tracking-widest animate-pulse">
                    GRADUATED
                  </div>
                </div>
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-12 left-6 w-16 h-16 rounded-2xl border-2 border-primary/30 overflow-hidden bg-background">
                   <img src={token.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-body font-black tracking-tight">{token.name}</h3>
                    <span className="text-xs text-primary-highlight font-mono font-bold uppercase tracking-widest">{token.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Market Cap</div>
                    <div className="text-lg font-mono font-bold text-white">◈ {Number(token.marketCap).toLocaleString()}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30">
                  <span>Ascended</span>
                  <span className="text-white/60">{new Date(token.graduatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HallOfFamePage;
