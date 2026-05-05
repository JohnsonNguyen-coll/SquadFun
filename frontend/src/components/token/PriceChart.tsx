import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { API_BASE_URL } from '@/config/constants';
import { socket } from '@/socket';

interface PriceChartProps {
  tokenAddress: string;
  currentPrice?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ tokenAddress, currentPrice }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1h');
  const [priceChange, setPriceChange] = useState(0);
  const [firstPrice, setFirstPrice] = useState<number | null>(null);

  const fetchChartData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens/${tokenAddress}/chart?timeframe=${timeframe}`);
      const candles = await response.json();
      
      const formattedData: CandlestickData[] = candles.map((c: any) => ({
        time: (c.time / 1000) as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      if (seriesRef.current) {
        seriesRef.current.setData(formattedData);
        
        if (formattedData.length > 0) {
          const first = formattedData[0].open;
          const last = formattedData[formattedData.length - 1].close;
          setFirstPrice(first);
          setPriceChange(first !== 0 ? ((last - first) / first) * 100 : 0);
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firstPrice !== null && currentPrice !== undefined) {
      setPriceChange(firstPrice !== 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0);
    }
  }, [currentPrice, firstPrice]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#ffffff40',
      },
      grid: {
        vertLines: { color: '#ffffff05' },
        horzLines: { color: '#ffffff05' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    fetchChartData();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
 
    const handleConnect = () => {
      socket.emit('subscribe', tokenAddress.toLowerCase());
    };

    if (socket.connected) handleConnect();
    socket.on('connect', handleConnect);

    const tradeUpdateHandler = (update: any) => {
      if (update.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()) {
        const price = Number(update.price);
        const time = Math.floor(Date.now() / 1000) as Time;
        
        if (seriesRef.current) {
          // Update the current candle with the new price
          seriesRef.current.update({
            time: time,
            open: price, 
            high: price,
            low: price,
            close: price,
          });
        }
        
        // Also refresh the full chart data after a short delay to get the proper OHLC buckets
        setTimeout(fetchChartData, 2000);
      }
    };

    socket.on('trade_update', tradeUpdateHandler);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      socket.off('connect', handleConnect);
      socket.off('trade_update', tradeUpdateHandler);
      socket.emit('unsubscribe', tokenAddress.toLowerCase());
    };
  }, [tokenAddress, timeframe]);

  return (
    <div className="p-4 glass-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-2 relative z-10">
        <div>
          <h3 className="text-sm font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Market Performance</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold">
              {currentPrice ? Number(currentPrice).toFixed(10) : '0.000000'} ◈
            </span>
            <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(3)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {['1m', '5m', '1h', '1d'].map(p => (
            <button 
              key={p} 
              onClick={() => setTimeframe(p)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${timeframe === p ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PriceChart;
