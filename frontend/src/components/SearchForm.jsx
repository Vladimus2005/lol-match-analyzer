import { useState } from 'react';
import ResultCard from './ResultCard';

export default function SearchForm() {
    const [gameName, setGameName] = useState('');
    const [tagLine, setTagLine] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();

        if (!gameName.trim() || !tagLine.trim()) {
            setError('Please provide both Game Name and Tagline.');
            return;
        }

        setError(null);
        setResult(null);
        setIsLoading(true);

        try {
            const mockData = await mockBackendCall(gameName, tagLine);
            setResult(mockData);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setGameName('');
        setTagLine('');
        setError(null);
        setResult(null);
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Match Analyzer (Lane Diff)</h2>

            <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="flex flex-col space-y-1">
                    <label htmlFor="gameName" className="text-sm font-medium text-slate-300">Game Name</label>
                    <input
                        id="gameName"
                        type="text"
                        placeholder="Ex: Faker"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <label htmlFor="tagLine" className="text-sm font-medium text-slate-300">Tagline</label>
                    <input
                        id="tagLine"
                        type="text"
                        placeholder="Ex: KR1"
                        value={tagLine}
                        onChange={(e) => setTagLine(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                </div>

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                <div className="flex gap-3">
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
                                Analyzing Match...
                            </>
                        ) : (
                            'Analyze Lane Diff'
                        )}
                    </button>
                    {(gameName || tagLine || result || error) && (
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

            <ResultCard data={result} />
        </div>
    );
}

function mockBackendCall(gameName, tagLine) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                player: `${gameName}#${tagLine}`,
                role: "MID",
                championName: "Ahri",
                championId: 103,
                opponentName: "Sylas",
                opponentId: 517,
                laneDiff: {
                    csDiffAt15: "+18",
                    goldDiffAt15: "+450",
                    xpDiffAt15: "+320",
                    soloKills: 2
                },
                verdict: "Lane Kingdom!"
            });
        }, 1500);
    });
}