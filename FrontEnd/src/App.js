import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { House, Zap, WalletCards, Gift, Crown, UserRound } from 'lucide-react';

import Home from './pages/Home';
import MiningPlans from './pages/MiningPlans';
import Wallet from './pages/Wallet';
import VIP from './pages/VIP';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Support from './pages/Support';
import Reports from './pages/Reports';
import ChangePassword from './pages/ChangePassword';
import Bonus from './pages/Bonus';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;
  const [showCommunityPopup, setShowCommunityPopup] = useState(true);
  const [platformStats, setPlatformStats] = useState({ members: 0, deposits: 0, depositedAmount: 0, withdrawals: 0, withdrawnAmount: 0, activities: [] });
  const [activityNotice, setActivityNotice] = useState(null);
  const hideChrome = ['/login', '/register', '/signup'].includes(currentPage);
  const hideHeader = hideChrome || currentPage === '/plans';

  useEffect(() => {
    fetch('/api/public/stats')
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data) setPlatformStats(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hideChrome) return undefined;
    const notices = (platformStats.activities || []).map(activity => ({
      icon: activity.type === 'deposit' ? '📥' : '📤',
      text: activity.type === 'deposit'
        ? `Deposit received: $${Number(activity.amount).toFixed(2)}`
        : `Withdrawal processed: $${Number(activity.amount).toFixed(2)}`
    }));
    if (!notices.length) return undefined;
    let noticeIndex = 0;
    let hideTimer;
    const showNotice = () => {
      setActivityNotice(notices[noticeIndex % notices.length]);
      noticeIndex += 1;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setActivityNotice(null), 5200);
    };
    const initialTimer = setTimeout(showNotice, 3500);
    const interval = setInterval(showNotice, 12000);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [hideChrome, platformStats]);

  return (
    <div style={{
      backgroundColor: '#0b0c0f',
      minHeight: '100vh',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    }}>
      {!hideHeader && (
        <header className="app-header" style={{
          backgroundColor: '#0b1a50',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 8px 24px rgba(2, 6, 23, 0.16)',
          backdropFilter: 'blur(14px)',
        }}>
          <div className="app-brand"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="CLOUDNOVA Premium Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(0, 210, 255, 0.5)',
                boxShadow: '0 0 12px rgba(0, 210, 255, 0.6)',
              }}
            />
            <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '20px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              CLOUD<span style={{ color: '#00d2ff' }}>NOVA</span>
            </span>
          </div>

          <div className="app-auth-actions" style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => navigate('/login')} style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: '600' }}>
              Login
            </button>
            <button type="button" onClick={() => navigate('/register')} style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', backgroundImage: 'linear-gradient(to right, #00d2ff, #9b51e0)', padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,210,255,0.2)' }}>
              Sign Up
            </button>
          </div>
        </header>
      )}

      <main style={{
        flex: 1,
        width: '100%',
        margin: '0 auto',
        paddingBottom: hideChrome ? 0 : '80px',
        boxSizing: 'border-box',
          position: 'relative',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<MiningPlans />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/support" element={<Support />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/bonus" element={<Bonus />} />
        </Routes>
      </main>

      {activityNotice && !hideChrome && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', left: '16px', bottom: '86px', zIndex: 1100, display: 'flex', alignItems: 'center', gap: '10px', maxWidth: 'calc(100vw - 32px)', padding: '11px 14px', borderRadius: '14px', background: 'linear-gradient(135deg, #0b1a50, #153393)', border: '1px solid rgba(0,210,255,0.35)', color: '#fff', boxShadow: '0 12px 30px rgba(2,6,23,0.35)', animation: 'cloudnovaNoticeIn 280ms ease-out' }}>
          <span style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '10px', background: 'rgba(0,210,255,0.16)', fontSize: '16px' }}>{activityNotice.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: '800', lineHeight: 1.3 }}>{activityNotice.text}</span>
        </div>
      )}

      {showCommunityPopup && !hideChrome && (
        <div role="dialog" aria-modal="true" aria-labelledby="community-popup-title" style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(2, 6, 23, 0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: '100%', maxWidth: '390px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', background: 'linear-gradient(160deg, #0b1a50 0%, #102b75 58%, #07112f 100%)', border: '1px solid rgba(0, 210, 255, 0.35)', borderRadius: '26px', boxShadow: '0 24px 80px rgba(0,0,0,0.55)', color: '#ffffff', position: 'relative' }}>
            <button type="button" aria-label="Close community popup" onClick={() => setShowCommunityPopup(false)} style={{ position: 'absolute', top: '16px', right: '16px', width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '22px', lineHeight: 1, cursor: 'pointer' }}>×</button>
            <div style={{ padding: '30px 24px 22px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #00d2ff, #2563eb)', boxShadow: '0 0 26px rgba(0,210,255,0.35)', fontSize: '32px' }}>📣</div>
              <p style={{ margin: 0, color: '#67e8f9', fontSize: '11px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>Official CloudNova Community</p>
              <h2 id="community-popup-title" style={{ margin: '8px 0 10px', fontSize: '24px', fontWeight: '900' }}>Stay Connected</h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>Get the latest announcements, bonus updates and important platform notifications directly from CloudNova.</p>
            </div>

            <div style={{ padding: '0 20px 20px', display: 'grid', gap: '12px' }}>
              <a href="https://whatsapp.com/channel/0029Vb8CeqrG8l57aaUcYd3s" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '15px', borderRadius: '16px', textDecoration: 'none', background: 'linear-gradient(135deg, #00bfa5, #087f8c)', border: '1px solid rgba(103,232,249,0.35)', color: '#ffffff', boxShadow: '0 8px 18px rgba(0,0,0,0.18)' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px' }}>📢</span>
                <span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: '14px' }}>Official WhatsApp Channel</strong><small style={{ display: 'block', marginTop: '3px', color: '#ccfbf1', fontSize: '11px' }}>Announcements and latest updates</small></span>
                <span style={{ fontSize: '20px' }}>›</span>
              </a>
              <a href="https://chat.whatsapp.com/CUUWbez2txZDolQWAGl6ql?s=cl&p=a&ilr=1" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '15px', borderRadius: '16px', textDecoration: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '1px solid rgba(147,197,253,0.35)', color: '#ffffff', boxShadow: '0 8px 18px rgba(0,0,0,0.18)' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px' }}>💬</span>
                <span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: '14px' }}>Join WhatsApp Group</strong><small style={{ display: 'block', marginTop: '3px', color: '#dbeafe', fontSize: '11px' }}>Connect with the CloudNova community</small></span>
                <span style={{ fontSize: '20px' }}>›</span>
              </a>
              <button type="button" onClick={() => setShowCommunityPopup(false)} style={{ marginTop: '2px', padding: '13px', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.35)', background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {!hideChrome && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, #0b1a50 0%, #07112f 100%)',
          borderTop: '1px solid rgba(0,210,255,0.22)',
          padding: '10px 0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 -4px 15px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(14px)',
        }}>
          {[
            { path: '/', label: 'Home', icon: House },
            { path: '/plans', label: 'Mining', icon: Zap },
            { path: '/wallet', label: 'Wallet', icon: WalletCards },
            { path: '/bonus', label: 'Bonus', icon: Gift },
            { path: '/vip', label: 'VIP', icon: Crown },
            { path: '/profile', label: 'Profile', icon: UserRound },
          ].map(({ path, label, icon }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', width: '60px', padding: '3px 0', borderRadius: '12px', transition: 'background 180ms ease' }}
            >
              <span style={{ width: '34px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', color: currentPage === path ? '#00d2ff' : '#a0aec0', background: currentPage === path ? 'rgba(0,210,255,0.12)' : 'transparent', boxShadow: currentPage === path ? '0 0 14px rgba(0,210,255,0.16)' : 'none' }}>
                {React.createElement(icon, { size: 19, strokeWidth: currentPage === path ? 2.6 : 1.8 })}
              </span>
              <span style={{ fontSize: '10px', color: currentPage === path ? '#00d2ff' : '#a0aec0', fontWeight: currentPage === path ? '800' : '400' }}>{label}</span>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
