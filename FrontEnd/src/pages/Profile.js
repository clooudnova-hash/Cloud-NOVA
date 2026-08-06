import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [showBonus, setShowBonus] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [copied, setCopied] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const token = localStorage.getItem('token');
  const storedName = localStorage.getItem('userName') || 'User';
  const storedRole = localStorage.getItem('userRole') || 'user';

  useEffect(() => {
    if (!token) return;
    fetch('/api/user/dashboard', { headers: { authorization: token } })
      .then(r => r.json())
      .then(d => { if (d.balance !== undefined) setDashboard(d); })
      .catch(() => {});
  }, []);

  const fullName = dashboard?.fullName || storedName;
  const vipLevel = dashboard?.vipLevel || 'Bronze';
  const balance = dashboard ? `$${parseFloat(dashboard.balance).toFixed(2)}` : '$0.00';
  const referralCode = dashboard?.myReferralCode || '—';
  const minersCount = dashboard?.minersCount ?? 0;
  const hashrate = dashboard?.effectiveHashrate ?? 0;

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-slate-800 pb-24 font-sans antialiased">

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px 24px', maxWidth: '320px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚪</div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Log Out?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px', lineHeight: '1.5' }}>Are you sure you want to sign out of your CloudNova account?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmLogout}
                style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '800', color: '#fff', cursor: 'pointer' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copied && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', borderRadius: '12px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          ✅ {copied} copied!
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] mx-4 my-3 p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-base font-black uppercase tracking-tight">{fullName}</h2>
          <p className="text-[11px] font-medium text-blue-100 mt-0.5">CloudNova Member</p>
          <p className="text-[9px] font-mono opacity-80 mt-0.5">Ref: {referralCode}</p>
          <span className="inline-block bg-amber-500 text-white font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 shadow-sm">
            👑 {vipLevel} Member
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#2563eb] bg-[#070b19] shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <img src="/logo.png" alt="CloudNova" className="w-full h-full object-cover scale-105"
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <span className="text-[7px] font-black uppercase text-blue-100 tracking-widest mt-1">Official</span>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-3 gap-3 mx-4 my-4 text-center">
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</p>
          <p className="text-sm font-black text-emerald-600 mt-1">{balance}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Miners</p>
          <p className="text-sm font-black text-slate-700 mt-1">{minersCount}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hashrate</p>
          <p className="text-sm font-black text-blue-600 mt-1">{hashrate} TH/s</p>
        </div>
      </div>

      {/* Referral Section */}
      <div className="mx-4 mb-4">
        <button type="button" onClick={() => setShowBonus(!showBonus)}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center text-xs font-black text-slate-700 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <span className="text-sm">🎁</span>
            <span className="tracking-tight uppercase">Referral Link & Team Bonus</span>
          </div>
          <span className="text-slate-400 font-bold">{showBonus ? '∨' : '❯'}</span>
        </button>

        {showBonus && (
          <div className="bg-white border-x border-b border-slate-100 rounded-b-2xl p-4 -mt-3 shadow-md space-y-5">
            <div className="space-y-1.5 border-b pb-3 border-slate-100">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Your Referral Code</label>
              <div className="flex justify-between items-center bg-[#f8fafc] border rounded-xl p-2.5">
                <span className="text-xs font-black tracking-wider font-mono text-slate-800">{referralCode}</span>
                <button type="button" onClick={() => copyToClipboard(referralCode, 'Code')}
                  className="bg-slate-700 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase">Copy Code</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Full Invite URL</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={`${window.location.origin}/register?ref=${referralCode}`}
                  className="w-full bg-[#f8fafc] border rounded-xl p-2.5 text-[10px] text-slate-600 font-mono focus:outline-none font-bold" />
                <button type="button" onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${referralCode}`, 'Invite URL')}
                  className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-[10px] font-black px-4 rounded-xl shadow-md uppercase whitespace-nowrap">Copy</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[{ label: 'L1', color: 'from-blue-500 to-blue-600', pct: '6%' },
                { label: 'L2', color: 'from-cyan-500 to-teal-500', pct: '4%' },
                { label: 'L3', color: 'from-teal-400 to-emerald-500', pct: '2%' }].map(l => (
                <div key={l.label} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm">
                  <div className={`w-10 h-10 bg-gradient-to-br ${l.color} rounded-xl flex items-center justify-center text-white font-black text-xs`}>{l.label}</div>
                  <span className="text-base font-black text-[#1e293b] mt-3">0</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">Members</span>
                  <span className="text-[9px] text-amber-500 font-black mt-2.5 leading-tight text-center">{l.pct}<br/>commission</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {storedRole === 'admin' && (
          <div onClick={() => navigate('/admin')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
            <div className="flex items-center gap-3 text-xs font-bold text-blue-600"><span>🛡️</span><span>Admin Panel</span></div>
            <span className="text-slate-300 text-xs">❯</span>
          </div>
        )}
        <div onClick={() => navigate('/reports')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700"><span>📊</span><span>Team Investment Reports</span></div>
          <span className="text-slate-300 text-xs">❯</span>
        </div>
        <div onClick={() => navigate('/change-password')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700"><span>🔒</span><span>Modify Sign-In Password</span></div>
          <span className="text-slate-300 text-xs">❯</span>
        </div>
        <div onClick={() => navigate('/support')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700"><span>🎧</span><span>Online Customer Helpline</span></div>
          <span className="text-slate-300 text-xs">❯</span>
        </div>
        <div onClick={handleLogout} className="p-3.5 flex justify-between items-center cursor-pointer bg-red-50/20 text-red-600 font-bold hover:bg-red-50 transition">
          <div className="flex items-center gap-3 text-xs"><span>🚪</span><span>Secure Log Out</span></div>
          <span className="text-red-300 text-xs">❯</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
