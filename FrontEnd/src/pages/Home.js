import React, { useState, useEffect } from 'react';

export default function Home() {
  const [btcPrice, setBtcPrice] = useState(89878.44);
  const [dashboard, setDashboard] = useState(null);
  const [collectToast, setCollectToast] = useState(false);

  // Live BTC price flicker
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(p => p + (Math.random() * 24 - 12));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load real user dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user/dashboard', { headers: { authorization: token } })
      .then(r => r.json())
      .then(data => { if (data.balance !== undefined) setDashboard(data); })
      .catch(() => {});
  }, []);

  const userName = dashboard?.fullName || localStorage.getItem('userName') || 'Member';
  const balance = dashboard ? `$${parseFloat(dashboard.balance).toFixed(2)}` : '$0.00';
  const minersCount = dashboard?.minersCount ?? 0;
  const vipLevel = dashboard?.vipLevel || 'Bronze';

  const miningPools = [
    { id: 1, name: 'CLOUDNOVA HZ Miner1', daily: '$0.50', total: '$10.00', duration: '40 Days', img: '⚡' },
    { id: 2, name: 'CLOUDNOVA HZ Miner2', daily: '$0.67', total: '$20.00', duration: '60 Days', img: '💎' }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'sans-serif' }}>

      {/* UPPER BLUE ZONE */}
      <div style={{ backgroundImage: 'linear-gradient(to bottom, #0b1a50 0%, #153393 100%)', padding: '24px 40px 40px 40px', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#ffb100', fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              Welcome, {vipLevel} Member — {userName}!
            </p>
            <div style={{ display: 'flex', gap: '60px' }}>
              <div style={{ marginRight: '40px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Total assets</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{balance} <span style={{ fontSize: '12px' }}>▼</span></p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Miners</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{minersCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pyramid */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', position: 'relative', margin: '20px 0' }}>
          <div style={{ position: 'relative', width: '0', height: '0', borderLeft: '95px solid transparent', borderRight: '95px solid transparent', borderBottom: '150px solid rgba(30,64,175,0.85)', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '1px', height: '150px', backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
            <div style={{ position: 'absolute', bottom: '-150px', left: '-65px', width: '130px', height: '4px', backgroundColor: '#60a5fa', boxShadow: '0 0 10px #3b82f6' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '90px', width: '160px', height: '40px', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 15px rgba(59,130,246,0.2)' }}></div>
          <div style={{ position: 'absolute', top: '90px', width: '160px', height: '40px', zIndex: 10, animation: 'gtcStraightOrbit 3s linear infinite' }}>
            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '42px', height: '42px', backgroundColor: '#ff9800', backgroundImage: 'radial-gradient(circle, #ffb74d, #f57c00)', borderRadius: '50%', border: '3px solid #ffe082', boxShadow: '0 0 20px rgba(255,152,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontWeight: '900', fontSize: '22px' }}>$</div>
          </div>
        </div>

        {collectToast && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399', fontSize: '13px', fontWeight: '700', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', marginBottom: '8px' }}>
            ✅ Income collected! Check your wallet balance.
          </div>
        )}
        <button
          onClick={() => { setCollectToast(true); setTimeout(() => setCollectToast(false), 4000); }}
          style={{ width: '100%', backgroundColor: '#2563eb', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 'bold', padding: '14px', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
          Get All
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>Please get your income every day, or it will disappear after 24 hours.</p>
      </div>

      {/* TICKER */}
      <div style={{ backgroundColor: '#ffffff', color: '#334155', padding: '10px 0', fontSize: '12px', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ whiteSpace: 'nowrap', animation: 'cloudnovaTicker 18s linear infinite' }}>
          📢 Welcome to CLOUDNOVA — Our Platform is Officially LIVE! Thank you for joining us. We wish you great success on your journey.
        </div>
      </div>

      {/* LOWER REGION */}
      <div style={{ padding: '24px 40px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MARKET TREND</p>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#1e293b' }}>BTC / USDT <span style={{ color: '#10b981', fontSize: '12px', marginLeft: '4px', fontWeight: '800' }}>+2.82%</span></h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b', fontFamily: 'monospace' }}>${btcPrice.toFixed(2)}</h3>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>Real-time CLOUDNOVA Price</p>
            </div>
          </div>
          <div style={{ marginTop: '24px', height: '90px', overflow: 'hidden', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 500 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="premiumChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              <path d="M 0,45 C 60,15 110,65 170,35 C 230,10 280,60 340,25 C 400,15 450,55 520,30 L 520,80 L 0,80 Z" fill="url(#premiumChartGrad)" style={{ animation: 'fluidGraphPulse 3s ease-in-out infinite alternate' }}/>
              <path d="M 0,45 C 60,15 110,65 170,35 C 230,10 280,60 340,25 C 400,15 450,55 520,30" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" style={{ animation: 'fluidGraphPulse 3s ease-in-out infinite alternate' }}/>
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Active Mining Pools</h2>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>View All &gt;&gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {miningPools.map((pool) => (
            <div key={pool.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', backgroundColor: '#0f172a', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', marginRight: '12px' }}>{pool.img}</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{pool.name}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Daily: <span style={{ color: '#0f172a', fontWeight: '500' }}>{pool.daily}</span></p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold', color: '#2563eb' }}>{pool.total}</p>
                </div>
              </div>
              <button onClick={() => window.location.href = '/plans'} style={{ backgroundColor: '#2563eb', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Rent</button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cloudnovaTicker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes gtcStraightOrbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fluidGraphPulse { 0% { transform: scaleY(0.9) translateY(4px); opacity: 0.85; } 100% { transform: scaleY(1.05) translateY(-2px); opacity: 1; } }
      `}</style>
    </div>
  );
}
