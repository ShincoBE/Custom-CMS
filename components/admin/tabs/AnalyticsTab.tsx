import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChartBar, Spinner, Users, Link as LinkIcon, Globe, DeviceMobile, HandPointing, MapPin, ArrowClockwise, Table, ChartLine } from 'phosphor-react';
import type { AnalyticsData } from '../../../types';

const formatPath = (path: string) => {
    if (path === '/') return 'Homepagina';
    if (path.startsWith('/diensten/')) return `Dienst: ${path.substring(9)}`;
    return path;
};

const formatReferrer = (referrer: string) => {
    if (referrer === 'direct' || referrer === 'N/A') return 'Direct verkeer';
    return referrer;
};

const formatEvent = (name: string, detail: string) => {
    const eventMap: Record<string, string> = {
        'Hero CTA': "Klik op 'Vraag Offerte Aan' (Hero)",
        'Nav Gallery Button': "Klik op 'Galerij' (Navigatie)",
        'CTA Gallery Button': "Klik op 'Open Galerij' (CTA)",
        'Email': "Klik op E-mailadres (Contact)",
        'Phone': "Klik op Telefoonnummer (Contact)",
        'Address': "Klik op Adres (Contact)"
    };
    return eventMap[detail] || `${name}: ${detail}`;
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
        <div className="flex items-center">
           {icon}
           <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-white mt-2 truncate">{value}</p>
    </div>
);

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
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 gap-4 sm:gap-0 p-4 h-full">
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
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700">
            <ul className="divide-y divide-zinc-700/50 sm:hidden">
                {data.map((item, index) => (
                    <li key={index} className="p-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="truncate pr-4 flex-grow text-zinc-300 font-medium">
                                {columns[0].accessor(item)}
                            </span>
                             <span className="font-bold text-white">
                                {columns[1].accessor(item)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <table className="hidden sm:table w-full text-sm">
                <thead>
                    <tr className="text-left text-zinc-400 font-semibold">
                       {columns.map((col, i) => <th key={i} className={`p-2 ${col.isNumeric ? 'text-right' : ''}`}>{col.header}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/50">
                    {data.map((item, index) => (
                         <tr key={index}>
                            {columns.map((col, i) => (
                                <td key={i} className={`p-2 ${col.isNumeric ? 'text-right font-bold' : 'text-zinc-300'} ${item.placeholder ? 'text-zinc-500' : ''}`}>
                                    {col.accessor(item)}
                                </td>
                            ))}
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DailyVisitsChart = ({ data, width }: { data: { date: string, visits: number, uniques: number }[], width: number }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    if (!data || data.length < 1) {
        return <div className="flex items-center justify-center h-64 text-zinc-400">Niet genoeg data voor een grafiek.</div>;
    }

    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = Math.max(0, width - padding.left - padding.right);
    const chartHeight = Math.max(0, height - padding.top - padding.bottom);
    const dataPoints = data.length;

    // Adjust max visits to prevent division by zero and add headroom
    const maxVisits = Math.max(...data.map(d => d.visits), 5) * 1.1;
    
    const xScale = (index: number) => padding.left + index * (chartWidth / dataPoints);
    const yScale = (value: number) => height - padding.bottom - (value / maxVisits) * chartHeight;
    
    // Dynamically calculate bar width to fit the container
    const barWidth = Math.max(2, (chartWidth / dataPoints) * 0.6);

    const uniquePoints = data.map((d, i) => `${xScale(i) + (chartWidth / dataPoints / 2)},${yScale(d.uniques)}`).join(' ');

    const yAxisTicks = [0.25, 0.5, 0.75, 1];

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Find closest index based on mouse X relative to chart area
        const index = Math.floor(((x - padding.left) / chartWidth) * dataPoints);

        if (index >= 0 && index < data.length) {
            const pointData = data[index];
            const dateObj = new Date(pointData.date);
            const formattedDate = dateObj.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
            
            const content = `
                <div class="font-semibold mb-1 text-center border-b border-zinc-700 pb-1">${formattedDate}</div>
                <div class="flex justify-between gap-4 text-sm"><span>Bezoeken:</span> <strong class="text-green-400">${pointData.visits}</strong></div>
                <div class="flex justify-between gap-4 text-sm"><span>Uniek:</span> <strong class="text-green-400">${pointData.uniques}</strong></div>
            `;
            
            // Position tooltip centered on bar
            let tooltipX = xScale(index) + (chartWidth / dataPoints / 2);
            const tooltipY = Math.min(yScale(pointData.visits), yScale(pointData.uniques)) - 10;

            setTooltip({ x: tooltipX, y: tooltipY, content });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="relative w-full h-[300px] select-none">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="block"
            >
                {/* Grid Lines */}
                {yAxisTicks.map(tick => {
                    const val = Math.round(maxVisits * tick);
                    const y = yScale(val);
                    return (
                        <g key={tick}>
                             <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4" />
                             <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#71717a" fontSize="10">{val}</text>
                        </g>
                    )
                })}
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#52525b" strokeWidth="1" />
                <text x={padding.left - 8} y={height - padding.bottom + 4} textAnchor="end" fill="#71717a" fontSize="10">0</text>

                {/* Bars */}
                {data.map((d, i) => (
                    <rect
                        key={`bar-${i}`}
                        x={xScale(i) + ((chartWidth / dataPoints - barWidth) / 2)}
                        y={yScale(d.visits)}
                        width={barWidth}
                        height={Math.max(0, height - padding.bottom - yScale(d.visits))}
                        fill="#15803d"
                        className="hover:opacity-80 transition-opacity duration-200"
                    />
                ))}

                {/* Line for Uniques */}
                 <polyline
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    points={uniquePoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                />

                {/* X-Axis Labels - Filtered to prevent overlapping */}
                {data.map((d, i) => {
                    const dateObj = new Date(d.date);
                    const formattedDate = dateObj.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
                    
                    // Calculate step to ensure labels don't overlap (assuming ~40px per label)
                    const labelWidth = 40;
                    const maxLabels = Math.floor(chartWidth / labelWidth); 
                    const step = Math.ceil(dataPoints / maxLabels);
                    
                    if (i % step !== 0) return null;

                    return (
                        <text key={i} x={xScale(i) + (chartWidth / dataPoints / 2)} y={height - padding.bottom + 20} textAnchor="middle" fill="#a1a1aa" fontSize="10">
                            {formattedDate}
                        </text>
                    )
                })}
            </svg>
            
            {tooltip && (
                <div 
                    className="absolute pointer-events-none bg-zinc-900/90 backdrop-blur-sm border border-zinc-600 text-white text-xs rounded-md p-2 shadow-xl z-10 whitespace-nowrap transition-all duration-75 ease-out"
                    style={{ 
                        left: tooltip.x, 
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)' 
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: tooltip.content }} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900/90 border-r border-b border-zinc-600 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

interface AnalyticsTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const AnalyticsTab = ({ showNotification }: AnalyticsTabProps) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Use ResizeObserver to keep chart width synced with container width
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                // Use contentRect to get width without padding/border
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        if (chartContainerRef.current) {
            observer.observe(chartContainerRef.current);
        }
        return () => observer.disconnect();
    }, [viewMode]);

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
        
        // Pad data to always show a top 3, with placeholders if needed.
        const padData = (dataArray: any[], size: number = 3) => {
            const padded = [...(dataArray || [])];
            while (padded.length < size) {
                padded.push({ placeholder: true });
            }
            return padded.slice(0, size);
        };

        const topEvents = padData(data.events);
        const topPages = padData(data.pages);
        
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Totaal Bezoeken" value={data.total.toLocaleString('nl-BE')} icon={<ChartBar size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Unieke Bezoekers" value={data.uniques.toLocaleString('nl-BE')} icon={<Users size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Stad" value={data.topCity} icon={<MapPin size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Verwijzer" value={formatReferrer(data.topReferrer)} icon={<LinkIcon size={24} className="text-green-500 mr-3" />} />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-semibold text-white">Bezoeken Per Dag</h3>
                         <div className="bg-zinc-700 rounded-md p-1 flex">
                             <button 
                                onClick={() => setViewMode('chart')}
                                className={`p-1.5 rounded ${viewMode === 'chart' ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                                title="Grafiekweergave"
                             >
                                 <ChartLine size={18} />
                             </button>
                             <button 
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                                title="Tabelweergave"
                             >
                                 <Table size={18} />
                             </button>
                         </div>
                    </div>
                    {viewMode === 'chart' ? (
                         <div ref={chartContainerRef} className="bg-zinc-900/50 rounded-lg p-2 sm:p-4 border border-zinc-700 w-full overflow-hidden">
                            {data.daily && containerWidth > 0 && (
                                <DailyVisitsChart data={data.daily} width={containerWidth} />
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 rounded-lg border border-zinc-700 overflow-hidden max-h-[300px] overflow-y-auto">
                             <table className="w-full text-sm">
                                <thead className="bg-zinc-800 sticky top-0">
                                    <tr className="text-left text-zinc-400 font-semibold">
                                        <th className="p-3">Datum</th>
                                        <th className="p-3 text-right">Bezoeken</th>
                                        <th className="p-3 text-right">Uniek</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700/50">
                                    {data.daily?.slice().reverse().map((day) => (
                                        <tr key={day.date}>
                                            <td className="p-3 text-zinc-300">
                                                {new Date(day.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}
                                            </td>
                                            <td className="p-3 text-right font-bold text-white">{day.visits}</td>
                                            <td className="p-3 text-right text-zinc-300">{day.uniques}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    )}
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
                               { header: 'Bezoeken', accessor: (row) => row.visits.toLocaleString('nl-BE'), isNumeric: true }
                           ]}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <DataTable 
                        title="Belangrijkste Interacties"
                        icon={<HandPointing size={20} className="mr-2"/>}
                        data={topEvents}
                        columns={[
                            { header: 'Actie', accessor: (row) => row.placeholder ? 'Nog geen data' : formatEvent(row.name, row.detail) },
                            { header: 'Aantal', accessor: (row) => row.placeholder ? '-' : row.count.toLocaleString('nl-BE'), isNumeric: true }
                        ]}
                     />
                     <DataTable 
                        title="Top Pagina's"
                        icon={<Users size={20} className="mr-2"/>}
                        data={topPages}
                        columns={[
                            { header: 'Pagina', accessor: (row) => row.placeholder ? 'Nog geen data' : formatPath(row.path) },
                            { header: 'Bezoeken', accessor: (row) => row.placeholder ? '-' : row.visits.toLocaleString('nl-BE'), isNumeric: true }
                        ]}
                     />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center">
                    <ChartBar size={28} className="mr-3 text-green-500" />Statistieken
                </h2>
                <div className="flex items-center space-x-2 self-end">
                    {[7, 30, 90].map(period => (
                        <button
                            key={period}
                            onClick={() => setDays(period)}
                            disabled={isLoading}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                days === period
                                ? 'bg-green-600 text-white'
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {period}d
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => fetchAnalytics(days)}
                        disabled={isLoading}
                        className="p-2 text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Statistieken vernieuwen"
                        title="Vernieuwen"
                    >
                        {isLoading ? (
                            <Spinner size={16} className="animate-spin" />
                        ) : (
                            <ArrowClockwise size={16} />
                        )}
                    </button>
                </div>
            </div>
            {renderContent()}
        </>
    );
};

export default AnalyticsTab;