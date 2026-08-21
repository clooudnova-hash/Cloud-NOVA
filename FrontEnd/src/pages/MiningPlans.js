import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MachineCard from '../Components/MachineCard';

const getTier = (price) => {
  if (price === 10) return 'Starter';
  if (price === 20) return 'Pro';
  if (price === 30) return 'Basic';
  if (price === 50) return 'Standard';
  if (price === 80) return 'Premium';
  if (price === 100) return 'Advanced';
  if (price === 150) return 'Professional';
  if (price === 200) return 'Enterprise';
  if (price === 500) return 'Elite';
  return null;
};

const MiningPlans = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rentingId, setRentingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { machine }
  // Contact modal state for large plans
  const [contactModal, setContactModal] = useState(null); // { machine }

  const plans = [
    { id: 1, name: 'CloudNova HZ Mini1', dailyIncome: 0.53, termDays: 38, rebate: 0.00, totalIncome: 20.00, limit: 1, price: 10.00, country: 'Kazakhstan', category: 'plans' },
    { id: 2, name: 'CloudNova HZ Mini2', dailyIncome: 1.00, termDays: 38, rebate: 0.00, totalIncome: 38.00, limit: 1, price: 20.00, country: 'Russia', category: 'plans' },
    { id: 3, name: 'CloudNova Basic', dailyIncome: 1.37, termDays: 38, rebate: 0.00, totalIncome: 52.00, limit: 1, price: 30.00, country: 'All', category: 'plans' },
    { id: 4, name: 'CloudNova Standard', dailyIncome: 1.40, termDays: 52, rebate: 0.00, totalIncome: 73.00, limit: 2, price: 50.00, country: 'Kazakhstan', category: 'plans' },
    { id: 5, name: 'CloudNova Premium', dailyIncome: 2.83, termDays: 53, rebate: 0.00, totalIncome: 150.00, limit: 2, price: 80.00, country: 'Russia', category: 'plans' },
    { id: 6, name: 'CloudNova Advanced', dailyIncome: 2.73, termDays: 55, rebate: 0.00, totalIncome: 150.00, limit: 2, price: 100.00, country: 'UK', category: 'plans' },
    { id: 7, name: 'CloudNova Professional', dailyIncome: 4.38, termDays: 48, rebate: 0.00, totalIncome: 210.00, limit: 3, price: 150.00, country: 'USA', category: 'plans' },
    { id: 8, name: 'CloudNova Enterprise', dailyIncome: 6.00, termDays: 50, rebate: 0.00, totalIncome: 300.00, limit: 5, price: 200.00, country: 'Global', category: 'plans' },
    { id: 9, name: 'CloudNova Elite', dailyIncome: 9.09, termDays: 88, rebate: 0.00, totalIncome: 800.00, limit: 5, price: 500.00, country: 'Global', category: 'plans' }
  ];

  const filteredMachines = plans.filter(machine => {
    const matchesCategory = machine.category === activeTab;
    const matchesCountry = activeTab === 'limited' || selectedCountry === 'All' || machine.country === selectedCountry;
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCountry && matchesSearch;
  });

  const handleRent = (machine) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const tier = getTier(machine.price);
    if (!tier) {
      setContactModal({ machine });
      return;
    }

    setConfirmModal({ machine });
  };

  const executeRent = async (machine) => {
    const token = localStorage.getItem('token');
    const tier = getTier(machine.price);
    setConfirmModal(null);
    setRentingId(machine.id); setMsg('');
    try {
      const res = await fetch('/api/plans/lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ ${data.message} — ${machine.name} is now active!`);
        setMsgType('success');
      } else {
        setMsg('❌ ' + data.message);
        setMsgType('error');
      }
    } catch {
      setMsg('❌ Network error. Please try again.');
      setMsgType('error');
    } finally {
      setRentingId(null);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  return (
    <div className="premium-page min-h-screen bg-[#f5f8ff] text-slate-800 pb-20 font-sans antialiased">

      {/* Lease Confirm Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px 24px', maxWidth: '340px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Confirm Lease</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px', lineHeight: '1.5' }}>
              <strong style={{ color: '#1e293b' }}>{confirmModal.machine.name}</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>
              <strong style={{ color: '#ef4444' }}>${confirmModal.machine.price.toFixed(2)}</strong> will be deducted from your wallet balance.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmModal(null)}
                style={{ flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => executeRent(confirmModal.machine)}
                style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '800', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                ✅ Confirm Lease
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Admin Modal for Large Plans */}
      {contactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px 24px', maxWidth: '340px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Enterprise Plan</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px', lineHeight: '1.5' }}>
              <strong style={{ color: '#1e293b' }}>{contactModal.machine.name}</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>
              Price: <strong style={{ color: '#1d4ed8' }}>${contactModal.machine.price.toLocaleString()}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px', lineHeight: '1.5' }}>
              This is a premium plan. Please contact admin directly with your account ID to activate it.
            </p>
            <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '14px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#15803d', fontWeight: '700', margin: '0 0 6px' }}>📱 Contact Admin</p>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#064e3b', fontFamily: 'monospace', margin: 0 }}>+92 314 0033710</p>
              <a href="https://wa.me/923140033710" target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', marginTop: '10px', background: '#25d366', color: '#fff', fontSize: '12px', fontWeight: '800', padding: '8px 20px', borderRadius: '10px', textDecoration: 'none' }}>
                💬 Open WhatsApp
              </a>
            </div>
            <button onClick={() => setContactModal(null)}
              style={{ width: '100%', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className="bg-[#0b1a50] px-4 py-2.5 flex justify-between items-center shadow-lg border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-white/5 border-2 border-cyan-400/50 p-0.5 shadow-[0_0_12px_rgba(0,210,255,0.5)]">
            <img src="/logo.png" alt="CloudNova" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-[0.1em]">Cloud<span className="text-cyan-300">Nova</span></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <button type="button" onClick={() => navigate('/login')} className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/15 active:scale-95 transition">Login</button>
          <button type="button" onClick={() => navigate('/register')} className="bg-gradient-to-r from-[#00d2ff] to-[#9b51e0] text-slate-950 font-black px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(0,210,255,0.2)] active:scale-95 transition">Sign Up</button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1a50] via-[#153393] to-[#087f9b] px-4 pt-6 pb-10 text-white shadow-[0_12px_30px_rgba(11,26,80,0.25)]">
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">CloudNova marketplace</p>
            <h1 className="text-2xl font-black tracking-tight mt-1">Mining Pools</h1>
            <p className="text-[11px] text-blue-100 font-medium mt-1 max-w-[280px]">Choose a cloud machine and turn computing power into daily returns.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-cyan-200">{plans.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Available plans</p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-5 max-w-[360px]">
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-blue-100">Starting from</p>
            <p className="text-sm font-black text-white mt-0.5">$10.00</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-blue-100">Top return</p>
            <p className="text-sm font-black text-amber-300 mt-0.5">$9.09 / day</p>
          </div>
        </div>
        <div className="absolute -right-16 -bottom-24 h-52 w-52 rounded-full border border-cyan-200/20" />
        <div className="absolute right-6 -bottom-20 h-40 w-40 rounded-full border border-white/10" />
      </div>

      <div className="relative z-20 px-3 -mt-5 space-y-3">

        {/* Alert */}
        {msg && (
          <div className={`p-3 rounded-xl text-xs font-bold ${msgType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 flex shadow-[0_8px_22px_rgba(15,23,42,0.08)] border border-slate-200/80 text-xs font-bold">
          <button type="button" onClick={() => { setActiveTab('plans'); setSelectedCountry('All'); }}
            className={`w-full text-center py-2.5 rounded-lg transition-all ${activeTab === 'plans' ? 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'text-slate-500'}`}>
            ⚡ Premium Mining Plans
          </button>
        </div>

        {/* Country Filters */}
        {activeTab === 'plans' && (
          <div className="flex gap-4 overflow-x-auto py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-200 scrollbar-none">
            {['All', 'Kazakhstan', 'Russia', 'UK', 'USA', 'Global'].map(country => (
              <button key={country} type="button" onClick={() => setSelectedCountry(country)}
                className={`pb-1.5 whitespace-nowrap ${selectedCountry === country ? 'text-[#1e88e5] border-b-2 border-[#1e88e5] font-bold' : ''}`}>
                {country}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl px-3 py-1 flex items-center shadow-[0_5px_16px_rgba(15,23,42,0.06)] border border-slate-200/80">
          <input type="text" placeholder="Search machine..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-700 focus:outline-none py-1.5" />
        </div>

        {/* Plan Cards */}
        <div className="space-y-3 pt-1">
          {filteredMachines.map(machine => (
            <MachineCard
              key={machine.id}
              data={machine}
              onRent={m => !rentingId && handleRent(m)}
              renting={rentingId === machine.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiningPlans;
