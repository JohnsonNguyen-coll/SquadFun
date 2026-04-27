import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'red';
  children: React.ReactNode;
}

const GlowButton: React.FC<GlowButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald': return 'bg-emerald-400 hover:bg-emerald-500 text-background';
      case 'red': return 'bg-red-400 hover:bg-red-500 text-white';
      case 'secondary': return 'bg-surface border border-primary/40 text-primary-highlight hover:border-primary';
      default: return 'bg-primary hover:bg-primary-glow text-white';
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'emerald': return 'rgba(52, 211, 153, 0.5)';
      case 'red': return 'rgba(248, 113, 113, 0.5)';
      default: return 'rgba(236, 72, 153, 0.5)';
    }
  };

  useGSAP(() => {
    if (!buttonRef.current || !glowRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' })
      .to(glowRef.current, { opacity: 0.8, scale: 1.2, duration: 0.2 }, 0);

    const onEnter = () => tl.play();
    const onLeave = () => tl.reverse();

    buttonRef.current.addEventListener('mouseenter', onEnter);
    buttonRef.current.addEventListener('mouseleave', onLeave);

    return () => {
      buttonRef.current?.removeEventListener('mouseenter', onEnter);
      buttonRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, [variant]);

  return (
    <div className="relative group inline-block w-full">
      <div 
        ref={glowRef}
        className="absolute -inset-1 rounded-xl blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: getGlowColor() }}
      />
      <button
        ref={buttonRef}
        className={`relative w-full py-3 px-6 rounded-xl font-body font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${getVariantStyles()} ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

export default GlowButton;
