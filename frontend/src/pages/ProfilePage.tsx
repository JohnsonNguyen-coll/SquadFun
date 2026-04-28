import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import TokenGrid from '@/components/home/TokenGrid';
import { formatAddress } from '@/utils/format';
import { supabase } from '@/config/supabase';
import { API_BASE_URL } from '@/config/constants';

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
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 5;
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    avatarUrl: '',
    bio: ''
  });

  const isOwner = connectedAddress?.toLowerCase() === address?.toLowerCase();

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${address}`);
      const result = await response.json();
      setData(result);
      setEditForm({
        username: result.profile.username || '',
        avatarUrl: result.profile.avatarUrl || '',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !connectedAddress) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${connectedAddress}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditForm(prev => ({ ...prev, avatarUrl: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedAddress,
          ...editForm
        })
      });
      if (response.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading) return <div className="py-20 text-center">Loading Alchemist...</div>;
  if (!data) return <div className="py-20 text-center">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="glass-card p-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 rounded-3xl bg-primary shadow-2xl p-1 overflow-hidden">
              <div className="w-full h-full bg-surface rounded-[22px] flex items-center justify-center text-5xl overflow-hidden">
                {data.profile.avatarUrl ? (
                  <img src={data.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  '🧙‍♂️'
                )}
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
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold">Tokens Created</span>
                  <span className="font-mono font-bold text-white">{Math.max(data.profile.totalCreated, data.tokens.length)}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-semibold">Total Trades</span>
                  <span className="font-mono font-bold text-emerald-400">{Math.max(data.profile.totalTraded, data.trades.length)}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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

        <div className="space-y-8">
          <h2 className="text-2xl font-body font-extrabold uppercase tracking-[0.1em] text-white/40">Recent Activity</h2>
          <div className="glass-card p-6 flex flex-col h-[520px]">
            <div className="space-y-4 flex-1 overflow-y-auto">
            {data.trades.slice((activityPage - 1) * activityPerPage, activityPage * activityPerPage).map((trade: any) => (
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
            </div>

            {data.trades.length > activityPerPage && (
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-mono">Page {activityPage} / {Math.ceil(data.trades.length / activityPerPage)}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={activityPage === 1}
                    onClick={() => setActivityPage(p => p - 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button 
                    disabled={activityPage === Math.ceil(data.trades.length / activityPerPage)}
                    onClick={() => setActivityPage(p => p + 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="glass-card p-10 w-full max-w-md relative z-10 border-primary/20">
            <h3 className="text-2xl font-body font-black mb-8">Update Alchemist</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 text-center">Avatar</label>
                <div className="flex justify-center mb-4">
                   <label className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {editForm.avatarUrl ? (
                          <img src={editForm.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🧙‍♂️</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-white uppercase">Change</span>
                        </div>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                   </label>
                </div>
                {uploading && <div className="text-[10px] text-center text-primary animate-pulse font-bold">Uploading...</div>}
              </div>

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
                  disabled={uploading}
                  className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary-glow transition-all font-bold disabled:opacity-50"
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
