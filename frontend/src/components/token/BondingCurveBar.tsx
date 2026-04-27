import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface BondingCurveBarProps {
  progress: number; // 0 to 100
}

const BondingCurveBar: React.FC<BondingCurveBarProps> = ({ progress }) => {
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!fillRef.current) return;
    
    gsap.to(fillRef.current, {
      width: `${progress}%`,
      duration: 1.5,
      ease: "power3.out"
    });
  }, [progress]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-sm font-body font-extrabold uppercase tracking-[0.1em] text-primary-highlight mb-1">
            Bonding Curve Progress
          </h4>
          <p className="text-xs text-white/40 font-body">
            Graduation Goal: <span className="text-white/80 font-mono font-bold">6900 ◈</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold glow-text text-primary-bright">
            {progress.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="relative h-4 w-full bg-background/80 rounded-full border border-white/5 overflow-hidden p-1 shadow-inner">
        {/* Animated fill */}
        <div 
          ref={fillRef}
          className="h-full rounded-full bg-primary shadow-[0_0_15px_rgba(236,72,153,0.5)]"
        >
        </div>
        
        {/* Milestones */}
        <div className="absolute inset-0 flex justify-between px-12 pointer-events-none">
          {[25, 50, 75].map(m => (
            <div key={m} className="w-px h-full bg-white/10 relative">
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/20">{m}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <span className="text-xl">🎓</span>
        <p className="text-xs text-white/50 font-body leading-relaxed">
          When the reserve reaches <span className="text-white/80 font-bold">6900 MON</span>, all liquidity is migrated to <span className="text-primary-highlight font-bold">Uniswap V2</span> and burned. 
          The token is then "graduated" and enters the hall of fame.
        </p>
      </div>
    </div>
  );
};

export default BondingCurveBar;
