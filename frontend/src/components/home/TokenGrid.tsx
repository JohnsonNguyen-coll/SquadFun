import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import TokenCard from './TokenCard';
import type { Token } from '@/mocks/data';

interface TokenGridProps {
  tokens: Token[];
}

const TokenGrid: React.FC<TokenGridProps> = ({ tokens }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || tokens.length === 0) return;

    // Entrance animation: slide up and fade in
    gsap.fromTo(".token-card", 
      { 
        y: 30, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.5, 
        stagger: 0.05, 
        ease: "power2.out",
        clearProps: "all"
      }
    );
  }, [tokens]); // Re-run when tokens list changes (e.g., tab filter)

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {tokens.map((token, index) => (
        <TokenCard 
          key={token.id} 
          token={token} 
          rank={index === 0 ? 1 : undefined} 
        />
      ))}
    </div>
  );
};

export default TokenGrid;
