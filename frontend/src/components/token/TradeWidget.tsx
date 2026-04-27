import React, { useState } from 'react';
import GlowButton from '@/components/shared/GlowButton';

const TradeWidget: React.FC = () => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');

  return (
    <div className="glass-card p-6 bg-surface/30 border-primary/30 backdrop-blur-2xl">
      <div className="flex gap-1 bg-background/50 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setMode('buy')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-body font-semibold uppercase tracking-[0.08em] transition-all ${mode === 'buy' ? 'bg-emerald-400 text-background' : 'text-white/40 hover:text-white/60'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => setMode('sell')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-body font-semibold uppercase tracking-[0.08em] transition-all ${mode === 'sell' ? 'bg-red-400 text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold mb-2 ml-1">
            Amount in {mode === 'buy' ? 'MON' : 'Tokens'}
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-background/50 border border-white/5 rounded-xl py-4 px-5 font-mono text-lg focus:outline-none focus:border-primary/50 transition-all"
          />
          <div className="absolute right-4 top-11 font-body font-semibold text-sm text-white/20">
            {mode === 'buy' ? '◈' : 'SYM'}
          </div>
        </div>

        <div className="flex justify-between px-1">
          <div className="flex gap-2">
            {[1, 5, 10].map(v => (
              <button 
                key={v} 
                onClick={() => setAmount(v.toString())}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-[10px] font-mono font-bold transition-all"
              >
                {v} {mode === 'buy' ? '◈' : 'M'}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-mono text-white/40">
            Balance: <span className="text-white/60">0.00</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 p-4 rounded-xl bg-background/30 border border-white/5 text-xs font-body">
        <div className="flex justify-between">
          <span className="text-white/40">Receive</span>
          <span className="font-mono font-bold text-white/80">0.00 SYM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Price Impact</span>
          <span className="font-mono font-bold text-emerald-400">0.05%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Slip Tolerance</span>
          <span className="font-mono font-bold text-white/80">1.0%</span>
        </div>
      </div>

      <GlowButton variant={mode === 'buy' ? 'emerald' : 'red'}>
        {mode === 'buy' ? 'Cast Buy Spell' : 'Sell Tokens'}
      </GlowButton>

      <p className="mt-4 text-center text-[10px] text-white/20 font-body">
        Transactions are instant on Monad. <br />
        Minimum received: 0.00 SYM
      </p>
    </div>
  );
};

export default TradeWidget;
