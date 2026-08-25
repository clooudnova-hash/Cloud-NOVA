import React, { useState, useEffect } from 'react';
import { Download, Trophy, X, ChevronRight } from 'lucide-react';

export default function Home() {
  const [btcPrice, setBtcPrice] = useState(89878.44);
  const [dashboard, setDashboard] = useState(null);
  const [collectToast, setCollectToast] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showWinners, setShowWinners] = useState(false);
  const [weeklyWinner, setWeeklyWinner] = useState(null);

  const formatDuration = milliseconds => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Refresh the displayed BTC price from a live market source.
  useEffect(() => {
    fetch('/api/public/weekly-winner').then(response => response.ok ? response.json() : null).then(data => { if (data?.active) setWeeklyWinner(data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadBtcPrice = async () => {
      try {
        const response = await fetch('/api/market/btc');
        const data = await response.json();
        const livePrice = Number(data?.price);
        if (Number.isFinite(livePrice)) setBtcPrice(livePrice);
      } catch {
        // Keep the last known price if the market service is unavailable.
      }
    };

    loadBtcPrice();
    const interval = setInterval(loadBtcPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const collectIncome = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setCollectToast('Please login to collect mining income.'); return; }
    setCollecting(true);
    try {
      const response = await fetch('/api/mining/collect', { method: 'POST', headers: { authorization: token } });
      const data = await response.json();
      if (response.ok) {
        setCollectToast(data.credited > 0 ? `Mining income collected: $${Number(data.credited).toFixed(2)}` : data.message);
        setDashboard(prev => prev ? { ...prev, balance: data.balance } : prev);
      } else setCollectToast(data.message || 'Unable to collect mining income.');
    } catch { setCollectToast('Network error. Please try again.'); }
    finally {
      setCollecting(false);
      setTimeout(() => setCollectToast(''), 4000);
    }
  };

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
  const activeContracts = (dashboard?.miningContracts || []).filter(contract => contract.status === 'active');
  const incomeNodes = activeContracts.length ? activeContracts : [{ id: 'preview-node', lastCollectedAt: new Date().toISOString(), preview: true }];
  const winnerTimeLeft = weeklyWinner ? Math.max(0, new Date(weeklyWinner.expiresAt).getTime() - currentTime) : 0;
  const winnerHours = Math.floor(winnerTimeLeft / 3600000);
  const winnerMinutes = Math.floor((winnerTimeLeft % 3600000) / 60000);
  const winnerSeconds = Math.floor((winnerTimeLeft % 60000) / 1000);
  const winnerIsActive = Boolean(weeklyWinner && winnerTimeLeft > 0);

  const miningPools = activeContracts.map((contract, index) => ({
    id: contract.id,
    name: `CloudNova ${contract.tier} Miner`,
    daily: `$${Number(contract.dailyIncome || 0).toFixed(2)}`,
    total: `$${Number((contract.dailyIncome || 0) * (contract.durationDays || 0)).toFixed(2)}`,
    duration: `${contract.durationDays || 0} Days`,
    img: ['⚡', '💎', '🔷'][index % 3]
  }));

  return (
    <div className="premium-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'sans-serif' }}>

      <button
        type="button"
        className="apk-download-button home-apk-download"
        aria-label="Download CloudNova APK"
        onClick={() => window.location.assign(`${window.location.origin}/api/download/apk`)}
      >
        <span className="apk-download-icon"><Download size={17} strokeWidth={2.8} /></span>
        <span className="apk-download-copy"><span className="apk-download-eyebrow">GET THE APP</span><span className="apk-download-title">Download APK</span></span>
      </button>

      {/* UPPER BLUE ZONE */}
      <div className="home-top-zone" style={{ backgroundImage: 'linear-gradient(to bottom, #0b1a50 0%, #153393 100%)', padding: '24px 40px 40px 40px', color: '#ffffff', position: 'relative' }}>
        <div className="home-summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
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

        {/* Pyramid and per-miner income timers */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '280px', position: 'relative', margin: '12px 0 8px' }}>
          <div className="mining-core" style={{ position: 'relative', width: '0', height: '0', borderLeft: '95px solid transparent', borderRight: '95px solid transparent', borderBottom: '150px solid rgba(30,64,175,0.85)', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))', zIndex: 5 }}>
            <div className="mining-core-base" style={{ position: 'absolute', bottom: '-150px', left: '-65px', width: '130px', height: '4px', backgroundColor: '#60a5fa', boxShadow: '0 0 10px #3b82f6' }}></div>
          </div>
          <div className="mining-rail mining-rail-left" />
          <div className="mining-rail mining-rail-right" />
          {incomeNodes.map((contract, index) => {
            const angle = (index / incomeNodes.length) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 39;
            const top = 50 + Math.sin(angle) * 39;
            const lastCollected = new Date(contract.lastCollectedAt).getTime();
            const readyAt = Number.isFinite(lastCollected) ? lastCollected + 86400000 : null;
            const ready = readyAt !== null && currentTime >= readyAt;
            return (
              <div key={contract.id} style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)', zIndex: 12, width: '76px', textAlign: 'center' }}>
                <div style={{ width: '42px', height: '42px', margin: '0 auto', backgroundColor: ready ? '#f59e0b' : '#cbd5e1', backgroundImage: ready ? 'radial-gradient(circle, #fcd34d, #f97316)' : 'none', borderRadius: '50%', border: `3px solid ${ready ? '#fde68a' : '#475569'}`, boxShadow: ready ? '0 0 20px rgba(245,158,11,0.7)' : '0 0 15px rgba(59,130,246,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: ready ? '#ffffff' : '#0f172a', fontWeight: '900', fontSize: '22px', animation: `incomeCoinFloat ${2.2 + (index % 3) * 0.35}s ease-in-out infinite`, animationDelay: `${index * 0.18}s` }}>$</div>
                <span style={{ display: 'inline-block', marginTop: '5px', background: 'rgba(2,6,23,0.9)', color: ready ? '#86efac' : '#ffffff', borderRadius: '10px', padding: '3px 6px', fontSize: '9px', fontWeight: '800', whiteSpace: 'nowrap' }}>{ready ? 'READY' : readyAt ? formatDuration(readyAt - currentTime) : '--:--:--'}</span>
              </div>
            );
          })}
          <div className="home-core-coin" style={{ position: 'absolute', left: '50%', top: '57%', transform: 'translate(-50%, -50%)', zIndex: 18, width: '58px', height: '58px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #67e8f9, #2563eb 48%, #0b1a50 84%)', border: '4px solid #7dd3fc', boxShadow: '0 0 25px rgba(14,165,233,0.72), inset 0 0 10px rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '31px', fontWeight: '900', animation: 'cloudnovaCoreCoin 2.8s ease-in-out infinite' }}>$</div>
          {!activeContracts.length && <p style={{ position: 'absolute', bottom: '2px', color: '#94a3b8', fontSize: '10px', margin: 0 }}>Demo preview • Start a plan to activate real income</p>}
        </div>

        {collectToast && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399', fontSize: '13px', fontWeight: '700', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', marginBottom: '8px' }}>
            {collectToast}
          </div>
        )}
        <button
          onClick={collectIncome}
          disabled={collecting}
          style={{ width: '100%', backgroundColor: '#2563eb', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 'bold', padding: '14px', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
          {collecting ? 'Collecting...' : 'Collect Mining Income'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>Please get your income every day, or it will disappear after 24 hours.</p>
      </div>

      {/* TICKER */}
      <div style={{ backgroundColor: '#ffffff', color: '#334155', padding: '10px 0', fontSize: '12px', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ whiteSpace: 'nowrap', animation: 'cloudnovaTicker 18s linear infinite' }}>
          📢 Welcome to CLOUDNOVA — Our Platform is Officially LIVE! Thank you for joining us. We wish you great success on your journey.
        </div>
      </div>

      {winnerIsActive && (
        <button type="button" onClick={() => setShowWinners(true)} aria-label="Open weekly winners" className="weekly-winner-line">
          <span className="weekly-winner-icon"><Trophy size={17} strokeWidth={2.4} /></span>
          <span className="weekly-winner-copy"><strong>This Week's Biggest Winner</strong><span>{weeklyWinner.name} won ${Number(weeklyWinner.amount).toFixed(2)}</span></span>
          <span className="weekly-winner-countdown">{String(winnerHours).padStart(2, '0')}:{String(winnerMinutes).padStart(2, '0')}:{String(winnerSeconds).padStart(2, '0')}</span>
          <ChevronRight className="weekly-winner-arrow" size={19} strokeWidth={2.5} />
        </button>
      )}

      {showWinners && (
        <div className="weekly-winner-overlay" role="dialog" aria-modal="true" aria-labelledby="weekly-winner-title" onClick={() => setShowWinners(false)}>
          <div className="weekly-winner-panel" onClick={event => event.stopPropagation()}>
            <button type="button" className="weekly-winner-close" aria-label="Close weekly winners" onClick={() => setShowWinners(false)}><X size={19} /></button>
            <div className="weekly-winner-heading"><span><Trophy size={22} /></span><div><p>CloudNova Rewards</p><h2 id="weekly-winner-title">Weekly Winners</h2></div></div>
            <p className="weekly-winner-subtitle">Celebrating the strongest performers this week.</p>
            <div className="weekly-winner-list">
              {(weeklyWinner?.winners || []).map(winner => <div className={`weekly-winner-row winner-rank-${winner.rank}`} key={winner.rank}><span className="winner-rank">{winner.rank === 1 ? '1st' : winner.rank === 2 ? '2nd' : winner.rank === 3 ? '3rd' : `${winner.rank}th`}</span><span className="winner-name">{winner.name}</span><strong>${Number(winner.amount).toFixed(2)}</strong></div>)}
            </div>
            <p className="weekly-winner-expiry">Next update in {String(winnerHours).padStart(2, '0')}:{String(winnerMinutes).padStart(2, '0')}:{String(winnerSeconds).padStart(2, '0')}</p>
          </div>
        </div>
      )}

      {/* CLOUD VIDEO */}
      <section style={{ padding: '20px 40px 0', backgroundColor: '#f8fafc' }}>
        <div className="cloudnova-video-card" style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e3a8a', boxShadow: '0 8px 24px rgba(15,23,42,0.16)' }}>
          <div style={{ padding: '14px 16px 10px', color: '#ffffff' }}>
            <p style={{ margin: 0, color: '#60a5fa', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>CloudNova Media</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900' }}>Cloud Video</h2>
          </div>
          <div className="cloudnova-video-frame" style={{ position: 'relative' }}>
            <video src="/cloudvideo.mp4" loop controls playsInline preload="metadata" style={{ display: 'block', width: '100%', height: 'clamp(190px, 42vw, 360px)', objectFit: 'cover', backgroundColor: '#020617' }} />
          </div>
        </div>
      </section>

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
              <path className="live-graph-area" d="M 0,45 C 60,15 110,65 170,35 C 230,10 280,60 340,25 C 400,15 450,55 520,30 L 520,80 L 0,80 Z" fill="url(#premiumChartGrad)" />
              <path className="live-graph-line" d="M 0,45 C 60,15 110,65 170,35 C 230,10 280,60 340,25 C 400,15 450,55 520,30" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              <circle className="live-graph-dot" cx="450" cy="46" r="4" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Active Mining Pools</h2>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>View All &gt;&gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {miningPools.length === 0 && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>
              No active mining machines yet. Rent a plan to start earning.
            </div>
          )}
          {miningPools.map((pool) => (
            <div key={pool.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', backgroundColor: '#0f172a', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', marginRight: '12px' }}>{pool.img}</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{pool.name}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Daily: <span style={{ color: '#0f172a', fontWeight: '500' }}>{pool.daily}</span></p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Term: {pool.duration}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold', color: '#2563eb' }}>Total: {pool.total}</p>
                </div>
              </div>
              <span style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '6px' }}>Active</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cloudnovaTicker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes gtcStraightOrbit { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes incomeCoinFloat { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-9px) rotate(8deg); } }
        @keyframes cloudnovaCoreCoin { 0%, 100% { transform: translate(-50%, -50%) rotateY(0deg) scale(1); } 50% { transform: translate(-50%, -50%) rotateY(180deg) scale(1.08); } }
        @keyframes fluidGraphPulse { 0% { transform: scaleY(0.9) translateY(4px); opacity: 0.85; } 100% { transform: scaleY(1.05) translateY(-2px); opacity: 1; } }
        .weekly-winner-line { width: 100%; display: flex; align-items: center; gap: 11px; padding: 12px 40px; border: 0; border-bottom: 1px solid rgba(37,99,235,0.16); background: linear-gradient(90deg, #ffffff 0%, #eff6ff 48%, #ffffff 100%); color: #0f172a; text-align: left; cursor: pointer; animation: weeklyWinnerReveal 500ms ease-out both; }
        .weekly-winner-icon { width: 31px; height: 31px; flex: 0 0 31px; display: grid; place-items: center; border-radius: 10px; color: #b45309; background: linear-gradient(135deg, #fef3c7, #fbbf24); box-shadow: 0 5px 14px rgba(245,158,11,0.24); }
        .weekly-winner-copy { min-width: 0; flex: 1; display: flex; align-items: baseline; gap: 9px; overflow: hidden; }
        .weekly-winner-copy strong { color: #1e3a8a; font-size: 12px; white-space: nowrap; }
        .weekly-winner-copy span { color: #64748b; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .weekly-winner-countdown { color: #2563eb; font-size: 11px; font-weight: 900; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .weekly-winner-arrow { flex: 0 0 auto; color: #2563eb; }
        .weekly-winner-overlay { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 20px; background: rgba(2,6,23,0.68); backdrop-filter: blur(7px); animation: weeklyWinnerFade 180ms ease-out both; }
        .weekly-winner-panel { width: min(100%, 390px); padding: 24px; position: relative; border: 1px solid rgba(96,165,250,0.35); border-radius: 20px; color: #fff; background: linear-gradient(155deg, #0b1a50, #102b75 62%, #07112f); box-shadow: 0 25px 70px rgba(0,0,0,0.45); animation: weeklyWinnerPanelIn 260ms cubic-bezier(.2,.8,.2,1) both; }
        .weekly-winner-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,0.16); border-radius: 50%; background: rgba(255,255,255,0.08); color: #fff; cursor: pointer; }
        .weekly-winner-heading { display: flex; align-items: center; gap: 12px; }
        .weekly-winner-heading > span { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 13px; color: #fbbf24; background: rgba(251,191,36,0.16); }
        .weekly-winner-heading p { margin: 0 0 3px; color: #67e8f9; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
        .weekly-winner-heading h2 { margin: 0; font-size: 22px; }
        .weekly-winner-subtitle { margin: 18px 0; color: #bfdbfe; font-size: 12px; }
        .weekly-winner-list { display: grid; gap: 9px; }
        .weekly-winner-row { display: flex; align-items: center; gap: 10px; padding: 13px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.07); animation: weeklyWinnerRowIn 350ms ease-out both; }
        .weekly-winner-row:nth-child(2) { animation-delay: 70ms; }.weekly-winner-row:nth-child(3) { animation-delay: 140ms; }
        .winner-rank { width: 34px; color: #fbbf24; font-size: 11px; font-weight: 900; }.winner-name { flex: 1; font-size: 13px; font-weight: 700; }.weekly-winner-row strong { color: #86efac; font-size: 14px; }
        .weekly-winner-expiry { margin: 18px 0 0; color: #93c5fd; font-size: 11px; text-align: center; }
        @keyframes weeklyWinnerReveal { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes weeklyWinnerFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes weeklyWinnerPanelIn { from { opacity: 0; transform: translateY(15px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes weeklyWinnerRowIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 560px) { .weekly-winner-line { padding-left: 16px; padding-right: 16px; gap: 8px; }.weekly-winner-copy { display: block; }.weekly-winner-copy span { display: block; margin-top: 2px; }.weekly-winner-countdown { font-size: 10px; } }
      `}</style>
    </div>
  );
}
