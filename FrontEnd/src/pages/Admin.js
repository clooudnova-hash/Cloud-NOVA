import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const token = () => localStorage.getItem('token');

const api = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', authorization: token(), ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res.json();
};

const card = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px', padding: '24px',
};

const btn = (color = '#00b4ff') => ({
  background: color, border: 'none', borderRadius: '8px', padding: '7px 14px',
  color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
});

const statusColor = { pending: '#f59e0b', completed: '#10b981', rejected: '#ef4444' };

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [bonusCodes, setBonusCodes] = useState([]);
  const [taskClaims, setTaskClaims] = useState([]);
  const [newCode, setNewCode] = useState({ code: '', bonus: '', startsAt: '', expiresAt: '', maxUsers: '', allowedUserIds: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceAdj, setBalanceAdj] = useState({}); // { [userId]: { amount, note } }
  const [userSearch, setUserSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txType, setTxType] = useState('all');
  const [proofPreview, setProofPreview] = useState(null);
  const [machineTier, setMachineTier] = useState({});
  const [referralCode, setReferralCode] = useState({});
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', referralCode: '' });
  const [resetPassword, setResetPassword] = useState({});
  const [vipSelection, setVipSelection] = useState({});
  const [weeklyWinner, setWeeklyWinner] = useState({ name: '', amount: '', expiresAt: '', winners: [{ name: '', amount: '' }, { name: '', amount: '' }, { name: '', amount: '' }] });
  const [depositSettings, setDepositSettings] = useState({ autoApproveDeposits: true, manualApproval: false });

  const userRole = localStorage.getItem('userRole') || '';

  useEffect(() => {
    if (!token() || userRole !== 'admin') { navigate('/login'); return; }
    loadAll();
  }, []); // eslint-disable-line

  const loadAll = useCallback(async () => {
    const [m, tx, u, b, tc, winner, deposits] = await Promise.all([
      api('/api/admin/metrics'),
      api('/api/admin/transactions'),
      api('/api/admin/users'),
      api('/api/admin/bonus'),
      api('/api/admin/task-claims'),
      api('/api/admin/weekly-winner'),
      api('/api/admin/deposit-settings'),
    ]);
    setMetrics(m);
    setTransactions(Array.isArray(tx) ? tx.reverse() : []);
    setUsers(Array.isArray(u) ? u : []);
    setBonusCodes(Array.isArray(b) ? b : []);
    setTaskClaims(Array.isArray(tc) ? tc : []);
    if (winner?.name) setWeeklyWinner(winner);
    if (deposits && typeof deposits.autoApproveDeposits === 'boolean') setDepositSettings(deposits);
  }, []);

  const txAction = async (id, action) => {
    setLoading(true);
    const res = await api('/api/admin/transactions/action', { method: 'POST', body: { id, action } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const addCode = async () => {
    if (!newCode.code || !newCode.bonus || !newCode.startsAt || !newCode.expiresAt || !newCode.maxUsers) { setMsg('Code, amount, start/end time aur user limit sab chahiye'); return; }
    const res = await api('/api/admin/bonus/add', {
      method: 'POST',
      body: {
        ...newCode,
        allowedUserIds: newCode.allowedUserIds.split(',').map(id => id.trim()).filter(Boolean)
      }
    });
    setMsg(res.message || res.error);
    setNewCode({ code: '', bonus: '', startsAt: '', expiresAt: '', maxUsers: '', allowedUserIds: '' });
    await loadAll();
    setTimeout(() => setMsg(''), 3000);
  };

  const toggleCode = async (code) => {
    await api('/api/admin/bonus/toggle', { method: 'POST', body: { code } });
    await loadAll();
  };

  const deleteCode = async (code) => {
    await api(`/api/admin/bonus/${code}`, { method: 'DELETE' });
    await loadAll();
  };

  const claimAction = async (id, action) => {
    setLoading(true);
    const res = await api('/api/admin/task-claims/action', { method: 'POST', body: { id, action } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const adjustBalance = async (userId) => {
    const adj = balanceAdj[userId] || {};
    if (!adj.amount) { setMsg('Amount enter karo'); setTimeout(() => setMsg(''), 3000); return; }
    setLoading(true);
    const res = await api('/api/admin/users/adjust-balance', { method: 'POST', body: { userId, amount: parseFloat(adj.amount), note: adj.note || '' } });
    setMsg(res.message || res.error);
    setBalanceAdj(prev => ({ ...prev, [userId]: { amount: '', note: '' } }));
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const addBalance = async (user) => {
    const amount = window.prompt(`Balance amount to add for ${user.username || user.fullName}:`);
    if (amount === null || !amount.trim() || Number(amount) <= 0) return;
    const note = window.prompt('Note (optional):') || 'Admin balance addition';
    setLoading(true);
    const res = await api('/api/admin/users/adjust-balance', { method: 'POST', body: { userId: user.id, amount: Number(amount), note } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const togglePause = async (user) => {
    const res = await api('/api/admin/users/pause', { method: 'POST', body: { userId: user.id, paused: !user.paused } });
    setMsg(res.message || res.error);
    await loadAll();
    setTimeout(() => setMsg(''), 3000);
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Remove ${user.username || user.fullName}? This cannot be undone.`)) return;
    const res = await api(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    setMsg(res.message || res.error);
    await loadAll();
    setTimeout(() => setMsg(''), 3000);
  };

  const addMachine = async (userId) => {
    const tier = machineTier[userId] || 'Starter';
    setLoading(true);
    const res = await api('/api/admin/users/add-machine', { method: 'POST', body: { userId, tier } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const assignReferral = async (userId) => {
    const code = (referralCode[userId] || '').trim();
    if (!code) { setMsg('Referral code enter karo'); setTimeout(() => setMsg(''), 3000); return; }
    setLoading(true);
    const res = await api('/api/admin/users/set-referral', { method: 'POST', body: { userId, referralCode: code } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const createUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) { setMsg('Name, email aur password enter karo'); return; }
    setLoading(true);
    const res = await api('/api/admin/users/create', { method: 'POST', body: newUser });
    setMsg(res.message || res.error);
    if (res.success) setNewUser({ fullName: '', email: '', password: '', referralCode: '' });
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const changeUserPassword = async (userId) => {
    const newPassword = resetPassword[userId] || '';
    if (newPassword.length < 6) { setMsg('Password kam az kam 6 characters ka ho'); return; }
    setLoading(true);
    const res = await api('/api/admin/users/reset-password', { method: 'POST', body: { userId, newPassword } });
    setMsg(res.message || res.error);
    setResetPassword(prev => ({ ...prev, [userId]: '' }));
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const updateVip = async (userId) => {
    setLoading(true);
    const res = await api('/api/admin/users/set-vip', { method: 'POST', body: { userId, vipLevel: vipSelection[userId] || 'Auto' } });
    setMsg(res.message || res.error);
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const updateWeeklyWinner = async () => {
    setLoading(true);
    const res = await api('/api/admin/weekly-winner', { method: 'PUT', body: { ...weeklyWinner, amount: Number(weeklyWinner.amount), winners: weeklyWinner.winners.map(winner => ({ ...winner, amount: Number(winner.amount) })) } });
    setMsg(res.message || res.error);
    if (res.success) setWeeklyWinner(res);
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const updateDepositSettings = async autoApproveDeposits => {
    setLoading(true);
    const res = await api('/api/admin/deposit-settings', { method: 'PUT', body: { autoApproveDeposits } });
    setMsg(res.message || res.error);
    if (res.success) setDepositSettings(res);
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const tabs = ['dashboard', 'transactions', 'users', 'bonus', 'winner', 'tasks'];

  return (
    <div className="premium-page" style={{ minHeight: '100vh', background: '#080c1a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>

      {proofPreview && (
        <div role="dialog" aria-modal="true" aria-label="Payment proof preview" onClick={() => setProofPreview(null)} style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.82)' }}>
          <div onClick={event => event.stopPropagation()} style={{ position: 'relative', maxWidth: 'min(92vw, 720px)', maxHeight: '90vh', padding: '12px', borderRadius: '14px', background: '#111827', border: '1px solid rgba(103,232,249,0.35)' }}>
            <button type="button" aria-label="Close payment proof" onClick={() => setProofPreview(null)} style={{ position: 'absolute', top: '-12px', right: '-12px', width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', background: '#1e293b', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            <img src={proofPreview} alt="Payment proof" style={{ display: 'block', maxWidth: 'min(88vw, 680px)', maxHeight: '84vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00b4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🛡️</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>CloudNova Admin</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Control Panel</div>
          </div>
        </div>
        <button onClick={() => navigate('/')} style={{ ...btn('rgba(255,255,255,0.08)'), border: '1px solid rgba(255,255,255,0.1)' }}>← Back to App</button>
      </div>

      {/* Toast */}
      {msg && <div style={{ background: 'rgba(0,180,255,0.12)', border: '1px solid rgba(0,180,255,0.3)', color: '#7dd3fc', fontSize: '13px', padding: '10px 24px', textAlign: 'center' }}>💬 {msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '16px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'linear-gradient(135deg, #00b4ff22, #7c3aed22)' : 'transparent',
            border: tab === t ? '1px solid rgba(0,180,255,0.3)' : '1px solid transparent',
            borderRadius: '8px 8px 0 0', padding: '10px 20px', color: tab === t ? '#7dd3fc' : 'rgba(255,255,255,0.4)',
            fontSize: '13px', fontWeight: tab === t ? '700' : '500', cursor: 'pointer',
            textTransform: 'capitalize',
          }}>{t === 'dashboard' ? '📊 Dashboard' : t === 'transactions' ? '💸 Transactions' : t === 'users' ? '👥 Users' : t === 'bonus' ? '🎫 Bonus Codes' : t === 'winner' ? '🏆 Weekly Winner' : '✅ Task Claims'}</button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>

        {tab === 'winner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={card}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>🏆 Weekly Winner Settings</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginBottom: '20px' }}>Ye details Home screen par clickable winner line mein show hongi.</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 220px' }}><label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>BIGGEST WINNER NAME</label><input value={weeklyWinner.name} onChange={e => setWeeklyWinner(prev => ({ ...prev, name: e.target.value }))} placeholder="Winner name" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} /></div>
                <div style={{ flex: '0 1 150px' }}><label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>AMOUNT ($)</label><input type="number" min="0" value={weeklyWinner.amount} onChange={e => setWeeklyWinner(prev => ({ ...prev, amount: e.target.value }))} placeholder="250" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} /></div>
                <div style={{ flex: '1 1 220px' }}><label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>EXPIRES AT</label><input type="datetime-local" value={weeklyWinner.expiresAt ? weeklyWinner.expiresAt.slice(0, 16) : ''} onChange={e => setWeeklyWinner(prev => ({ ...prev, expiresAt: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} /></div>
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>Winner Rankings</div>
              <div style={{ display: 'grid', gap: '10px' }}>{weeklyWinner.winners.map((winner, index) => <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ width: '34px', color: '#fbbf24', fontWeight: '800' }}>{index + 1}.</span><input value={winner.name} onChange={e => setWeeklyWinner(prev => ({ ...prev, winners: prev.winners.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item) }))} placeholder={`Winner ${index + 1}`} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} /><input type="number" min="0" value={winner.amount} onChange={e => setWeeklyWinner(prev => ({ ...prev, winners: prev.winners.map((item, itemIndex) => itemIndex === index ? { ...item, amount: e.target.value } : item) }))} placeholder="Amount" style={{ width: '120px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none' }} /></div>)}</div>
              <button type="button" onClick={updateWeeklyWinner} disabled={loading} style={{ ...btn('linear-gradient(135deg, #00b4ff, #7c3aed)'), marginTop: '18px', padding: '11px 22px' }}>Save Weekly Winner</button>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <div style={{ ...card, marginBottom: '24px', border: '1px solid rgba(0,180,255,0.25)', background: 'linear-gradient(135deg, rgba(0,180,255,0.08), rgba(124,58,237,0.08))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Deposit Approval Settings</div><div style={{ marginTop: '5px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{depositSettings.autoApproveDeposits ? 'New deposits approve automatically.' : 'New deposits wait for admin review.'}</div></div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><button type="button" onClick={() => updateDepositSettings(true)} disabled={loading} style={btn(depositSettings.autoApproveDeposits ? '#10b981' : 'rgba(255,255,255,0.1)')}>Auto Approve: {depositSettings.autoApproveDeposits ? 'ON' : 'OFF'}</button><button type="button" onClick={() => updateDepositSettings(false)} disabled={loading} style={btn(!depositSettings.autoApproveDeposits ? '#f59e0b' : 'rgba(255,255,255,0.1)')}>Manual Approval: {!depositSettings.autoApproveDeposits ? 'ON' : 'OFF'}</button></div>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Users', value: metrics?.totalUsers ?? '—', icon: '👥', color: '#00b4ff' },
                { label: 'System Funds', value: metrics ? `$${Number(metrics.systemFunds).toFixed(2)}` : '—', icon: '💰', color: '#10b981' },
                { label: 'Total Transactions', value: metrics?.activeContracts ?? '—', icon: '📋', color: '#f59e0b' },
                { label: 'Pending', value: transactions.filter(t => t.status === 'pending').length, icon: '⏳', color: '#ef4444' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color }}>{value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent transactions */}
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>⏳ Pending Transactions</div>
              {transactions.filter(t => t.status === 'pending').length === 0
                ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Koi pending transaction nahi hai</div>
                : transactions.filter(t => t.status === 'pending').slice(0, 5).map(tx => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{tx.type} — ${tx.amount}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{tx.userId} · {tx.network}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => txAction(tx.id, 'approve')} disabled={loading} style={btn('#10b981')}>✅ Approve</button>
                      <button onClick={() => txAction(tx.id, 'reject')} disabled={loading} style={btn('#ef4444')}>❌ Reject</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                💸 All Transactions ({transactions.length})
                <span style={{ marginLeft: '12px', fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
                  Pending: {transactions.filter(t => t.status === 'pending').length}
                </span>
              </div>
              <input
                placeholder="Search by type, network or TxID..."
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '12px', outline: 'none', width: '260px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All', count: transactions.length },
                { key: 'deposit', label: 'Deposits', count: transactions.filter(tx => tx.type === 'deposit').length },
                { key: 'withdrawal', label: 'Withdrawals', count: transactions.filter(tx => tx.type === 'withdrawal').length },
                { key: 'mining', label: 'Mining Income', count: transactions.filter(tx => tx.type === 'Mining Income').length },
                { key: 'bonus', label: 'Bonus', count: transactions.filter(tx => tx.type?.includes('Reward')).length }
              ].map(filter => (
                <button key={filter.key} type="button" onClick={() => setTxType(filter.key)} style={{ ...btn(txType === filter.key ? '#00b4ff' : 'rgba(255,255,255,0.08)'), border: txType === filter.key ? '1px solid #67e8f9' : '1px solid rgba(255,255,255,0.1)' }}>
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            <div style={card}>
              {transactions.length === 0
                ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Koi transaction nahi hai</div>
                : (() => {
                    const filtered = transactions.filter(tx => {
                      const matchesType = txType === 'all'
                        || (txType === 'deposit' && tx.type === 'deposit')
                        || (txType === 'withdrawal' && tx.type === 'withdrawal')
                        || (txType === 'mining' && tx.type === 'Mining Income')
                        || (txType === 'bonus' && tx.type?.includes('Reward'));
                      const matchesSearch = !txSearch
                        || tx.type?.toLowerCase().includes(txSearch.toLowerCase())
                        || tx.network?.toLowerCase().includes(txSearch.toLowerCase())
                        || tx.txid?.toLowerCase().includes(txSearch.toLowerCase());
                      return matchesType && matchesSearch;
                    });
                    return (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              {['User ID', 'Type', 'Amount', 'Network', 'TxID / Address', 'Date', 'Status', 'Action'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map(tx => {
                              const txUser = users.find(u => u.id === tx.userId);
                              return (
                                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                    <div>{txUser?.fullName || tx.userId}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{txUser?.email || ''}</div>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#fff', fontWeight: '600' }}>{tx.type}</td>
                                  <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: '700' }}>${parseFloat(tx.amount).toFixed(2)}</td>
                                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)' }}>{tx.network}</td>
                                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <div>{tx.txid}</div>
                                    {tx.type === 'withdrawal' && tx.accountName && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>Title: {tx.accountName}</div>}
                                    {tx.type === 'withdrawal' && tx.bankName && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>Bank: {tx.bankName}</div>}
                                    {tx.type === 'deposit' && tx.proofImage && <button type="button" onClick={() => setProofPreview(tx.proofImage)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', padding: 0, border: 0, background: 'transparent', color: '#67e8f9', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}><img src={tx.proofImage} alt="Payment proof" style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(103,232,249,0.5)' }} /> View proof</button>}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleString()}</td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{ background: `${statusColor[tx.status] || '#888'}22`, color: statusColor[tx.status] || '#888', borderRadius: '6px', padding: '3px 8px', fontWeight: '700', fontSize: '11px' }}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    {tx.status === 'pending' && (
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => txAction(tx.id, 'approve')} disabled={loading} style={btn('#10b981')}>✅</button>
                                        <button onClick={() => txAction(tx.id, 'reject')} disabled={loading} style={btn('#ef4444')}>❌</button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
              }
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>👥 Registered Users ({users.length})</div>
              <input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '12px', outline: 'none', width: '240px' }}
              />
            </div>

            <div style={{ ...card, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ color: '#fff', fontSize: '12px' }}>Create User</strong>
              {[
                    ['fullName', 'Full name'], ['email', 'Gmail address'], ['password', 'Password'], ['referralCode', 'Sponsor referral code (optional)']
              ].map(([field, placeholder]) => <input key={field} type={field === 'password' ? 'password' : 'text'} placeholder={placeholder} value={newUser[field]} onChange={e => setNewUser(prev => ({ ...prev, [field]: e.target.value }))} style={{ flex: '1 1 150px', minWidth: '130px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none' }} />)}
              <button onClick={createUser} disabled={loading} style={btn('#10b981')}>Create</button>
            </div>

            {users.length === 0
              ? <div style={{ ...card, color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Koi user nahi hai</div>
              : users.filter(u =>
                  !userSearch ||
                  u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
                ).map((u, index) => (
                <div key={u.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* User Info Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: '30px', height: '30px', borderRadius: '9px', background: 'rgba(0,180,255,0.12)', border: '1px solid rgba(0,180,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67e8f9', fontSize: '12px', fontWeight: '800' }}>
                        #{index + 1}
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00b4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{u.fullName}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: u.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(0,180,255,0.1)', color: u.role === 'admin' ? '#f87171' : '#7dd3fc', borderRadius: '6px', padding: '3px 10px', fontWeight: '700', fontSize: '11px' }}>
                        {u.role}
                      </span>
                      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderRadius: '6px', padding: '3px 10px', fontWeight: '700', fontSize: '11px' }}>
                        👑 {u.vipLevel}
                      </span>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: '6px', padding: '3px 10px', fontWeight: '700', fontSize: '11px' }}>
                        💰 ${Number(u.balance).toFixed(2)}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '3px 10px', fontWeight: '600', fontSize: '11px' }}>
                        ⛏️ {u.minersCount} Miners
                      </span>
                      <span style={{ background: u.paused ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.paused ? '#f87171' : '#34d399', borderRadius: '6px', padding: '3px 10px', fontWeight: '700', fontSize: '11px' }}>
                        {u.paused ? 'Paused' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Referral Info */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    <span>Username: <strong style={{ color: '#fff' }}>{u.username || '—'}</strong></span>
                    <span>Referral Code: <strong style={{ color: '#a78bfa' }}>{u.myReferralCode}</strong></span>
                    <span>Referred By (sponsor): <strong style={{ color: '#fbbf24' }}>{u.referredByUser ? `${u.referredByUser.username} (${u.referredByCode || u.referredBy})` : 'No upline'}</strong></span>
                    <span>ID: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>{u.id}</span></span>
                  </div>

                  {/* Admin Controls */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', alignItems: 'flex-end' }}>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => addBalance(u)} disabled={loading} style={btn('#10b981')}>Add Balance</button>
                      <button onClick={() => togglePause(u)} disabled={loading} style={btn(u.paused ? '#10b981' : '#f59e0b')}>
                        {u.paused ? 'Resume' : 'Pause'}
                      </button>
                      <button onClick={() => removeUser(u)} disabled={loading} style={btn('#ef4444')}>Remove</button>
                    </div>

                    {/* Balance Adjustment */}
                    <div style={{ flex: '1', minWidth: '260px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
                        💰 Adjust Balance (+ add / − deduct)
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          placeholder="e.g. 10 or -5"
                          value={(balanceAdj[u.id] || {}).amount || ''}
                          onChange={e => setBalanceAdj(prev => ({ ...prev, [u.id]: { ...(prev[u.id] || {}), amount: e.target.value } }))}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', width: '110px' }}
                        />
                        <input
                          type="text"
                          placeholder="Note (optional)"
                          value={(balanceAdj[u.id] || {}).note || ''}
                          onChange={e => setBalanceAdj(prev => ({ ...prev, [u.id]: { ...(prev[u.id] || {}), note: e.target.value } }))}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', flex: 1 }}
                        />
                        <button onClick={() => adjustBalance(u.id)} disabled={loading}
                          style={{ ...btn('linear-gradient(135deg,#10b981,#059669)'), padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                          Apply
                        </button>
                      </div>
                    </div>

                    <div style={{ minWidth: '220px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
                        Add Free Machine
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select value={machineTier[u.id] || 'Starter'} onChange={e => setMachineTier(prev => ({ ...prev, [u.id]: e.target.value }))} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 6px', color: '#fff', fontSize: '12px', minWidth: '110px' }}>
                          {Object.keys({ Starter: 1, Pro: 1, Basic: 1, Standard: 1, Premium: 1, Advanced: 1, Professional: 1, Enterprise: 1, Elite: 1 }).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                        </select>
                        <button onClick={() => addMachine(u.id)} disabled={loading} style={btn('#7c3aed')}>Add</button>
                      </div>
                    </div>

                    <div style={{ minWidth: '240px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
                        Set Referral Code
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="text" placeholder="e.g. NOOR99" value={referralCode[u.id] || ''} onChange={e => setReferralCode(prev => ({ ...prev, [u.id]: e.target.value }))} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', flex: 1 }} />
                        <button onClick={() => assignReferral(u.id)} disabled={loading} style={btn('#0ea5e9')}>Set</button>
                      </div>
                    </div>

                    <div style={{ minWidth: '220px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>Reset Password</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="password" placeholder="New password" value={resetPassword[u.id] || ''} onChange={e => setResetPassword(prev => ({ ...prev, [u.id]: e.target.value }))} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', flex: 1 }} />
                        <button onClick={() => changeUserPassword(u.id)} disabled={loading} style={btn('#f59e0b')}>Reset</button>
                      </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>VIP Level</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select value={vipSelection[u.id] || 'Auto'} onChange={e => setVipSelection(prev => ({ ...prev, [u.id]: e.target.value }))} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 6px', color: '#fff', fontSize: '12px', minWidth: '105px' }}>
                          {['Auto', 'Bronze', 'LV1', 'LV2', 'LV3'].map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                        <button onClick={() => updateVip(u.id)} disabled={loading} style={btn('#f59e0b')}>Set</button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
          </div>
        )}

        {/* BONUS CODES */}
        {tab === 'bonus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Add new */}
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>➕ Naya Bonus Code Add Karo</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Code</label>
                  <input value={newCode.code} onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. NOVA100" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', letterSpacing: '2px', fontWeight: '700', width: '160px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Bonus Amount ($)</label>
                  <input type="number" value={newCode.bonus} onChange={e => setNewCode(p => ({ ...p, bonus: e.target.value }))}
                    placeholder="e.g. 25" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '120px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Active From</label>
                  <input type="datetime-local" value={newCode.startsAt} onChange={e => setNewCode(p => ({ ...p, startsAt: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Active Until</label>
                  <input type="datetime-local" value={newCode.expiresAt} onChange={e => setNewCode(p => ({ ...p, expiresAt: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>User Limit</label>
                  <input type="number" min="1" value={newCode.maxUsers} onChange={e => setNewCode(p => ({ ...p, maxUsers: e.target.value }))}
                    placeholder="e.g. 100" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '120px' }} />
                </div>
                <div style={{ minWidth: '260px', flex: 1 }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Allowed User IDs (optional)</label>
                  <input value={newCode.allowedUserIds} onChange={e => setNewCode(p => ({ ...p, allowedUserIds: e.target.value }))}
                    placeholder="usr_abc, usr_xyz — empty means everyone" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '12px', outline: 'none', width: '100%' }} />
                </div>
                <button onClick={addCode} style={{ ...btn('linear-gradient(135deg, #00b4ff, #7c3aed)'), padding: '10px 24px', fontSize: '13px', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,180,255,0.2)' }}>Add Code</button>
              </div>
            </div>

            {/* Existing codes */}
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>🎫 Sab Bonus Codes ({bonusCodes.length})</div>
              {bonusCodes.length === 0
                ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Koi code nahi hai</div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {bonusCodes.map(c => (
                      <div key={c.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '2px', color: c.active ? '#7dd3fc' : 'rgba(255,255,255,0.3)' }}>{c.code}</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>${c.bonus}</span>
                          <span style={{ fontSize: '11px', color: '#fbbf24' }}>{c.claimedCount || 0}/{c.maxUsers} users</span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{c.startsAt ? new Date(c.startsAt).toLocaleString() : '—'} to {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : '—'}</span>
                          {c.allowedUserIds?.length > 0 && <span style={{ fontSize: '10px', color: '#c4b5fd' }}>Restricted: {c.allowedUserIds.length} users</span>}
                          <span style={{ fontSize: '11px', background: c.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: c.active ? '#34d399' : '#f87171', borderRadius: '6px', padding: '3px 8px', fontWeight: '700' }}>
                            {c.active ? 'Active' : 'Used/Inactive'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => toggleCode(c.code)} style={btn(c.active ? '#f59e0b' : '#10b981')}>{c.active ? '⏸ Deactivate' : '▶ Activate'}</button>
                          <button onClick={() => deleteCode(c.code)} style={btn('#ef4444')}>🗑 Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* TASK CLAIMS */}
        {tab === 'tasks' && (
          <div style={card}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              ✅ Task Reward Claims ({taskClaims.length})
              <span style={{ marginLeft: '12px', fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
                Pending: {taskClaims.filter(c => c.status === 'pending').length}
              </span>
            </div>
            {taskClaims.length === 0
              ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No task claims yet</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {taskClaims.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{c.taskName}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                          👤 {c.userName} · {c.userEmail}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                          {new Date(c.date).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', borderRadius: '6px', padding: '3px 10px',
                          background: c.status === 'pending' ? 'rgba(245,158,11,0.15)' : c.status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: c.status === 'pending' ? '#f59e0b' : c.status === 'approved' ? '#10b981' : '#ef4444',
                        }}>{c.status === 'approved' ? `✅ Approved (+$${c.reward})` : c.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}</span>
                        {c.status === 'pending' && (
                          <>
                            <button onClick={() => claimAction(c.id, 'approve')} disabled={loading} style={btn('#10b981')}>✅ Approve</button>
                            <button onClick={() => claimAction(c.id, 'reject')} disabled={loading} style={btn('#ef4444')}>❌ Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
