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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
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
                matchup: "Ahri vs Sylas",
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