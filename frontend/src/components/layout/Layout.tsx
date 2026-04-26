import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PageTransition from '../shared/PageTransition';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      <Navbar />
      <main className="pt-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      
      {/* Footer or extra layout elements */}
      <footer className="py-20 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">◈</span>
            <span className="font-display font-bold text-white/40 tracking-widest uppercase">SquadFun</span>
          </div>
          <div className="flex items-center gap-8 text-white/30 font-medium text-sm">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Telegram</a>
            <a href="#" className="hover:text-primary transition-colors">Docs</a>
            <a href="#" className="hover:text-primary transition-colors">Monad Explorer</a>
          </div>
          <div className="text-white/20 font-mono text-[10px] tracking-widest uppercase">
            © 2026 Crafted for the Monad Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
