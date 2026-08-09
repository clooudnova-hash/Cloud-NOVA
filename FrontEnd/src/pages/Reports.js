import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch('/api/user/dashboard', { headers: { authorization: token } })
      .then(r => r.json()).then(d => { if (d.balance !== undefined) setDashboard(d); }).catch(() => {});
    fetch('/api/wallet/history', { headers: { authorization: token } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTransactions(d.slice().reverse()); }).catch(() => {});
  }, []); // eslint-disable-line

  const totalDeposited = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalLeased = transactions.filter(t => t.type?.startsWith('Lease') && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'pending').length;

  const stats = [
    { label: 'Total Deposited', value: `$${totalDeposited.toFixed(2)}`, icon: '📥', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Total Withdrawn', value: `$${totalWithdrawn.toFixed(2)}`, icon: '📤', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Plans Leased', value: `$${totalLeased.toFixed(2)}`, icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Current Balance', value: `$${dashboard ? parseFloat(dashboard.balance).toFixed(2) : '0.00'}`, icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  const teamLevels = [
    { label: 'Level 1 Team', commission: '6%', color: '#3b82f6', members: dashboard?.team?.[0] || [] },
    { label: 'Level 2 Team', commission: '4%', color: '#06b6d4', members: dashboard?.team?.[1] || [] },
    { label: 'Level 3 Team', commission: '2%', color: '#10b981', members: dashboard?.team?.[2] || [] },
  ];

  const statusColor = { pending: '#f59e0b', completed: '#10b981', rejected: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', fontFamily: 'Inter, -apple-system, sans-serif', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', margin: '12px 16px', padding: '20px', borderRadius: '20px', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '6px 14px', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Investment Reports</p>
        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0' }}>📊 Team & Investment Report</h2>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontWeight: '500' }}>
          Referral: <strong>{dashboard?.myReferralCode || '—'}</strong> · VIP: <strong>{dashboard?.vipLevel || 'Bronze'}</strong>
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '0 16px 16px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e8eef8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>{s.icon}</div>
            <p style={{ fontSize: '18px', fontWeight: '900', color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', margin: '3px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mining Stats */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px 16px', padding: '20px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Mining Overview</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Active Miners', value: dashboard?.minersCount ?? 0, icon: '⛏️' },
            { label: 'Hashrate', value: `${dashboard?.effectiveHashrate ?? 0} TH/s`, icon: '⚡' },
            { label: 'Pending Txs', value: pending, icon: '⏳' },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', margin: '0 0 4px' }}>{m.icon}</p>
              <p style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{m.value}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', margin: '3px 0 0' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Levels */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px 16px', padding: '20px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Team Network</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {teamLevels.map(l => (
              <div key={l.label} style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: l.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '800' }}>
                  {l.label.split(' ')[1]}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{l.label}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Commission: <strong style={{ color: '#f59e0b' }}>{l.commission}</strong></p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{l.members.length}</p>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Members</p>
              </div>
                </div>
                {l.members.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  {l.members.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '11px' }}>
                      <span style={{ color: '#334155', fontWeight: '800' }}>{member.username || member.fullName}</span>
                      <span style={{ color: member.depositStatus === 'completed' ? '#059669' : member.depositStatus === 'pending' ? '#d97706' : '#94a3b8', fontWeight: '700' }}>
                        {member.depositStatus.replace('_', ' ')} · ${Number(member.depositedAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
            💡 Invite friends using your referral code <strong>{dashboard?.myReferralCode || '—'}</strong> to grow your team and earn automatic commissions.
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px', padding: '20px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Transaction History ({transactions.length})</h3>
        {transactions.length === 0
          ? <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No transactions yet.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0, textTransform: 'capitalize' }}>{tx.type}</p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>{new Date(tx.date).toLocaleDateString()} · {tx.network}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: '900', color: tx.type === 'withdrawal' ? '#ef4444' : '#10b981', margin: 0 }}>
                      {tx.type === 'withdrawal' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: statusColor[tx.status] || '#94a3b8', background: `${statusColor[tx.status] || '#94a3b8'}18`, padding: '2px 8px', borderRadius: '6px', marginTop: '4px', display: 'inline-block' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
