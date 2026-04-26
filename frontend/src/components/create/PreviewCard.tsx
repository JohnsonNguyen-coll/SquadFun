import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface PreviewCardProps {
  formData: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
  }
}

const PreviewCard: React.FC<PreviewCardProps> = ({ formData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useGSAP(() => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateY: isFlipped ? 180 : 0,
      duration: 0.6,
      ease: "power2.inOut",
      transformStyle: "preserve-3d"
    });
  }, [isFlipped]);

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-[450px]">
      <div 
        ref={cardRef}
        className="relative w-full h-full transition-transform duration-500 transform-style-3d"
      >
        {/* Front side (Token Card) */}
        <div className="absolute inset-0 backface-hidden glass-card p-8 flex flex-col items-center text-center justify-between border-primary/40 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
          <div className="w-full">
            <div className="w-32 h-32 rounded-3xl bg-background/50 border-2 border-primary/20 mx-auto mb-8 overflow-hidden flex items-center justify-center">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🔮</span>
              )}
            </div>
            <h3 className="text-3xl font-display font-bold mb-2 tracking-tight truncate w-full">
              {formData.name || 'Your Meme'}
            </h3>
            <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 font-mono text-sm font-bold text-primary-highlight uppercase mb-6">
              {formData.symbol || 'SYM'}
            </span>
            <p className="text-sm text-white/40 line-clamp-3 font-body px-4">
              {formData.description || 'Describe the legend you are about to create...'}
            </p>
          </div>
          
          <div className="w-full space-y-4">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div className="h-full w-0 bg-primary-highlight" />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">
              <span>Bonding Curve</span>
              <span>0%</span>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 cursor-pointer text-white/20 hover:text-white transition-colors" onClick={() => setIsFlipped(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
        </div>

        {/* Back side (Spell Details) */}
        <div 
          className="absolute inset-0 backface-hidden glass-card p-8 flex flex-col justify-between border-monad/40 shadow-[0_0_50px_rgba(131,110,249,0.2)]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-xl font-display font-bold mb-8 text-monad-highlight uppercase tracking-[0.2em]">Spell Details</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-xs font-bold text-white/30 uppercase">Fee</span>
              <span className="font-mono font-bold text-white">1.0 ◈</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-xs font-bold text-white/30 uppercase">Supply</span>
              <span className="font-mono font-bold text-white">1B SYM</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-xs font-bold text-white/30 uppercase">Finality</span>
              <span className="font-mono font-bold text-emerald-400">~1s</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-xs font-bold text-white/30 uppercase">Rug Chance</span>
              <span className="font-mono font-bold text-red-400">0%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-monad/5 border border-monad/10 text-[10px] text-white/40 leading-relaxed text-center font-body">
            By casting this spell, you initialize a new bonding curve on the Monad Testnet. Use your powers wisely.
          </div>

          <div className="absolute top-4 right-4 cursor-pointer text-white/20 hover:text-white transition-colors" onClick={() => setIsFlipped(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
