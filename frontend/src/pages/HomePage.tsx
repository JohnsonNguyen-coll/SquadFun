import React from 'react';
import GlowButton from '@/components/shared/GlowButton';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-40 overflow-hidden min-h-[90vh] flex items-center">
        {/* Abstract background glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-monad/10 blur-[120px] rounded-full translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-block mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-glow-pulse">
            <span className="text-xs uppercase tracking-[0.4em] font-bold text-primary-highlight">
              The Nexus of Fun on Monad
            </span>
          </div>
          
          <h1 className="text-7xl md:text-9xl mb-10 tracking-tighter font-display font-black leading-none italic">
            SQUAD <br />
            <span className="bg-gradient-to-r from-primary via-primary-bright to-white bg-clip-text text-transparent">
              FUN
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-white/50 mb-16 font-body leading-relaxed">
            The first community-centric memecoin factory on Monad. <br />
            Forge legends, build your squad, and cast spells that shake the chain.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <GlowButton onClick={() => navigate('/market')} className="!w-72 !py-5 !text-lg">
              Enter The Arena
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => navigate('/create')} className="!w-72 !py-5 !text-lg">
              Forge New Token
            </GlowButton>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 max-w-5xl mx-auto p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
            <div>
              <div className="text-4xl font-display font-bold mb-1 text-white">2,481</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total Spells</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-1 text-primary-highlight">◈ 1.2M</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Volume (24h)</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-1 text-white">15.4K</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Active Alchemists</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold mb-1 text-monad-highlight">◈ 6.9K</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Graduation Goal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="glass-card p-10 space-y-6 group hover:border-primary/50 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-2xl font-display font-bold">Instant Finality</h3>
            <p className="text-white/40 leading-relaxed font-body">Harness the speed of Monad. Deploy and trade with near-instant confirmation. No more waiting for blocks.</p>
          </div>
          <div className="glass-card p-10 space-y-6 group hover:border-primary/50 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🛡️</div>
            <h3 className="text-2xl font-display font-bold">Fair Launch</h3>
            <p className="text-white/40 leading-relaxed font-body">Every token starts on a bonding curve. No presales, no insiders, no rugs. Pure community power.</p>
          </div>
          <div className="glass-card p-10 space-y-6 group hover:border-primary/50 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🎓</div>
            <h3 className="text-2xl font-display font-bold">Auto Migration</h3>
            <p className="text-white/40 leading-relaxed font-body">Reach the goal and graduate automatically to Uniswap. Liquidity is locked forever. The squad wins together.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
