import React, { useState, useEffect } from 'react';

const Bonus = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');
  const [taskStatuses, setTaskStatuses] = useState({});
  const [taskLoading, setTaskLoading] = useState({});

  const tasks = [
    { id: 1, task: 'Complete your profile', reward: '$0.10' },
    { id: 2, task: 'Make first deposit', reward: '$0.20' },
    { id: 3, task: 'Invite 5 friends', reward: '$1.00' },
  ];

  // Load server-side claim statuses on mount so state persists across reloads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/tasks/my-claims', { headers: { authorization: token } })
      .then(r => r.json())
      .then(claims => {
        if (!Array.isArray(claims)) return;
        const statuses = {};
        claims.forEach(c => {
          if (c.status === 'approved') {
            statuses[c.taskId] = { msg: `✅ Reward approved! $${c.reward || ''} added to your wallet.`, type: 'success', locked: true };
          } else if (c.status === 'pending') {
            statuses[c.taskId] = { msg: '⏳ Claim submitted — pending admin review.', type: 'warn', locked: true };
          } else if (c.status === 'rejected') {
            statuses[c.taskId] = { msg: '❌ Claim was rejected. Contact support if you believe this is an error.', type: 'error', locked: false };
          }
        });
        setTaskStatuses(statuses);
      })
      .catch(() => {});
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { setMessage('Please login first.'); setMsgType('error'); return; }
    if (!code.trim()) { setMessage('Please enter a voucher code.'); setMsgType('error'); return; }
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/bonus/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message} +$${data.bonus} added to your wallet!`);
        setMsgType('success');
        setCode('');
      } else {
        setMessage('❌ ' + data.message);
        setMsgType('error');
      }
    } catch {
      setMessage('❌ Network error. Please try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClaim = async (task) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTaskStatuses(prev => ({ ...prev, [task.id]: { msg: '❌ Please login first.', type: 'error', locked: false } }));
      return;
    }
    setTaskLoading(prev => ({ ...prev, [task.id]: true }));
    try {
      const res = await fetch('/api/tasks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ taskId: task.id, taskName: task.task })
      });
      const data = await res.json();
      if (res.ok) {
        setTaskStatuses(prev => ({ ...prev, [task.id]: { msg: '✅ ' + data.message, type: 'success', locked: true } }));
      } else {
        // If already approved or pending, lock the button based on server message
        const isLocked = data.message?.includes('already received') || data.message?.includes('already pending');
        setTaskStatuses(prev => ({ ...prev, [task.id]: { msg: '⚠️ ' + data.message, type: 'warn', locked: isLocked } }));
      }
    } catch {
      setTaskStatuses(prev => ({ ...prev, [task.id]: { msg: '❌ Network error. Try again.', type: 'error', locked: false } }));
    } finally {
      setTaskLoading(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const statusBg = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warn: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="premium-page min-h-screen bg-[#f5f8ff] text-slate-800 pb-24 font-sans antialiased">

      {/* Header */}
      <div className="bonus-hero-card bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] mx-4 my-3 p-5 rounded-2xl text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Rewards Center</p>
        <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">🎁 Bonus & Vouchers</h2>
      </div>

      {/* Voucher Claim */}
      <div className="bonus-voucher-card bg-white rounded-2xl p-5 mx-4 mt-2 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-1">Redeem Voucher Code</h3>
        <p className="text-[11px] text-slate-400 mb-4">Enter your code to claim bonus balance instantly</p>

        {message && (
          <div className={`mb-3 p-3 rounded-xl text-xs font-bold ${msgType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleClaim} className="space-y-3">
          <input
            type="text"
            placeholder="Enter voucher code (e.g. NOVA50)"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-sm text-slate-700 font-mono font-bold tracking-widest focus:outline-none focus:border-blue-500 transition uppercase"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50">
            {loading ? 'Claiming...' : '🎁 Claim Bonus'}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-[10px] text-blue-700 font-semibold">
          Promo codes are created and managed by an administrator. Enter the exact code you received.
        </div>
      </div>

      <div className="bonus-tasks-card bg-white rounded-2xl p-5 mx-4 mt-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-1">📋 Task Rewards</h3>
        <p className="text-[11px] text-slate-400 mb-4">Complete eligible tasks to receive instant rewards</p>

        <div className="space-y-3">
          {tasks.map((t) => {
            const status = taskStatuses[t.id];
            const isLocked = status?.locked;
            return (
              <div key={t.id} className="bonus-task-row bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{t.task}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Reward: <span className="text-emerald-600 font-black">{t.reward}</span></p>
                  </div>
                  <button
                    onClick={() => handleTaskClaim(t)}
                    disabled={taskLoading[t.id] || isLocked}
                    className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase disabled:opacity-50">
                    {taskLoading[t.id] ? '...' : isLocked ? '✅ Done' : 'Claim'}
                  </button>
                </div>
                {status && (
                  <div className={`mt-2 p-2 rounded-lg text-[10px] font-bold border ${statusBg[status.type]}`}>
                    {status.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-semibold">
          ℹ️ Rewards are added only after the task is actually completed. Each task can be claimed once.
        </div>
      </div>
    </div>
  );
};

export default Bonus;
