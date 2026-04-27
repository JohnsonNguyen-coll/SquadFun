import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { API_BASE_URL } from '@/config/constants';
import type { Token } from '@/mocks/data';
import { formatMON } from '@/utils/format';

import { socket } from '@/socket';

const LiveTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<Token[]>([]);

  const fetchTokens = () => {
    fetch(`${API_BASE_URL}/tokens`)
      .then(res => res.json())
      .then(data => setTokens(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTokens();
    
    socket.on('global_update', (update) => {
      console.log('Global trade update:', update);
      fetchTokens();
    });

    return () => {
      socket.off('global_update');
    };
  }, []);

  // Use GSAP ticker for smooth 60fps marquee
  useGSAP(() => {
    if (!tickerRef.current) return;

    const tickerWidth = tickerRef.current.offsetWidth / 2;
    
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(tickerRef.current, {
      x: -tickerWidth,
      duration: 60,
      ease: 'none',
    });

    const onEnter = () => gsap.to(tl, { timeScale: 0.2, duration: 0.5 });
    const onLeave = () => gsap.to(tl, { timeScale: 1, duration: 0.5 });

    containerRef.current?.addEventListener('mouseenter', onEnter);
    containerRef.current?.addEventListener('mouseleave', onLeave);

    return () => {
      containerRef.current?.removeEventListener('mouseenter', onEnter);
      containerRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Double the tokens for seamless loop
  const displayTokens = [...tokens, ...tokens];
  
  if (tokens.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full bg-surface/50 border-y border-white/5 py-4 overflow-hidden relative group cursor-default"
    >
      <div 
        ref={tickerRef} 
        className="flex items-center gap-12 whitespace-nowrap w-fit px-12"
      >
        {displayTokens.map((token, i) => (
          <div key={`${token.id}-${i}`} className="flex items-center gap-3 group/item">
            <img 
              src={token.imageUrl} 
              alt={token.name} 
              className="w-6 h-6 rounded-full grayscale group-hover/item:grayscale-0 transition-all" 
            />
            <span className="font-body font-semibold text-sm tracking-normal text-white/80 group-hover/item:text-white">
              {token.symbol}
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              +{(token.priceChange24h || 0).toFixed(1)}%
            </span>
            <span className="font-mono text-[10px] text-white/20">
              {formatMON(token.reserveMon)}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
