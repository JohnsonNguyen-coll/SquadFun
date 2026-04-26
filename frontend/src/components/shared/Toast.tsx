import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, visible }) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (visible) {
      gsap.fromTo(toastRef.current, 
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(toastRef.current, { 
        x: 120, 
        opacity: 0, 
        duration: 0.2, 
        ease: 'power2.in',
        onComplete: onClose
      });
    }
  }, [visible]);

  if (!visible && !toastRef.current) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-400/10 border-emerald-400/50 text-emerald-400';
      case 'error': return 'bg-red-400/10 border-red-400/50 text-red-400';
      default: return 'bg-primary/10 border-primary/50 text-primary-highlight';
    }
  };

  return (
    <div 
      ref={toastRef}
      className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl ${getBgColor()}`}
    >
      <div className="font-mono text-sm font-bold uppercase">{type}</div>
      <div className="font-body text-sm text-white/90">{message}</div>
    </div>
  );
};

export default Toast;
