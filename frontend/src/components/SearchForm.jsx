import { useState } from 'react';
import ResultCard from './ResultCard';

export default function SearchForm() {
    const [region, setRegion] = useState('EUW');
    const [gameName, setGameName] = useState('');
    const [tagLine, setTagLine] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [matches, setMatches] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const sadPoroUrl = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/icon-shocked-poro.png";

    const getIconUrl = (id) => `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`;

    const handleAnalyze = async (e) => {
        e.preventDefault();

        if (!gameName.trim() || !tagLine.trim()) {
            setError('Please provide both Game Name and Tagline.');
            return;
        }

        setError(null);
        setMatches(null);
        setSelectedMatch(null);
        setIsLoading(true);

        try {
            const mockDataArray = await mockBackendCall(region, gameName, tagLine);
            setMatches(mockDataArray);
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setGameName('');
        setTagLine('');
        setError(null);
        setMatches(null);
        setSelectedMatch(null);
    };

    return (
        <div className="max-w-xl mx-auto mt-20 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Match Analyzer (Lane Diff)</h2>
            <form onSubmit={handleAnalyze} className="space-y-5">
                {/* Container for inputs */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col space-y-1 w-full md:w-1/4">
                        {/* Select region dropdown menu */}
                        <label htmlFor="region" className="text-sm font-medium text-slate-300">Region</label>
                        <select
                            id="region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white"
                        >
                            <option value="EUW">EUW</option>
                            <option value="EUNE">EUNE</option>
                            <option value="NA">NA</option>
                            <option value="KR">KR</option>
                        </select>
                    </div>

                    {/* Input Game Name */}
                    <div className="flex flex-col space-y-1 w-full md:w-2/4">
                        <label htmlFor="gameName" className="text-sm font-medium text-slate-300">Game Name</label>
                        <input
                            id="gameName"
                            type="text"
                            placeholder="Ex: Faker"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white"
                        />
                    </div>

                    {/* Input Tagline */}
                    <div className="flex flex-col space-y-1 w-full md:w-1/4">
                        <label htmlFor="tagLine" className="text-sm font-medium text-slate-300">Tagline</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">#</span>
                            <input
                                id="tagLine"
                                type="text"
                                placeholder="KR1"
                                value={tagLine}
                                onChange={(e) => setTagLine(e.target.value)}
                                className="pl-8 pr-4 py-2 w-full bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* State of error "Sad Poro" */}
                {error && (
                    <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-lg flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <img src={sadPoroUrl} alt="Sad Poro" className="w-16 h-16 object-contain" />
                        <div>
                            <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider">Search Failed</h4>
                            <p className="text-red-300/80 text-sm mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/center" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing Matches...
                            </>
                        ) : (
                            'Get Match History'
                        )}
                    </button>
                    {(gameName || tagLine || matches || error) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isLoading}
                            className="py-3 px-6 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* Rendering match list */}
            {matches && !selectedMatch && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">Recent Ranked Matches</h3>
                    <div className="space-y-3">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${match.isWin
                                    ? 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/40'
                                    : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={getIconUrl(match.championId)} alt="Champion" className="w-12 h-12 rounded-full border-2 border-slate-700" />
                                    </div>
                                    <div>
                                        <p className={`font-black tracking-wider ${match.isWin ? 'text-blue-400' : 'text-red-400'}`}>
                                            {match.isWin ? 'VICTORY' : 'DEFEAT'}
                                        </p>
                                        <p className="text-slate-400 text-sm font-medium">vs {match.opponentName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold">{match.laneDiff.csDiffAt15} CS @15</p>
                                    <p className="text-slate-500 text-xs uppercase font-bold mt-1">Click for Lane Diff</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rendering Detailed Match Card (If a match is selected) */}
            {selectedMatch && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setSelectedMatch(null)}
                        className="mb-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Back to Match History
                    </button>
                    <ResultCard data={selectedMatch} />
                </div>
            )}
        </div>
    );
}

function mockBackendCall(region, gameName, tagLine) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (gameName.toLowerCase() === 'teemo') {
                reject(new Error("We couldn't find this player on the rift. Check the spelling or region!"));
                return;
            }

            const playerName = `${gameName} #${tagLine}`;

            resolve([
                {
                    id: "match-1",
                    isWin: true,
                    player: playerName,
                    role: "MID",
                    championName: "Ahri",
                    championId: 103,
                    opponentName: "Sylas",
                    opponentId: 517,
                    laneDiff: { csDiffAt15: "+18", goldDiffAt15: "+450", xpDiffAt15: "+320", soloKills: 2 },
                    verdict: `Lane Kingdom in ${region}!`
                },
                {
                    id: "match-2",
                    isWin: false,
                    player: playerName,
                    role: "MID",
                    championName: "Syndra",
                    championId: 134,
                    opponentName: "Orianna",
                    opponentId: 61,
                    laneDiff: { csDiffAt15: "-12", goldDiffAt15: "-300", xpDiffAt15: "-150", soloKills: 0 },
                    verdict: "Got Outscaled & Camped"
                },
                {
                    id: "match-3",
                    isWin: true,
                    player: playerName,
                    role: "MID",
                    championName: "Yone",
                    championId: 777,
                    opponentName: "Yasuo",
                    opponentId: 157,
                    laneDiff: { csDiffAt15: "+5", goldDiffAt15: "+120", xpDiffAt15: "+50", soloKills: 1 },
                    verdict: "Close Brother Matchup"
                }
            ]);
        }, 1200);
    });
}