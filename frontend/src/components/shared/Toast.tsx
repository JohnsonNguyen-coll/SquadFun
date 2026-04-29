import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    info: 'bg-primary/10 border-primary/20 text-primary-highlight',
  };

  const icons = {
    success: '✨',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div 
      className={`fixed top-24 right-6 z-[9999] min-w-[320px] max-w-[400px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      } ${bgColors[type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          <h4 className="text-[10px] uppercase tracking-widest font-black mb-1 opacity-50">
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'System Message'}
          </h4>
          <p className="text-sm font-body font-medium leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/20 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-[toast-progress_4s_linear_forwards]" />
    </div>
  );
};

// Singleton controller for toast
let toastContainer: HTMLDivElement | null = null;
let root: any = null;

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);
    root = createRoot(toastContainer);
  }

  const handleClose = () => {
    // We could handle multiple toasts here, but for simplicity let's just clear
    root.render(null);
  };

  root.render(<Toast message={message} type={type} onClose={handleClose} />);
};
