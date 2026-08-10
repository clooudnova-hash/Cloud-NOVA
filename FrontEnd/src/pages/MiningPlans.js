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
    { id: 1, name: 'CloudNova HZ Mini1', dailyIncome: 0.30, termDays: 38, rebate: 0.00, totalIncome: 11.40, limit: 1, price: 10.00, country: 'Kazakhstan', category: 'plans' },
    { id: 2, name: 'CloudNova HZ Mini2', dailyIncome: 0.60, termDays: 35, rebate: 0.00, totalIncome: 21.00, limit: 1, price: 20.00, country: 'Russia', category: 'plans' },
    { id: 3, name: 'CloudNova Basic', dailyIncome: 0.90, termDays: 35, rebate: 0.00, totalIncome: 31.50, limit: 1, price: 30.00, country: 'All', category: 'plans' },
    { id: 4, name: 'CloudNova Standard', dailyIncome: 1.00, termDays: 53, rebate: 0.00, totalIncome: 53.00, limit: 2, price: 50.00, country: 'Kazakhstan', category: 'plans' },
    { id: 5, name: 'CloudNova Premium', dailyIncome: 1.60, termDays: 53, rebate: 0.00, totalIncome: 84.80, limit: 2, price: 80.00, country: 'Russia', category: 'plans' },
    { id: 6, name: 'CloudNova Advanced', dailyIncome: 2.00, termDays: 55, rebate: 0.00, totalIncome: 110.00, limit: 2, price: 100.00, country: 'UK', category: 'plans' },
    { id: 7, name: 'CloudNova Professional', dailyIncome: 3.50, termDays: 48, rebate: 0.00, totalIncome: 168.00, limit: 3, price: 150.00, country: 'USA', category: 'plans' },
    { id: 8, name: 'CloudNova Enterprise', dailyIncome: 4.50, termDays: 50, rebate: 0.00, totalIncome: 225.00, limit: 5, price: 200.00, country: 'Global', category: 'plans' },
    { id: 9, name: 'CloudNova Elite', dailyIncome: 6.00, termDays: 88, rebate: 0.00, totalIncome: 528.00, limit: 5, price: 500.00, country: 'Global', category: 'plans' }
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800 pb-20 font-sans antialiased">

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
      <div className="bg-[#070b19] px-4 py-3 flex justify-between items-center shadow-lg border-b border-slate-800/60 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-blue-500/20 p-0.5">
            <img src="/logo.png" alt="CloudNova" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider">Cloud<span className="text-blue-400">Nova</span></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <button type="button" onClick={() => navigate('/login')} className="bg-slate-800/80 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/50 active:scale-95 transition">Login</button>
          <button type="button" onClick={() => navigate('/register')} className="bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg active:scale-95 transition">Sign Up</button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="bg-gradient-to-r from-[#94c3f7] to-[#73aef5] px-4 pt-5 pb-8 shadow-sm">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Mining Pools</h1>
        <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Select a plan to start earning daily income from cloud mining.</p>
      </div>

      <div className="px-3 -mt-5 space-y-3">

        {/* Alert */}
        {msg && (
          <div className={`p-3 rounded-xl text-xs font-bold ${msgType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 flex shadow-sm border border-slate-100 text-xs font-bold">
          <button type="button" onClick={() => { setActiveTab('plans'); setSelectedCountry('All'); }}
            className={`w-full text-center py-2.5 rounded-lg transition-all ${activeTab === 'plans' ? 'bg-[#1e88e5] text-white shadow-sm' : 'text-slate-500'}`}>
            ✏️ Mining Plans
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
        <div className="bg-white rounded-xl px-3 py-1 flex items-center shadow-sm border border-slate-100">
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
