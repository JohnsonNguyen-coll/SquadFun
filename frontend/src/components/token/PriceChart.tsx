import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { API_BASE_URL } from '@/config/constants';
import { socket } from '@/socket';

interface PricePoint {
  time: string;
  price: number;
}

interface PriceChartProps {
  tokenAddress: string;
  currentPrice?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ tokenAddress, currentPrice }) => {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1h');

  const fetchChartData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens/${tokenAddress}/chart?timeframe=${timeframe}`);
      const candles = await response.json();
      
      const chartPoints = candles.map((c: any) => ({
        time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: c.close
      }));
      
      setData(chartPoints);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    
    socket.on('trade_update', (update) => {
      if (update.tokenAddress === tokenAddress) {
        fetchChartData();
      }
    });

    return () => {
      socket.off('trade_update');
    };
  }, [tokenAddress, timeframe]);

  const priceChange = data.length > 1 
    ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 
    : 0;

  return (
    <div className="h-[400px] w-full p-4 glass-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-2 relative z-10">
        <div>
          <h3 className="text-sm font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Price Performance</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold">
              {currentPrice ? currentPrice.toFixed(10) : (data.length > 0 ? data[data.length - 1].price.toFixed(10) : '0.000000')} ◈
            </span>
            <span className={`text-sm font-mono font-bold ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
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

      {loading && data.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff20', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              minTickGap={30}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#110D2A', border: '1px solid #8B5CF630', borderRadius: '12px', fontFamily: 'JetBrains Mono' }}
              itemStyle={{ color: '#C4B5FD' }}
              labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      
      {!loading && data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/20 text-sm font-body">No trades recorded yet</p>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
