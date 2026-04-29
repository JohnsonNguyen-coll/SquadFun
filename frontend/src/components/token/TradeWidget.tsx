import React, { useState } from 'react';
import GlowButton from '@/components/shared/GlowButton';
import { useWriteContract, useAccount, useBalance, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, parseAbi, formatEther, type Hash, erc20Abi } from 'viem';
import type { Token } from '@/mocks/data';
import confetti from 'canvas-confetti';
import { showToast } from '@/components/shared/Toast';

interface TradeWidgetProps {
  token: Token;
  onTradeSuccess?: () => void;
}

const TradeWidget: React.FC<TradeWidgetProps> = ({ token, onTradeSuccess }) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<Hash | undefined>();

  // Wait for transaction to be mined
  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Fetch MON balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Fetch Token balance
  const { data: tokenBalanceValue } = useReadContract({
    address: token.contractAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const tokenBalance = tokenBalanceValue !== undefined ? { value: tokenBalanceValue as bigint } : undefined;

  // Effect to handle success after transaction is mined
  React.useEffect(() => {
    if (isTxConfirmed && pendingTxHash) {
      setAmount('');
      setPendingTxHash(undefined);
      if (onTradeSuccess) onTradeSuccess();
      
      confetti({
        particleCount: mode === 'buy' ? 150 : 100,
        spread: mode === 'buy' ? 70 : 50,
        origin: { y: 0.6 },
        colors: mode === 'buy' ? ['#10b981', '#34d399', '#ffffff'] : ['#f43f5e', '#fb7185', '#ffffff']
      });
      showToast(`${mode === 'buy' ? 'Buy' : 'Sell'} transaction confirmed!`, 'success');
    }
  }, [isTxConfirmed, pendingTxHash, onTradeSuccess, mode]);

  const handlePercentageClick = (percent: number) => {
    if (mode === 'buy') {
      if (!ethBalance) return;
      // Reserve some for gas (approx 0.01 MON)
      const balance = Number(formatEther(ethBalance.value));
      const calculated = Math.max(0, (balance - 0.01) * (percent / 100));
      setAmount(calculated.toFixed(6));
    } else {
      if (!tokenBalance) return;
      const balance = Number(formatEther(tokenBalance.value));
      const calculated = balance * (percent / 100);
      setAmount(calculated.toFixed(6));
    }
  };

  const handleTrade = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsProcessing(true);

    try {
      let hash: Hash;
      if (mode === 'buy') {
        hash = await writeContractAsync({
          address: token.contractAddress as `0x${string}`,
          abi: parseAbi([
            "function buy(uint256 minTokensOut) external payable"
          ]),
          functionName: 'buy',
          args: [0n], 
          value: parseEther(amount),
          gas: 500000n,
        } as any);
      } else {
        hash = await writeContractAsync({
          address: token.contractAddress as `0x${string}`,
          abi: parseAbi([
            "function sell(uint256 tokenAmount, uint256 minMonOut) external"
          ]),
          functionName: 'sell',
          args: [parseEther(amount), 0n],
          gas: 500000n,
        } as any);
      }
      setPendingTxHash(hash);
      showToast('Transaction submitted to Monad...', 'info');
    } catch (error: any) {
      console.error('Full trade error:', error);
      if (error.message?.includes('rejected')) {
        showToast('Transaction was rejected in your wallet.', 'info');
      } else {
        showToast(`Transaction failed: ${error.shortMessage || error.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card p-6 bg-surface/30 border-primary/30 backdrop-blur-2xl">
      <div className="flex gap-1 bg-background/50 p-1 rounded-xl mb-6">
        <button 
          onClick={() => {
            setMode('buy');
            setAmount('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-body font-semibold uppercase tracking-[0.08em] transition-all ${mode === 'buy' ? 'bg-emerald-400 text-background' : 'text-white/40 hover:text-white/60'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => {
            setMode('sell');
            setAmount('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-body font-semibold uppercase tracking-[0.08em] transition-all ${mode === 'sell' ? 'bg-red-400 text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold mb-2 ml-1">
            Amount in {mode === 'buy' ? 'MON' : token.symbol}
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-background/50 border border-white/5 rounded-xl py-4 px-5 font-mono text-lg focus:outline-none focus:border-primary/50 transition-all"
          />
          <div className="absolute right-4 top-11 font-body font-semibold text-sm text-white/20">
            {mode === 'buy' ? '◈' : token.symbol}
          </div>
        </div>

        <div className="flex justify-between px-1">
          <div className="flex gap-2">
            {[25, 50, 100].map(v => (
              <button 
                key={v} 
                onClick={() => handlePercentageClick(v)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-[10px] font-mono font-bold transition-all text-white/60 hover:text-white"
              >
                {v === 100 ? 'MAX' : `${v}%`}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-mono text-white/40">
            Balance: <span className="text-white/60">
              {mode === 'buy' 
                ? (ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : '0.0000')
                : (tokenBalance ? Number(formatEther(tokenBalance.value)).toFixed(2) : '0.00')
              }
              {mode === 'buy' ? ' ◈' : ` ${token.symbol}`}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8 p-4 rounded-xl bg-background/30 border border-white/5 text-xs font-body">
        <div className="flex justify-between">
          <span className="text-white/40">Fee</span>
          <span className="font-mono font-bold text-white/80">1.0%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Price Impact</span>
          <span className="font-mono font-bold text-emerald-400">Dynamic</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Slip Tolerance</span>
          <span className="font-mono font-bold text-white/80">1.0%</span>
        </div>
      </div>

      <GlowButton 
        variant={mode === 'buy' ? 'emerald' : 'red'} 
        onClick={handleTrade}
        disabled={isProcessing || isWaitingForTx || !amount}
      >
        {isProcessing || isWaitingForTx ? 'Processing...' : (mode === 'buy' ? 'Cast Buy Spell' : 'Sell Tokens')}
      </GlowButton>

      <p className="mt-4 text-center text-[10px] text-white/20 font-body">
        Transactions are instant on Monad. <br />
        Secure Bonding Curve Trading.
      </p>
    </div>
  );
};

export default TradeWidget;
