import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

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

  const hideChrome = ['/login', '/register'].includes(currentPage);
  const hideHeader = hideChrome || currentPage === '/plans';

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
        <header style={{
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
        }}>
          <div
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

          <div style={{ display: 'flex', gap: '12px' }}>
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
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<MiningPlans />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/support" element={<Support />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/bonus" element={<Bonus />} />
        </Routes>
      </main>

      {!hideChrome && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#171923',
          borderTop: '1px solid #2d3748',
          padding: '10px 0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 -4px 15px rgba(0,0,0,0.5)',
        }}>
          {[
            { path: '/', label: 'Home', icon: '🏠' },
            { path: '/plans', label: 'Mining', icon: '⚡' },
            { path: '/wallet', label: 'Wallet', icon: '💳' },
            { path: '/bonus', label: 'Bonus', icon: '🎁' },
            { path: '/vip', label: 'VIP', icon: '👑' },
            { path: '/profile', label: 'Profile', icon: '👤' },
          ].map(({ path, label, icon }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', width: '60px' }}
            >
              <span style={{ fontSize: '20px', opacity: currentPage === path ? 1 : 0.45 }}>{icon}</span>
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
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
