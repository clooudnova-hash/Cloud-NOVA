import React, { useEffect, useState } from 'react';

const SALE_DURATION = 72 * 60 * 60 * 1000;

const MachineCard = ({ data, onRent, renting }) => {
  const { id, name, dailyIncome, termDays, rebate, totalIncome, limit, price, image } = data || {};
  const isPremium = price >= 80;
  const isSaleMachine = [10, 20, 30, 50].includes(price);
  const saleStorageKey = `cloudnovaMachineSaleDeadline-${id}`;
  const [saleTimeLeft, setSaleTimeLeft] = useState(() => {
    if (!isSaleMachine) return 0;
    const savedDeadline = Number(localStorage.getItem(saleStorageKey));
    const deadline = Number.isFinite(savedDeadline) && savedDeadline > Date.now() ? savedDeadline : Date.now() + SALE_DURATION;
    return Math.max(0, deadline - Date.now());
  });

  useEffect(() => {
    if (!isSaleMachine) return undefined;
    const getSaleDeadline = () => {
      const savedDeadline = Number(localStorage.getItem(saleStorageKey));
      return Number.isFinite(savedDeadline) && savedDeadline > Date.now() ? savedDeadline : Date.now() + SALE_DURATION;
    };
    let deadline = getSaleDeadline();
    localStorage.setItem(saleStorageKey, String(deadline));
    const interval = setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        deadline = Date.now() + SALE_DURATION;
        localStorage.setItem(saleStorageKey, String(deadline));
        setSaleTimeLeft(SALE_DURATION);
      } else {
        setSaleTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSaleMachine, saleStorageKey]);

  const formatSaleTime = milliseconds => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Cycle through miner images if no specific image provided
  const imgSrc = image || `/miner${((id - 1) % 3) + 1}.jpg`;

  return (
    <div className={`group relative rounded-2xl p-4 flex justify-between gap-3 border-l-4 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-0.5 ${isPremium ? 'bg-gradient-to-br from-[#fffdf5] via-[#fff8df] to-[#ffedb0] border-amber-400 border-l-orange-500 shadow-[0_8px_28px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.28)]' : 'bg-gradient-to-r from-white via-white to-[#edf6ff] border-blue-200 border-l-[#2563eb] hover:border-cyan-300 hover:border-l-cyan-500 hover:shadow-[0_10px_28px_rgba(37,99,235,0.16)]'}`}>
      {isSaleMachine && (
        <div className="absolute -top-3 left-4 z-10 rounded-md border-2 border-white bg-gradient-to-r from-[#0b1a50] via-[#2563eb] to-[#00a6c7] px-2.5 py-1 text-[8px] font-black tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
          RECOMMEND / HOT SALE
        </div>
      )}
      {isPremium && (
        <div className={`absolute -top-3 right-4 text-white text-[9px] font-black tracking-[0.16em] px-3 py-1 rounded-full shadow-md border-2 border-white ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
          PREMIUM
        </div>
      )}

      {/* Left: Machine Image */}
      <div className="flex gap-4 items-start w-2/3">
        <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-cyan-500/30 shadow-[0_0_16px_rgba(34,211,238,0.2)] relative bg-[#071126]">
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#070b19;">
                  <span style="font-size:24px">🖥️</span>
                  <span style="font-size:7px;color:#22d3ee;font-weight:900;letter-spacing:2px;margin-top:4px">CN-RIG</span>
                </div>`;
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 opacity-80"></div>
          <div className="absolute bottom-1 right-1 bg-green-500 w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(34,197,94,0.8)]"></div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[13px] font-extrabold text-slate-900 leading-tight">{name || 'CloudNova Machine'}</h3>
          <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
            <p>Daily Income: <span className="text-slate-600 font-bold">${dailyIncome ? dailyIncome.toFixed(2) : '0.00'}</span></p>
            <p>Contract Period: <span className="text-slate-600 font-bold">{termDays || 0} Days</span></p>
            <p className="text-[#388e3c] font-semibold">Rebate: ${rebate ? rebate.toFixed(2) : '0.00'}</p>
          </div>
          <div className="pt-2">
            <span className={`text-[13px] font-black ${isPremium ? 'text-amber-700' : 'text-slate-800'}`}>${price ? price.toFixed(2) : '0.00'}</span>
            {isSaleMachine && (
              <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-[#1d4ed8]">
                Sale ends in {formatSaleTime(saleTimeLeft)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Income + Rent button */}
      <div className="flex flex-col justify-between items-end w-1/3 text-right">
        <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
          <p className="uppercase tracking-wider text-[9px]">Total income</p>
          <p className="text-emerald-700 font-black text-[13px]">${totalIncome ? totalIncome.toFixed(2) : '0.00'}</p>
          <p className="text-[9px] pt-1">Quantity Limits</p>
          <p className="text-slate-700 font-bold">{limit || 1}</p>
        </div>

        <button
          type="button"
          onClick={() => onRent && onRent(data)}
          disabled={renting}
          className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] hover:from-[#2563eb] hover:to-[#1e40af] text-white text-[10px] font-black px-5 py-2 rounded-lg shadow-[0_4px_10px_rgba(37,99,235,0.3)] transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {renting ? '...' : 'RENT'}
        </button>
      </div>
    </div>
  );
};

export default MachineCard;
