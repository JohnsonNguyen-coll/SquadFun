import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import TokenGrid from '@/components/home/TokenGrid';
import { formatAddress } from '@/utils/format';

interface UserData {
  profile: {
    walletAddress: string;
    totalCreated: number;
    totalTraded: number;
    username?: string;
    avatarUrl?: string;
    bio?: string;
  };
  tokens: any[];
  trades: any[];
}

const ProfilePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { address: connectedAddress } = useAccount();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    avatarUrl: '',
    bio: ''
  });

  const isOwner = connectedAddress?.toLowerCase() === address?.toLowerCase();

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/${address}`);
      const result = await response.json();
      setData(result);
      setEditForm({
        username: result.profile.username || '',
        avatarUrl: result.profile.avatarUrl || '🧙‍♂️',
        bio: result.profile.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) fetchProfile();
  }, [address]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedAddress,
          ...editForm
        })
      });
      if (response.ok) {
        setIsEditing(false);
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading) return <div className="py-20 text-center">Loading Alchemist...</div>;
  if (!data) return <div className="py-20 text-center">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Header Profile */}
      <div className="glass-card p-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 rounded-3xl bg-primary shadow-2xl p-1">
              <div className="w-full h-full bg-surface rounded-[22px] flex items-center justify-center text-5xl">
                {data.profile.avatarUrl || '🧙‍♂️'}
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-body font-black mb-3 tracking-normal">
                {data.profile.username || 'Alchemist'} 
                <span className="ml-3 text-lg font-mono font-medium text-white/40">{formatAddress(address || '')}</span>
              </h1>
              {data.profile.bio && <p className="text-white/60 mb-4 max-w-md">{data.profile.bio}</p>}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold">Spells Cast</span>
                  <span className="font-mono font-bold text-white">{data.profile.totalCreated}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold">Giao dịch</span>
                  <span className="font-mono font-bold text-emerald-400">{data.profile.totalTraded}</span>
                </div>
              </div>
            </div>
          </div>

          {isOwner && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-body font-bold text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Created Tokens */}
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-2xl font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Created Tokens</h2>
          {data.tokens.length > 0 ? (
            <TokenGrid tokens={data.tokens} />
          ) : (
            <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center">
               <div className="text-4xl mb-4 opacity-20">🪄</div>
               <p className="text-white/30">No spells cast yet.</p>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="space-y-8">
          <h2 className="text-2xl font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Recent Activity</h2>
          <div className="glass-card p-6 space-y-4">
            {data.trades.map((trade: any) => (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trade.type === 'buy' ? 'B' : 'S'}
                  </div>
                  <div>
                    <Link to={`/token/${trade.tokenAddress}`} className="text-sm font-bold hover:text-primary transition-colors">{trade.token.symbol}</Link>
                    <div className="text-[10px] text-white/40">{new Date(trade.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold">{Number(trade.ethAmount).toFixed(4)} MON</div>
                </div>
              </div>
            ))}
            {data.trades.length === 0 && (
              <div className="text-center py-8 text-white/20 text-sm italic">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="glass-card p-10 w-full max-w-md relative z-10 border-primary/20">
            <h3 className="text-2xl font-body font-black mb-8">Update Alchemist</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Username</label>
                <input 
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder="The Master Alchemist"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Avatar (Emoji)</label>
                <input 
                  type="text"
                  value={editForm.avatarUrl}
                  onChange={e => setEditForm({...editForm, avatarUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder="🧙‍♂️"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors h-24 resize-none"
                  placeholder="Tell us about your spells..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary-glow transition-all font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
