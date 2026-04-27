import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface PricePoint {
  time: string;
  price: number;
}

const data: PricePoint[] = [
  { time: '00:00', price: 0.000010 },
  { time: '04:00', price: 0.000012 },
  { time: '08:00', price: 0.000011 },
  { time: '12:00', price: 0.000015 },
  { time: '16:00', price: 0.000014 },
  { time: '20:00', price: 0.000018 },
  { time: '23:59', price: 0.000020 },
];

const PriceChart: React.FC = () => {
  return (
    <div className="h-[400px] w-full p-4 glass-card">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h3 className="text-sm font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Price Performance</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold">0.000020 ◈</span>
            <span className="text-sm font-mono font-bold text-emerald-400">+12.5%</span>
          </div>
        </div>
        <div className="flex gap-2">
          {['1H', '4H', '1D', '1W'].map(p => (
            <button key={p} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${p === '1H' ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );
};

export default PriceChart;
