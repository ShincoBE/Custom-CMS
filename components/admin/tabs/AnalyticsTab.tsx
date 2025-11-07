import React, { useState, useEffect, useCallback } from 'react';
// Fix: Replaced non-existent 'CursorClick' and 'HandTap' icons with 'HandPointing' to resolve module export errors.
import { ChartBar, Spinner, Users, Link as LinkIcon, Globe, DeviceMobile, HandPointing, MapPin } from 'phosphor-react';
import type { AnalyticsData } from '../../../types';

interface AnalyticsTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
        <div className="flex items-center">
           {icon}
           <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-white mt-2 truncate">{value}</p>
    </div>
);

const DailyBarChart = ({ data }: { data: { date: string, visits: number, uniques: number }[] }) => {
    const maxVisits = Math.max(...data.map(d => d.visits), 0);
    return (
        <div className="flex items-end h-64 space-x-2 p-4 bg-zinc-900/50 rounded-lg">
            {data.map(({ date, visits, uniques }) => {
                const height = maxVisits > 0 ? (visits / maxVisits) * 100 : 0;
                const formattedDate = new Date(date).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
                return (
                    <div key={date} className="flex-1 flex flex-col items-center justify-end group relative">
                        <div className="w-full h-full flex items-end">
                            <div className="w-full bg-green-700/50 group-hover:bg-green-600 rounded-t-sm transition-all" style={{ height: `${height}%` }} />
                        </div>
                        <span className="text-xs text-zinc-400 mt-2">{formattedDate}</span>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-zinc-900 rounded-md border border-zinc-700 shadow-lg text-center whitespace-nowrap">
                           <strong>{visits}</strong> {visits === 1 ? 'bezoek' : 'bezoeken'}<br/>
                           <strong>{uniques}</strong> {uniques === 1 ? 'unieke' : 'unieke'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DonutChart = ({ data }: { data: { type: string; visits: number }[] }) => {
    const total = data.reduce((acc, item) => acc + item.visits, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full text-zinc-400">Geen apparaatdata.</div>;

    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = (item.visits / total) * 100;
        const offset = cumulativePercent;
        cumulativePercent += percent;
        return { ...item, percent, offset };
    });

    const colors = ['#16a34a', '#15803d', '#166534'];

    return (
        <div className="flex items-center justify-center space-x-6 p-4 h-full">
            <svg width="120" height="120" viewBox="0 0 36 36" className="-rotate-90">
                {segments.map((segment, i) => (
                    <circle
                        key={segment.type}
                        cx="18" cy="18" r="15.915"
                        fill="transparent"
                        stroke={colors[i % colors.length]}
                        strokeWidth="4"
                        strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                        strokeDashoffset={-segment.offset}
                    />
                ))}
            </svg>
            <div className="text-sm">
                {segments.map((segment, i) => (
                    <div key={segment.type} className="flex items-center mb-1">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        <span>{segment.type}: <strong>{segment.visits}</strong></span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DataTable = ({ title, icon, data, columns }: { title: string, icon: React.ReactNode, data: any[], columns: { header: string, accessor: (row: any) => any, isNumeric?: boolean }[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-3 text-white flex items-center">{icon}{title}</h3>
        <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-700">
            <ul className="divide-y divide-zinc-700/50">
                {data.length > 0 ? data.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-2 px-2">
                        {columns.map((col, colIndex) => (
                           <span key={colIndex} className={`text-sm ${colIndex === 0 ? 'text-zinc-300 truncate pr-4 flex-grow' : 'font-bold text-white'}`}>
                                {col.accessor(item)}
                           </span>
                        ))}
                    </li>
                )) : <li className="text-center text-zinc-400 text-sm py-4">Geen data</li>}
            </ul>
        </div>
    </div>
);


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
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Totaal Bezoeken" value={data.total.toLocaleString('nl-BE')} icon={<ChartBar size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Unieke Bezoekers" value={data.uniques.toLocaleString('nl-BE')} icon={<Users size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Stad" value={data.topCity} icon={<MapPin size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Verwijzer" value={data.topReferrer} icon={<LinkIcon size={24} className="text-green-500 mr-3" />} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">Bezoeken Per Dag</h3>
                    <DailyBarChart data={data.daily} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-semibold mb-3 text-white flex items-center"><DeviceMobile size={20} className="mr-2"/>Apparaten</h3>
                        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 h-48">
                            <DonutChart data={data.devices} />
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <DataTable 
                           title="Top Locaties"
                           icon={<Globe size={20} className="mr-2"/>}
                           data={data.locations}
                           columns={[
                               { header: 'Locatie', accessor: (row) => `${row.city}, ${row.country}` },
                               { header: 'Bezoeken', accessor: (row) => row.visits.toLocaleString('nl-BE') }
                           ]}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <DataTable 
                        title="Belangrijkste Interacties"
                        icon={<HandPointing size={20} className="mr-2"/>}
                        data={data.events}
                        columns={[
                            { header: 'Actie', accessor: (row) => `${row.name}: ${row.detail}` },
                            { header: 'Aantal', accessor: (row) => row.count.toLocaleString('nl-BE') }
                        ]}
                     />
                     <DataTable 
                        title="Top Pagina's"
                        icon={<Users size={20} className="mr-2"/>}
                        data={data.pages}
                        columns={[
                            { header: 'Pagina', accessor: (row) => row.path === '/' ? '/ (Home)' : row.path },
                            { header: 'Bezoeken', accessor: (row) => row.visits.toLocaleString('nl-BE') }
                        ]}
                     />
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