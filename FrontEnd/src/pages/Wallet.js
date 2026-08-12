import React, { useState, useEffect, useCallback } from 'react';

const Wallet = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [paymentMethod, setPaymentMethod] = useState('EasyPaisa');
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);

  const adminDetails = {
    EasyPaisa: { name: 'HAMZA ALI', number: '0314-0033710' },
    JazzCash: { name: 'HAMZA ALI', number: '0314-0033710' },
    BankTransfer: { name: 'HAMZA ALI', number: '0314-0033710', bank: 'Local Bank' }
  };

  const parsedAmount = Number.parseFloat(amount || '0');
  const depositTax = Number.isFinite(parsedAmount) ? Number((parsedAmount * 0.08).toFixed(4)) : 0;
  const totalToPay = Number.isFinite(parsedAmount) ? Number((parsedAmount + depositTax).toFixed(4)) : 0;
  const netReceived = Number.isFinite(parsedAmount) ? Number(parsedAmount.toFixed(4)) : 0;
  const withdrawalTax = Number.isFinite(parsedAmount) ? Number((parsedAmount * 0.08).toFixed(4)) : 0;
  const totalDeduction = Number.isFinite(parsedAmount) ? Number((parsedAmount + withdrawalTax).toFixed(4)) : 0;

  const token = localStorage.getItem('token');

  const fetchData = useCallback(() => {
    if (!token) return;
    // Fetch balance
    fetch('/api/user/dashboard', { headers: { authorization: token } })
      .then(r => r.json())
      .then(d => { if (d.balance !== undefined) setBalance(parseFloat(d.balance).toFixed(2)); })
      .catch(() => {});
    // Fetch history
    fetch('/api/wallet/history', { headers: { authorization: token } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTransactions(d.slice().reverse()); })
      .catch(() => {});
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showMsg = (text, type) => {
    setMessage(text); setMsgType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!token) { showMsg('Please login first.', 'error'); return; }
    if (!amount) { showMsg('Please enter amount.', 'error'); return; }
    if (!Number.isFinite(parseFloat(amount)) || parseFloat(amount) < 10) { showMsg('Minimum deposit amount is $10.00.', 'error'); return; }
    if (!txid) { showMsg('Please enter transaction ID / hash.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ txid, network: paymentMethod, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (res.ok) { showMsg('✅ ' + data.message, 'success'); setAmount(''); setTxid(''); fetchData(); }
      else { showMsg('❌ ' + data.message, 'error'); }
    } catch { showMsg('❌ Network error. Try again.', 'error'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!token) { showMsg('Please login first.', 'error'); return; }
    if (!amount || !accountNumber || !accountName) { showMsg('Please fill all fields.', 'error'); return; }
    if (!Number.isFinite(parseFloat(amount)) || parseFloat(amount) < 3) { showMsg('Minimum withdrawal amount is $3.00.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ address: accountNumber, network: paymentMethod, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (res.ok) { showMsg('✅ ' + data.message, 'success'); setAmount(''); setAccountNumber(''); setAccountName(''); fetchData(); }
      else { showMsg('❌ ' + data.message, 'error'); }
    } catch { showMsg('❌ Network error. Try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-slate-800 pb-24 font-sans antialiased">

      {/* Top Balance Card */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] mx-4 my-3 p-5 rounded-2xl text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
        <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Total Assets</p>
        <h2 className="text-3xl font-black tracking-tight text-white">${balance ?? '0.00'}</h2>
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-bold">
          <button type="button" onClick={() => { setActiveTab('deposit'); setPaymentMethod('EasyPaisa'); }}
            className={`py-2.5 rounded-xl border font-black uppercase transition-all duration-200 ${activeTab === 'deposit' ? 'bg-white text-[#1d4ed8] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'bg-transparent text-white border-white/30'}`}>
            📥 Deposit Funds
          </button>
          <button type="button" onClick={() => setActiveTab('withdraw')}
            className={`py-2.5 rounded-xl border font-black uppercase transition-all duration-200 ${activeTab === 'withdraw' ? 'bg-white text-[#1d4ed8] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'bg-transparent text-white border-white/30'}`}>
            📤 Withdraw Cash
          </button>
        </div>
      </div>

      {/* Timings */}
      <div className="mx-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-semibold shadow-sm">
        <p>🕒 Deposit Hours: 10:00 AM - 09:00 PM (Everyday)</p>
        <p className="mt-0.5">📆 Withdrawal Hours: 10:00 AM - 09:00 PM (Monday to Friday)</p>
      </div>

      {/* Alert message */}
      {message && (
        <div className={`fixed top-20 right-4 left-4 z-50 p-3 rounded-xl text-xs font-bold shadow-lg ${msgType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 mx-4 mt-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider border-b border-slate-100 pb-2">
          {activeTab === 'deposit' ? 'Secure Payment Deposit Gateway' : 'Secure Funds Withdrawal Engine'}
        </h3>

        {/* Gateway selector */}
        <div>
          <label className="text-[10px] text-slate-400 font-bold block mb-1">Select Gateway</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 transition">
            <option value="EasyPaisa">EasyPaisa</option>
            {activeTab === 'withdraw' && <>
              <option value="JazzCash">JazzCash</option>
              <option value="BankTransfer">Bank Transfer</option>
            </>}
          </select>
        </div>

        {/* Admin payment info for deposit */}
        {activeTab === 'deposit' && (
          <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-xs text-slate-600 space-y-1">
            <p>Method: <strong className="text-slate-800">{paymentMethod}</strong></p>
            <p>Send to: <strong className="text-slate-800">{adminDetails[paymentMethod].name}</strong></p>
            <p>Number: <strong className="text-blue-600 font-mono text-sm tracking-wide">{adminDetails[paymentMethod].number}</strong></p>
            {paymentMethod === 'BankTransfer' && <p>Bank: <strong>Local Bank</strong></p>}
            <p className="text-amber-600 font-bold mt-1">⚠️ After paying, paste the transaction ID below and submit.</p>
          </div>
        )}

        {/* Deposit form */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Amount ($) · Minimum $10.00</label>
              <input type="number" min="10" step="0.01" placeholder="Minimum $10.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition" />
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-700">
                <span>8% tax</span>
                <span>-${depositTax.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-bold rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1.5 text-sky-700">
                <span>Total to pay</span>
                <span>${totalToPay.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-bold rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-emerald-700">
                <span>Net credited</span>
                <span>${netReceived.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Transaction ID / Hash</label>
              <input type="text" placeholder="Paste TxID or hash here" value={txid} onChange={e => setTxid(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition font-mono" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </form>
        )}

        {/* Withdraw form */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Amount ($) · Minimum $3.00</label>
              <input type="number" min="3" step="0.01" placeholder="Minimum $3.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none transition" />
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-700">
                <span>8% tax</span>
                <span>-${withdrawalTax.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-bold rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-red-700">
                <span>Total deduction</span>
                <span>${totalDeduction.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Number</label>
              <input type="text" placeholder="EasyPaisa / JazzCash number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none transition" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Title</label>
              <input type="text" placeholder="Account holder name" value={accountName} onChange={e => setAccountName(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50">
              {loading ? 'Processing...' : 'Initiate Withdrawal'}
            </button>
          </form>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-5 mx-4 mt-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Transaction History</h4>
        {transactions.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="bg-[#f8fafc] border border-slate-100 p-3 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-700 capitalize">{tx.type}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{new Date(tx.date).toLocaleDateString()} | {tx.network}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'deposit' || tx.type.startsWith('Lease') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                  </p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
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
};

export default Wallet;
