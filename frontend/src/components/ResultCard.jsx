export default function ResultCard({ data }) {
    if (!data) return null;

    return (
        <div className="mt-8 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-700 text-center">
                <h3 className="text-xl font-bold text-white">{data.player}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                    {data.role} • {data.matchup}
                </p>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-600">
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">CS Diff @15</span>
                        <span className="text-2xl font-black text-emerald-400">{data.laneDiff.csDiffAt15}</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-600">
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Gold Diff @15</span>
                        <span className="text-2xl font-black text-yellow-400">{data.laneDiff.goldDiffAt15}</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-600">
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">XP Diff @15</span>
                        <span className="text-2xl font-black text-blue-400">{data.laneDiff.xpDiffAt15}</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-600">
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Solo Kills</span>
                        <span className="text-2xl font-black text-red-400">{data.laneDiff.soloKills}</span>
                    </div>
                </div>

                <div className="text-center p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <span className="font-bold text-blue-300">Verdict: </span>
                    <span className="text-white font-medium">{data.verdict}</span>
                </div>
            </div>
        </div>
    );
}