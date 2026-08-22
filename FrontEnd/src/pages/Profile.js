import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';

const publicAppUrl = (process.env.REACT_APP_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');

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
  }, [token]);

  const fullName = dashboard?.fullName || storedName;
  const vipLevel = dashboard?.vipLevel || 'Bronze';
  const balance = dashboard ? `$${parseFloat(dashboard.balance).toFixed(2)}` : '$0.00';
  const referralCode = dashboard?.myReferralCode || '—';
  const minersCount = dashboard?.minersCount ?? 0;
  const hashrate = dashboard?.effectiveHashrate ?? 0;
  const teamCounts = (dashboard?.team || []).map(level => level.length);
  const income = dashboard?.incomeSummary || {};
  const inviteUrl = `${publicAppUrl}/signup?ref=${encodeURIComponent(referralCode)}`;

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
    <div className="premium-page min-h-screen bg-[#f5f8ff] text-slate-800 pb-24 font-sans antialiased">

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

      <div className="mx-4 mb-4">
        <a
          href="/CloudNova.apk"
          download="CloudNova.apk"
          className="profile-apk-download w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-md"
          aria-label="Download CloudNova APK"
        >
          <span className="profile-apk-icon"><Download size={16} aria-hidden="true" /></span>
          <span><small className="profile-apk-label">CLOUDNOVA APP</small>Download CloudNova APK</span>
        </a>
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

      {/* Projected mining income */}
      <div className="mx-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Mining Income</h3>
          <span className="text-[10px] font-bold text-slate-400">Estimated from active miners</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Daily', value: income.daily },
            { label: 'Weekly', value: income.weekly },
            { label: 'Monthly', value: income.monthly }
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-black text-emerald-600 mt-1">${Number(item.value || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">Collected: today ${Number(income.collectedToday || 0).toFixed(2)} · 7 days ${Number(income.collectedThisWeek || 0).toFixed(2)} · 30 days ${Number(income.collectedThisMonth || 0).toFixed(2)}</p>
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
                <input type="text" readOnly value={inviteUrl}
                  className="w-full bg-[#f8fafc] border rounded-xl p-2.5 text-[10px] text-slate-600 font-mono focus:outline-none font-bold" />
                <button type="button" onClick={() => copyToClipboard(inviteUrl, 'Invite URL')}
                  className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-[10px] font-black px-4 rounded-xl shadow-md uppercase whitespace-nowrap">Copy</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[{ label: 'L1', color: 'from-blue-500 to-blue-600', pct: '6%' },
                { label: 'L2', color: 'from-cyan-500 to-teal-500', pct: '4%' },
                { label: 'L3', color: 'from-teal-400 to-emerald-500', pct: '2%' }].map(l => (
                <div key={l.label} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm">
                  <div className={`w-10 h-10 bg-gradient-to-br ${l.color} rounded-xl flex items-center justify-center text-white font-black text-xs`}>{l.label}</div>
                  <span className="text-base font-black text-[#1e293b] mt-3">{teamCounts[l.label === 'L1' ? 0 : l.label === 'L2' ? 1 : 2] || 0}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">Members</span>
                  <span className="text-[9px] text-amber-500 font-black mt-2.5 leading-tight text-center">{l.pct}<br/>commission</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly bonus rules */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-800">Weekly Bonus</h3>
          <p className="text-[10px] text-slate-400 mt-1">Build your team to unlock weekly rewards.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[440px]">
            <thead className="bg-blue-50 text-[9px] uppercase tracking-wider text-slate-500 font-black">
              <tr>
                <th className="px-3 py-2">Job Title</th>
                <th className="px-3 py-2">Investors</th>
                <th className="px-3 py-2">Bonus</th>
              </tr>
            </thead>
            <tbody className="text-[10px] text-slate-600">
              {[
                ['New Partner', '0 - 29', '$0'],
                ['Junior Partner', '30 - 49', '$2 per week'],
                ['Intermediate Partner', '50 - 99', '$5 per week'],
                ['Senior Partner', '100 - 199', '$10 per week'],
                ['Regional Partner', '200 - 499', '$15 per week'],
                ['City Partner', '500 - 1,299', '$30 per week'],
                ['Executive Partner', '1,300 - 2,499', '$100 per week'],
                ['Corporate Partner', '2,500 - 4,999', '$1K per month'],
                ['Consultant', '≥ 5,000', '$15K per month']
              ].map(([title, investors, bonus], index) => (
                <tr key={title} className={index === 0 ? 'bg-blue-50/60' : 'border-t border-slate-100'}>
                  <td className="px-3 py-2 font-semibold text-slate-700">{title}</td>
                  <td className="px-3 py-2 text-blue-600 font-bold">{investors}</td>
                  <td className="px-3 py-2 font-semibold">{bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[9px] text-slate-400">Please contact customer service to get your weekly bonus.</p>
      </div>

      {/* Commission terms */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <h3 className="text-xs font-black text-slate-800">Team Commission Terms &amp; Conditions</h3>
        <p className="text-[10px] text-slate-400 mt-1">Invite friends to grow your team and earn commission.</p>
        <ul className="mt-3 space-y-2 text-[10px] text-slate-600 leading-relaxed">
          <li><span className="text-blue-500 font-black mr-1">•</span> Level 1 team deposits earn <strong className="text-blue-600">6%</strong> commission.</li>
          <li><span className="text-cyan-500 font-black mr-1">•</span> Level 2 team deposits earn <strong className="text-cyan-600">4%</strong> commission.</li>
          <li><span className="text-emerald-500 font-black mr-1">•</span> Level 3 team deposits earn <strong className="text-emerald-600">2%</strong> commission.</li>
        </ul>
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
