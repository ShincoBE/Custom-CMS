import React, { useState, useEffect, useCallback } from 'react';
import { ChartBar, Spinner, Users, Link as LinkIcon, File } from 'phosphor-react';
import type { AnalyticsData } from '../../../types';

interface AnalyticsTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const BarChart = ({ data }: { data: { date: string, visits: number }[] }) => {
    const maxVisits = Math.max(...data.map(d => d.visits), 0);
    return (
        <div className="flex items-end h-64 space-x-2 p-4 bg-zinc-900/50 rounded-lg">
            {data.map(({ date, visits }) => {
                const height = maxVisits > 0 ? (visits / maxVisits) * 100 : 0;
                const formattedDate = new Date(date).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
                return (
                    <div key={date} className="flex-1 flex flex-col items-center justify-end group">
                        <div className="relative w-full h-full flex items-end">
                            <div
                                className="w-full bg-green-700/50 group-hover:bg-green-600 rounded-t-sm transition-all"
                                style={{ height: `${height}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-zinc-400 mt-2">{formattedDate}</span>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-zinc-900 rounded-md border border-zinc-700 shadow-lg">
                           {visits} {visits === 1 ? 'bezoek' : 'bezoeken'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AnalyticsTab = ({ showNotification }: AnalyticsTabProps) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchAnalytics = useCallback(async (period: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/analytics?days=${period}`);
            if (!res.ok) {
                 const errData = await res.json();
                 throw new Error(errData.error || "Kon statistieken niet laden.");
            }
            const analyticsData = await res.json();
            setData(analyticsData);
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchAnalytics(days);
    }, [days, fetchAnalytics]);
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Spinner size={32} className="animate-spin" /></div>;
        }
        if (!data || data.total === 0) {
            return <div className="text-center text-zinc-400 p-8">Nog geen analysegegevens beschikbaar. Kom later terug.</div>
        }
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                        <div className="flex items-center">
                           <Users size={24} className="text-green-500 mr-3" />
                           <h3 className="text-sm font-medium text-zinc-400">Totaal Aantal Bezoeken</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mt-2">{data.total.toLocaleString('nl-BE')}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                        <div className="flex items-center">
                           <LinkIcon size={24} className="text-green-500 mr-3" />
                           <h3 className="text-sm font-medium text-zinc-400">Top Verwijzer</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mt-2 truncate">{data.topReferrer}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">Bezoeken Per Dag</h3>
                    <BarChart data={data.daily} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-white">Top Pagina's</h3>
                        <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                            <ul>
                                {data.pages.map(({ path, visits }) => (
                                    <li key={path} className="flex justify-between items-center py-2 border-b border-zinc-700/50 last:border-b-0">
                                        <span className="text-sm text-zinc-300 truncate pr-4">{path === '/' ? '/ (Home)' : path}</span>
                                        <span className="font-bold text-white">{visits.toLocaleString('nl-BE')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-white">Top Verwijzers</h3>
                         <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                            <ul>
                                {data.referrers.map(({ source, visits }) => (
                                    <li key={source} className="flex justify-between items-center py-2 border-b border-zinc-700/50 last:border-b-0">
                                        <span className="text-sm text-zinc-300 truncate pr-4">{source}</span>
                                        <span className="font-bold text-white">{visits.toLocaleString('nl-BE')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center">
                    <ChartBar size={28} className="mr-3 text-green-500" />Statistieken
                </h2>
                <div className="flex items-center space-x-2">
                    {[7, 30, 90].map(period => (
                        <button
                            key={period}
                            onClick={() => setDays(period)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                days === period
                                ? 'bg-green-600 text-white'
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            }`}
                        >
                            {period} dagen
                        </button>
                    ))}
                </div>
            </div>
            {renderContent()}
        </>
    );
};

export default AnalyticsTab;
