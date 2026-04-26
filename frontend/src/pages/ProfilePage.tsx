import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_TOKENS } from '@/mocks/data';
import TokenGrid from '@/components/home/TokenGrid';
import { formatAddress } from '@/utils/format';

const ProfilePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  
  // Filter tokens created by this address (mock)
  const createdTokens = MOCK_TOKENS.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="glass-card p-12 mb-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-primary-bright shadow-2xl p-1">
            <div className="w-full h-full bg-surface rounded-[22px] flex items-center justify-center text-5xl">
              🧙‍♂️
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Alchemist {formatAddress(address || '')}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total Spells</span>
                <span className="font-mono font-bold text-white">42</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Trading Volume</span>
                <span className="font-mono font-bold text-emerald-400">◈ 12.4K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <h2 className="text-2xl font-display font-bold uppercase tracking-[0.2em] text-white/40">Created Tokens</h2>
        <TokenGrid tokens={createdTokens} />
      </div>
    </div>
  );
};

export default ProfilePage;
