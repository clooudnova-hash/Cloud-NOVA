import React from 'react';

const MachineCard = ({ data, onRent, renting }) => {
  const { id, name, dailyIncome, termDays, rebate, totalIncome, limit, price, image } = data || {};

  // Cycle through miner images if no specific image provided
  const imgSrc = image || `/miner${((id - 1) % 3) + 1}.jpg`;

  return (
    <div className="bg-white rounded-2xl p-4 flex justify-between shadow-sm border border-slate-100 hover:shadow-md transition duration-200">

      {/* Left: Machine Image */}
      <div className="flex gap-4 items-start w-2/3">
        <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-blue-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] relative bg-[#070b19]">
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
          <h3 className="text-[13px] font-extrabold text-slate-800 leading-tight">{name || 'CloudNova Machine'}</h3>
          <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
            <p>Daily Income: <span className="text-slate-600 font-bold">${dailyIncome ? dailyIncome.toFixed(2) : '0.00'}</span></p>
            <p>Contract Period: <span className="text-slate-600 font-bold">{termDays || 0} Days</span></p>
            <p className="text-[#388e3c] font-semibold">Rebate: ${rebate ? rebate.toFixed(2) : '0.00'}</p>
          </div>
          <div className="pt-2">
            <span className="text-[13px] font-black text-slate-800">${price ? price.toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Right: Income + Rent button */}
      <div className="flex flex-col justify-between items-end w-1/3 text-right">
        <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
          <p>Total income</p>
          <p className="text-slate-700 font-black text-[12px]">${totalIncome ? totalIncome.toFixed(2) : '0.00'}</p>
          <p className="text-[9px] pt-1">Quantity Limits</p>
          <p className="text-slate-700 font-bold">{limit || 1}</p>
        </div>

        <button
          type="button"
          onClick={() => onRent && onRent(data)}
          disabled={renting}
          className="bg-[#1e88e5] text-white text-[10px] font-black px-5 py-1.5 rounded-lg shadow-sm hover:bg-[#1565c0] transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {renting ? '...' : 'RENT'}
        </button>
      </div>
    </div>
  );
};

export default MachineCard;
