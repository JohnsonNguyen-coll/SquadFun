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
      
      <footer className="mt-20 border-t border-primary/20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="rounded-3xl border border-primary/20 bg-background/50 px-8 py-8 md:px-12 md:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.14em] text-primary-highlight font-semibold mb-3">Start Building</p>
              <h3 className="text-3xl md:text-4xl font-body font-black tracking-normal text-white mb-3">Ready to launch your next token?</h3>
              <p className="text-white/60">Create your token in minutes and go live with your community on Monad.</p>
            </div>
            <a
              href="/create"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-white font-body font-semibold uppercase tracking-[0.08em] hover:bg-primary-glow transition-colors"
            >
              Create Token
            </a>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl text-primary">◈</span>
                <span className="font-body font-black text-white tracking-normal">SquadFun</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                The memecoin launchpad for animal communities on Monad.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-white text-sm font-semibold uppercase tracking-[0.1em]">Platform</p>
              <div className="flex flex-col gap-2 text-white/60 text-sm">
                <a href="/market" className="hover:text-primary transition-colors">Market</a>
                <a href="/leaderboard" className="hover:text-primary transition-colors">Hall of Fame</a>
                <a href="/create" className="hover:text-primary transition-colors">Create Token</a>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-white text-sm font-semibold uppercase tracking-[0.1em]">Community</p>
              <div className="flex flex-col gap-2 text-white/60 text-sm">
                <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Twitter</a>
                <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Telegram</a>
                <a href="https://docs.monad.xyz" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Docs</a>
                <a href="https://testnet.monadexplorer.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Monad Explorer</a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-primary/15 text-white/35 font-mono text-[11px] tracking-wider uppercase flex flex-col md:flex-row gap-3 md:gap-0 md:items-center md:justify-between">
            <span>© 2026 SquadFun. Built for the Monad Ecosystem.</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
