import React, { useState } from 'react';
import PreviewCard from '@/components/create/PreviewCard';
import GlowButton from '@/components/shared/GlowButton';
import confetti from 'canvas-confetti';

const CreateTokenPage: React.FC = () => {
  const [isCasting, setIsCasting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCasting(true);

    // Simulate Monad's fast finality
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#7C3AED', '#ffffff']
      });
      
      setIsCasting(false);
      // In real app, we'd navigate to the new token page
      // navigate(`/token/0x...`);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="glass-card p-8 md:p-10 border-primary/20 bg-surface/40 mb-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-14 w-56 h-56 bg-monad/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/70">Spell Workshop</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-body font-black tracking-normal leading-[1.08] mb-4">
              Cast a New Spell
            </h1>
            <p className="text-white/60 font-body text-base md:text-lg leading-relaxed">
              Deploy your memecoin on Monad testnet in seconds. Fill in the lore, lock the vibe, and launch straight into the curve.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-full sm:min-w-[340px] lg:min-w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <div className="text-xl md:text-2xl font-body font-extrabold text-primary-highlight">~1s</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35 mt-1">Finality</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
              <div className="text-xl md:text-2xl font-body font-extrabold text-white">1.0 ◈</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35 mt-1">Creation Fee</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCreate} className="space-y-8 glass-card p-6 md:p-10 bg-surface/35 border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-white/30 ml-1">Token Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Monad Dragon"
                  className="w-full bg-background/60 border border-white/10 rounded-xl py-4 px-5 text-sm font-body focus:outline-none focus:border-primary/60 transition-all placeholder:text-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-white/30 ml-1">Ticker Symbol</label>
                <input 
                  type="text" 
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="e.g. DRAGON"
                  className="w-full bg-background/60 border border-white/10 rounded-xl py-4 px-5 text-sm font-body focus:outline-none focus:border-primary/60 transition-all uppercase placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-white/30 ml-1">Lore (Description)</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell the story of your token..."
                className="w-full bg-background/60 border border-white/10 rounded-xl py-4 px-5 text-sm font-body focus:outline-none focus:border-primary/60 transition-all min-h-[120px] resize-none placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-white/30 ml-1">Image URL</label>
              <div className="flex gap-4">
                <input 
                  type="url" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 bg-background/60 border border-white/10 rounded-xl py-4 px-5 text-sm font-body focus:outline-none focus:border-primary/60 transition-all placeholder:text-white/30"
                />
                <button type="button" className="px-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:text-primary-highlight text-xs font-bold transition-all">
                  Upload
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-body">Creation Fee</span>
                <span className="font-mono font-bold text-white/80">1.0 ◈</span>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center text-[10px]">✨</div>
                <p className="text-[10px] text-white/40 leading-relaxed font-body">
                  Your token will be launched on a bonding curve. Once it reaches the graduation goal of 6900 MON, liquidity will be automatically migrated to Uniswap.
                </p>
              </div>
            </div>

            <GlowButton type="submit" disabled={isCasting}>
              {isCasting ? 'Casting Spell on Monad...' : 'Cast Creation Spell'}
            </GlowButton>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 sticky top-32">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-primary-highlight">Live Preview</span>
          </div>
          <PreviewCard formData={formData} />
          
          <div className="mt-12 p-6 glass-card border-white/10 bg-surface/35 text-center">
            <div className="text-xs text-white/20 font-body leading-relaxed">
              <span className="text-monad-highlight font-bold">PRO TIP:</span> <br />
              Memecoins with great lore and distinct visuals <br /> 
              reach graduation 420% faster.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTokenPage;
