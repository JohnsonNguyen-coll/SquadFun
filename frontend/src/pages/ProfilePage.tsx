import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
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

  // Pagination State
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 5;
  const [tokenPage, setTokenPage] = useState(1);
  const tokensPerPage = 4;

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

  if (loading) return (
    <div className="py-40 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
      <p className="text-white/40 font-body uppercase tracking-[0.2em] text-xs">Loading Profile...</p>
    </div>
  );

  if (!data) return (
    <div className="py-40 text-center">
      <div className="text-6xl mb-6">👻</div>
      <h2 className="text-3xl font-body font-black mb-4">User Not Found</h2>
      <p className="text-white/40 mb-8">This wallet hasn't visited the platform yet.</p>
      <Link to="/" className="text-primary hover:text-primary-glow font-bold uppercase tracking-widest text-xs">Return to Market</Link>
    </div>
  );

  const visibleTokens = data.tokens.slice((tokenPage - 1) * tokensPerPage, tokenPage * tokensPerPage);
  const totalTokenPages = Math.ceil(data.tokens.length / tokensPerPage);

  const visibleTrades = data.trades.slice((activityPage - 1) * activityPerPage, activityPage * activityPerPage);
  const totalActivityPages = Math.ceil(data.trades.length / activityPerPage);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
      {/* Premium Profile Header */}
      <div className="relative mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-monad/5 to-transparent rounded-[40px] blur-3xl -z-10" />
        <div className="glass-card p-8 md:p-12 relative overflow-hidden border-primary/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[32px] bg-gradient-to-br from-primary to-monad p-1 shadow-[0_20px_50px_rgba(236,72,153,0.3)]">
                  <div className="w-full h-full bg-surface rounded-[28px] flex items-center justify-center text-6xl overflow-hidden">
                    {data.profile.avatarUrl ? (
                      <img src={data.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      '🧙‍♂️'
                    )}
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shadow-xl hover:bg-primary transition-colors group-hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  </button>
                )}
              </div>

              <div className="text-center md:text-left pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-primary-highlight uppercase tracking-widest">Active User</span>
                </div>
                <h1 className="text-5xl font-body font-black mb-4 tracking-tight leading-none text-white">
                  {data.profile.username || 'Squad Member'}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white/40">{formatAddress(address || '')}</span>
                  <button className="text-white/20 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  </button>
                </div>
                {data.profile.bio && <p className="text-white/50 mb-8 max-w-xl text-lg leading-relaxed font-body">"{data.profile.bio}"</p>}
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-40 h-24 rounded-3xl bg-white/[0.03] border border-white/5 p-5 flex flex-col justify-center items-center group hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-body font-black text-white group-hover:text-primary transition-colors text-center">{data.profile.totalCreated}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold mt-1 text-center">Tokens Created</div>
                </div>
                <div className="flex-1 md:w-40 h-24 rounded-3xl bg-white/[0.03] border border-white/5 p-5 flex flex-col justify-center items-center group hover:border-monad/30 transition-colors">
                  <div className="text-3xl font-body font-black text-monad group-hover:text-primary-glow transition-colors text-center">{data.profile.totalTraded}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold mt-1 text-center">Total Trades</div>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full lg:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all font-body font-bold text-sm tracking-widest uppercase"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Created Tokens */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-body font-black uppercase tracking-[0.15em] text-white/80 flex items-center gap-4">
              Created Tokens
              <span className="h-px w-20 bg-gradient-to-r from-primary/40 to-transparent" />
            </h2>

            {totalTokenPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  disabled={tokenPage === 1}
                  onClick={() => setTokenPage(p => p - 1)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="font-mono text-xs text-white/40">{tokenPage} / {totalTokenPages}</span>
                <button
                  disabled={tokenPage === totalTokenPages}
                  onClick={() => setTokenPage(p => p + 1)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            )}
          </div>

          {data.tokens.length > 0 ? (
            <div className="glass-card p-8 border-primary/10 overflow-hidden">
              <div className="flex flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {visibleTokens.map((token: any) => (
                  <Link
                    key={token.id}
                    to={`/token/${token.contractAddress}`}
                    className="flex-shrink-0 w-64 p-5 rounded-[32px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary/30 transition-all group"
                  >
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-xl">
                        <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-white">
                        {token.symbol}
                      </div>
                    </div>

                    <h3 className="font-body font-black text-white text-lg mb-1 truncate">{token.name}</h3>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Mkt Cap</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">${Number(token.marketCap).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Price</div>
                        <div className="text-xs font-mono font-bold text-white">{Number(token.price).toFixed(6)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-20 border border-dashed border-white/10 rounded-[40px] text-center bg-white/[0.01]">
              <div className="text-6xl mb-6 opacity-20">🪄</div>
              <h3 className="text-xl font-body font-bold text-white/40 mb-2">No tokens created yet</h3>
              <p className="text-white/20 max-w-xs mx-auto">This user hasn't created any tokens on the platform yet.</p>
            </div>
          )}
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-4 space-y-10">
          <h2 className="text-2xl font-body font-black uppercase tracking-[0.15em] text-white/80">Activity Feed</h2>

          <div className="glass-card p-8 flex flex-col h-[600px] border-monad/20">
            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {visibleTrades.length > 0 ? (
                visibleTrades.map((trade: any) => (
                  <div key={trade.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-lg ${trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.type === 'buy' ? 'BUY' : 'SELL'}
                        </div>
                        <div>
                          <Link to={`/token/${trade.tokenAddress}`} className="text-sm font-black hover:text-primary transition-colors block">
                            {trade.token.symbol}
                          </Link>
                          <span className="text-[10px] text-white/30 font-mono">{new Date(trade.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">{Number(trade.ethAmount).toFixed(4)} MON</div>
                        <div className="text-[9px] text-white/20 font-mono">Value</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white/20 font-mono">TX: {trade.txHash.slice(0, 10)}...</span>
                      <a href={`https://testnet.monadexplorer.com/tx/${trade.txHash}`} target="_blank" className="text-primary hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <div className="text-4xl mb-4">💎</div>
                  <p className="text-sm font-body">No arena dust yet.</p>
                </div>
              )}
            </div>

            {totalActivityPages > 1 && (
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Page {activityPage} / {totalActivityPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={activityPage === 1}
                    onClick={() => setActivityPage(p => p - 1)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <button
                    disabled={activityPage === totalActivityPages}
                    onClick={() => setActivityPage(p => p + 1)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal Refined */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={() => setIsEditing(false)} />
          <div className="glass-card p-10 w-full max-w-md relative z-10 border-primary/30 shadow-[0_0_100px_rgba(236,72,153,0.2)]">
            <h3 className="text-3xl font-body font-black mb-8 tracking-tight">Edit Profile</h3>
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="flex flex-col items-center">
                <label className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary/40 to-monad/40 p-1 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    <div className="w-full h-full bg-surface rounded-[28px] flex items-center justify-center overflow-hidden">
                      {editForm.avatarUrl ? (
                        <img src={editForm.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                      </div>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
                {uploading && <div className="mt-4 text-[10px] text-primary animate-pulse font-black uppercase tracking-widest">Uploading...</div>}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-primary/5 transition-all font-body"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-primary focus:bg-primary/5 transition-all h-32 resize-none font-body text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-body font-bold text-sm tracking-widest uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-primary hover:bg-primary-glow shadow-lg shadow-primary/20 transition-all font-body font-bold text-sm tracking-widest uppercase disabled:opacity-50"
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
