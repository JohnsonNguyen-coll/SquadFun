import React from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatMON } from '@/utils/format';
import logo from '@/assets/logosquadfun.png';

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/15">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="SquadFun" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-body font-black tracking-normal text-white">
            SquadFun
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/market" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Market</Link>
          <Link to="/leaderboard" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Hall of Fame</Link>
          <Link to="/create" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Cast Spell</Link>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && balance && (
            <div className="hidden lg:flex flex-col items-end px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-semibold">Your Mana</span>
              <span className="font-mono text-sm font-bold text-primary-highlight">{formatMON(balance.value)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-primary-highlight uppercase tracking-[0.06em]">Monad Testnet</span>
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button 
                          onClick={openConnectModal} 
                          className="bg-primary hover:bg-primary-glow text-white px-6 py-2.5 rounded-xl font-body font-semibold tracking-[0.04em] transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] active:scale-95"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button onClick={openChainModal} className="bg-red-400 text-white px-6 py-2.5 rounded-xl font-body font-semibold tracking-[0.04em]">
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <button 
                        onClick={openAccountModal}
                        className="flex items-center gap-3 bg-surface border border-white/10 hover:border-primary/50 px-4 py-2.5 rounded-xl transition-all"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary shadow-lg" />
                        <span className="font-mono text-sm font-bold">{account.displayName}</span>
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
