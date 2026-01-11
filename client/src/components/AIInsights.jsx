import React from 'react';

const AIInsights = ({ analysis, loading, onAnalyze }) => {
    if (!analysis && !loading) {
        return (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg text-center">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Yapay Zeka Asistanı</h2>
                <p className="text-gray-400 mb-6">
                    Görevlerinizi analiz etmek, gecikme risklerini görmek ve öncelik önerileri almak için yapay zekayı kullanın.
                </p>
                <button
                    onClick={onAnalyze}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-purple-500/20 flex items-center justify-center mx-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analiz Et
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-fade-in relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    AI Analiz Raporu
                </h2>
                <button
                    onClick={onAnalyze}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors"
                >
                    Yenile
                </button>
            </div>

            <div className="space-y-6">
                {/* Risks Section */}
                {analysis?.risks?.length > 0 && (
                    <div>
                        <h3 className="text-sm uppercase tracking-wider text-red-400 font-semibold mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Tespit Edilen Riskler
                        </h3>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <ul className="list-disc list-inside space-y-1 text-red-200 text-sm">
                                {analysis.risks.map((risk, idx) => (
                                    <li key={idx}>
                                        <span className="font-medium text-red-300">
                                            {risk.taskTitle ? risk.taskTitle : `Görev ${risk.taskId}`}:
                                        </span> {risk.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Suggestions Section */}
                {analysis?.suggestions?.length > 0 && (
                    <div>
                        <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Öneriler
                        </h3>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <ul className="space-y-2 text-green-200 text-sm">
                                {analysis.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="mr-2 opacity-60">•</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {(!analysis?.risks?.length && !analysis?.suggestions?.length) && !loading && (
                    <p className="text-gray-400 text-sm text-center italic">Herhangi bir risk veya öneri bulunamadı. Harika gidiyorsunuz!</p>
                )}
            </div>
        </div>
    );
};

export default AIInsights;
