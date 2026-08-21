import React, { useEffect, useState } from 'react';

const MyMining = () => {
  // Page Sub-Tab state ('mining' ya 'vip')
  const [currentSubTab, setCurrentSubTab] = useState('mining');
  const [activeContracts, setActiveContracts] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  // Sabsay bada fix: GTC-CLOUD mita kar CN-CLOUD (CloudNova) kar diya hai
  const [runningMachines, setRunningMachines] = useState([
    { id: "P-004", name: "CloudNova Standard", leasePrice: 50.00, dailyYield: 1.00, hoursLeft: 1272, status: "Not Active", capacity: "250 TH/s" },
    { id: "P-005", name: "CloudNova Premium", leasePrice: 80.00, dailyYield: 1.60, hoursLeft: 1272, status: "Not Active", capacity: "320 TH/s" }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user/dashboard', { headers: { authorization: token } })
      .then(response => response.ok ? response.json() : null)
      .then(data => setDashboard(data))
      .catch(() => setDashboard(null));
    fetch('/api/mining/contracts', { headers: { authorization: token } })
      .then(response => response.ok ? response.json() : [])
      .then(contracts => setActiveContracts(Array.isArray(contracts) ? contracts.filter(contract => contract.status === 'active') : []))
      .catch(() => setActiveContracts([]));
  }, []);

  useEffect(() => {
    setRunningMachines(machines => machines.map(machine => {
      const contract = activeContracts.find(item => Number(item.cost) === machine.leasePrice);
      return contract
        ? { ...machine, status: 'Active', hoursLeft: Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / 3600000)) }
        : { ...machine, status: 'Not Active' };
    }));
  }, [activeContracts]);

  const accumulatedDeposit = Number(dashboard?.accumulatedDeposit || 0);

  const vipLevels = [
    { level: "LV1 Member", threshold: 10, condition: "Accumulated Deposit: $10.00", dailyLimit: "$50.00", rebate: "5.0%", color: "border-l-blue-500" },
    { level: "LV2 Member", threshold: 100, condition: "Accumulated Deposit: $100.00", dailyLimit: "$500.00", rebate: "8.0%", color: "border-l-amber-500" },
    { level: "LV3 Member", threshold: 1000, condition: "Accumulated Deposit: $1,000.00", dailyLimit: "$5,000.00", rebate: "12.0%", color: "border-l-purple-500" }
  ];

  const activeMachines = runningMachines.filter(machine => machine.status === 'Active');
  const totalNodes = activeMachines.length;
  const expectedToday = activeMachines.reduce((sum, item) => sum + item.dailyYield, 0);

  return (
    <div className="premium-page min-h-screen bg-[#f5f8ff] text-slate-800 pb-24 font-sans antialiased">
      
      {/* Top Banner with Vibrant Blue (Wallet Page Color Style) */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] mx-4 my-3 p-5 rounded-2xl text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Operation Dashboard</p>
        <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">Mining & VIP Cluster</h2>
        
        {/* Real-time Summary Cards Row */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-center text-xs font-bold">
          <div className="bg-white/10 border border-white/20 p-2.5 rounded-xl">
            <p className="text-[9px] text-blue-100 opacity-80">ACTIVE PLANS</p>
            <p className="text-sm font-black mt-0.5 text-white">{totalNodes} Plans</p>
          </div>
          <div className="bg-white/10 border border-white/20 p-2.5 rounded-xl">
            <p className="text-[9px] text-blue-100 opacity-80">PROJECTED DAILY RETURN</p>
            <p className="text-sm font-black mt-0.5 text-yellow-300">+{expectedToday.toFixed(2)} USDT</p>
          </div>
        </div>
      </div>

      {/* Switch Toggles */}
      <div className="grid grid-cols-2 gap-2 px-4 my-4 text-center text-[11px] font-bold">
        <button 
          type="button" 
          onClick={() => setCurrentSubTab('mining')}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            currentSubTab === 'mining' 
              ? 'bg-white text-[#1d4ed8] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-black' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          ⚡ Premium Mining
        </button>
        <button 
          type="button" 
          onClick={() => setCurrentSubTab('vip')}
          className={`p-3 rounded-xl border transition-all duration-200 ${
            currentSubTab === 'vip' 
              ? 'bg-white text-[#1d4ed8] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-black' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          👑 VIP Privilege Levels
        </button>
      </div>

      {/* Operational Info Ribbon */}
      <div className="mx-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-semibold shadow-sm">
        <p>📊 <strong>Plan Preview:</strong> These plans are available for rent and are not active until you rent one.</p>
      </div>

      {/* Content Render Panel */}
      <div className="mx-4 mt-4 space-y-3">
        
        {/* TAB 1: Rented Live Cloud Mining Rigs */}
        {currentSubTab === 'mining' && (
          <>
            <h3 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider px-1">Premium Mining Plans</h3>
            {runningMachines.length === 0 ? (
              <div className="text-center bg-white rounded-2xl p-8 text-xs text-slate-400 border border-slate-100 shadow-sm">No machines deployed.</div>
            ) : (
              runningMachines.map((node) => (
                <div key={node.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 border-l-4 border-l-emerald-500 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">{node.name}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold font-mono mt-0.5">Plan ID: {node.id}</p>
                    </div>
                    <span className={`${node.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'} text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider`}>
                      ◼ {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-center text-[10px] font-bold text-slate-400">
                    <div>
                      <p className="opacity-70 text-[9px]">Value</p>
                      <p className="text-slate-700 text-xs font-black mt-0.5">${node.leasePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 opacity-90 text-[9px]">Daily Yield</p>
                      <p className="text-emerald-600 text-xs font-black mt-0.5">+${node.dailyYield.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="opacity-70 text-[9px]">Remaining</p>
                      <p className="text-slate-700 text-xs font-black mt-0.5">{Math.floor(node.hoursLeft / 24)} Days</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold px-0.5 flex justify-between">
                    <span>Computing Output Power: <strong className="text-slate-700 font-black">{node.capacity}</strong></span>
                    <span className="text-[9px] text-blue-500 font-bold">ℹ Plan Details</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 2: Combined VIP Privileges List */}
        {currentSubTab === 'vip' && (
          <>
            <h3 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider px-1">VIP Ranking Thresholds</h3>
            {vipLevels.map((vip, idx) => {
              const unlocked = accumulatedDeposit >= vip.threshold;
              return (
              <div key={idx} className={`bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 border-l-4 ${vip.color} flex justify-between items-center text-xs`}>
                <div className="space-y-1">
                  <h4 className="font-black tracking-tight text-sm flex items-center gap-1 text-slate-800">
                    🏅 {vip.level}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">{vip.condition}</p>
                  <div className="text-[9px] text-slate-500 font-bold space-y-0.5 pt-1">
                    <p>Daily Withdraw Limit: <span className="text-slate-700 font-black">{vip.dailyLimit}</span></p>
                    <p>Team Purchase Rebate: <span className="text-blue-600 font-black">{vip.rebate}</span></p>
                  </div>
                </div>
                
                <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg border tracking-wide uppercase ${
                  unlocked
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-[#f8fafc] text-slate-400 border-slate-200'
                }`}>
                  {unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              );
            })}
          </>
        )}

      </div>
    </div>
  );
};

export default MyMining;
