import React from 'react';

export default function ResultCard({ data }) {
  if (!data) return null;

  // CommunityDragon URL helper
  const getIconUrl = (id) => 
    `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`;

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        
        {/* Header Section: Player Info & Versus Icons */}
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{data.player}</h3>
              <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">{data.role}</p>
            </div>
            
            {/* Champion vs Opponent Icons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={getIconUrl(data.championId)} 
                  alt={data.championName}
                  className="w-12 h-12 rounded-lg border-2 border-blue-500 shadow-lg bg-slate-900"
                />
                <span className="absolute -bottom-2 -right-2 bg-blue-600 text-[10px] px-1 rounded font-bold text-white">YOU</span>
              </div>
              
              <span className="text-slate-500 font-black italic text-sm">VS</span>
              
              <img 
                src={getIconUrl(data.opponentId)} 
                alt={data.opponentName}
                className="w-12 h-12 rounded-lg border-2 border-red-500 opacity-80 shadow-lg bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid Section */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <StatBox 
              label="CS Diff @15" 
              value={data.laneDiff.csDiffAt15} 
              color="text-emerald-400" 
            />
            <StatBox 
              label="Gold Diff @15" 
              value={data.laneDiff.goldDiffAt15} 
              color="text-yellow-400" 
            />
            <StatBox 
              label="XP Diff @15" 
              value={data.laneDiff.xpDiffAt15} 
              color="text-purple-400" 
            />
            <StatBox 
              label="Solo Kills" 
              value={data.laneDiff.soloKills} 
              color="text-red-500" 
            />
          </div>

          {/* Backend Verdict Box */}
          <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-center gap-3 text-center">
            <span className="text-xl">📊</span>
            <p className="text-slate-200 font-semibold italic">"{data.verdict}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/50 hover:border-slate-500 transition-colors">
      <p className="text-slate-500 text-[10px] uppercase font-black tracking-tighter mb-1">
        {label}
      </p>
      <p className={`text-2xl font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}