import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChartBar, Spinner, Users, Link as LinkIcon, Globe, DeviceMobile, HandPointing, MapPin, ArrowClockwise } from 'phosphor-react';
import type { AnalyticsData } from '../../../types';

// --- START: Formatting Helpers ---
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
// --- END: Formatting Helpers ---

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
            {/* Mobile Card View */}
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
             {/* Desktop Table View */}
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


const AnalyticsTab = ({ showNotification }: AnalyticsTabProps) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [days, setDays] = useState(30);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        const currentRef = chartContainerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

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
    
    const DailyVisitsChart = ({ data, period }: { data: { date: string, visits: number, uniques: number }[], period: number }) => {
        const svgRef = useRef<SVGSVGElement>(null);
        const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

        if (!data || data.length < 1) {
            return <div className="flex items-center justify-center h-64 text-zinc-400">Niet genoeg data voor een grafiek.</div>;
        }

        const width = period >= 90 ? Math.max(containerWidth, data.length * 20) : containerWidth;
        const height = 256;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const dataPoints = data.length;

        const maxVisits = Math.max(...data.map(d => d.visits), 1);
        
        const xScale = (index: number) => padding.left + index * (chartWidth / dataPoints);
        const yScale = (value: number) => height - padding.bottom - (value / maxVisits) * chartHeight;
        const barWidth = Math.max(1, (chartWidth / dataPoints) * 0.6);

        const uniquePoints = data.map((d, i) => `${xScale(i) + (chartWidth / dataPoints / 2)},${yScale(d.uniques)}`).join(' ');

        const isWeekly = period > 60;
        const yAxisTicks = [1/4, 2/4, 3/4];

        const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
            const svg = svgRef.current;
            if (!svg) return;
            
            const rect = svg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            const index = Math.floor(((x - padding.left) / chartWidth) * dataPoints);

            if (index >= 0 && index < data.length) {
                const pointData = data[index];
                const dateObj = new Date(pointData.date);
                const formattedDate = dateObj.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
                const tooltipTitle = isWeekly ? `Week van ${formattedDate}` : formattedDate;

                const content = `
                    <div class="font-semibold">${tooltipTitle}</div>
                    <strong>${pointData.visits}</strong> ${pointData.visits === 1 ? 'bezoek' : 'bezoeken'}<br/>
                    <strong>${pointData.uniques}</strong> ${pointData.uniques === 1 ? 'unieke bezoeker' : 'unieke bezoekers'}
                `;
                
                const tooltipX = xScale(index) + barWidth / 2;
                const tooltipY = Math.min(yScale(pointData.visits), yScale(pointData.uniques));

                setTooltip({ x: tooltipX, y: tooltipY, content });
            }
        };

        const handleMouseLeave = () => {
            setTooltip(null);
        };

        let tooltipJsx = null;
        if (tooltip) {
            const tooltipWidth = 140;
            const tooltipHeight = 60;
            const tooltipOffset = 20;

            let tooltipX = tooltip.x + tooltipOffset;
            if (tooltipX + tooltipWidth > width - padding.right) {
                tooltipX = tooltip.x - tooltipWidth - tooltipOffset;
            }
            if (tooltipX < padding.left) {
                tooltipX = padding.left;
            }

            let tooltipY = tooltip.y - (tooltipHeight / 2);
            if (tooltipY < padding.top) {
                tooltipY = padding.top;
            }
            if (tooltipY + tooltipHeight > height - padding.bottom) {
                tooltipY = height - padding.bottom - tooltipHeight;
            }

            tooltipJsx = (
                <g pointerEvents="none">
                    <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4" />
                    <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight}>
                         <div
                            className="px-2 py-1 text-xs text-white bg-zinc-900/80 backdrop-blur-sm rounded-md border border-zinc-700 shadow-lg text-center"
                            dangerouslySetInnerHTML={{ __html: tooltip.content }}
                        />
                    </foreignObject>
                </g>
            );
        }

        return (
            <svg
                ref={svgRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Y-axis grid lines and labels */}
                {yAxisTicks.map(tick => {
                    const y = yScale(maxVisits * tick);
                    const value = Math.round(maxVisits * tick);
                    return (
                        <g key={tick} className="text-zinc-500 text-xs">
                            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="currentColor">{value}</text>
                        </g>
                    )
                })}
                
                {/* Y-axis top and bottom labels */}
                <text x={padding.left - 8} y={padding.top + 5} textAnchor="end" fill="#a1a1aa" fontSize="12">{Math.ceil(maxVisits)}</text>
                <text x={padding.left - 8} y={height - padding.bottom + 4} textAnchor="end" fill="#a1a1aa" fontSize="12">0</text>
                
                {/* Bars for Total Visits */}
                {data.map((d, i) => (
                    <rect
                        key={`bar-${d.date}`}
                        x={xScale(i) + ((chartWidth / dataPoints - barWidth) / 2)}
                        y={yScale(d.visits)}
                        width={barWidth}
                        height={height - padding.bottom - yScale(d.visits)}
                        fill="#15803d"
                        className="opacity-50"
                    />
                ))}

                {/* Line for Unique Visitors */}
                <polyline
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    points={uniquePoints}
                />
                
                {/* X-axis labels */}
                {data.map((d, i) => {
                     const dateObj = new Date(d.date);
                     const formattedDate = dateObj.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
                     const labelFrequency = Math.ceil(data.length / (width / 70));
                     if (i % labelFrequency !== 0 && i !== data.length - 1) return null;
                     return (
                        <text key={d.date} x={xScale(i) + (chartWidth / dataPoints / 2)} y={height - padding.bottom + 15} textAnchor="middle" fill="#a1a1aa" fontSize="12">
                            {formattedDate}
                        </text>
                     )
                })}

                {tooltipJsx}
            </svg>
        );
    };

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Totaal Bezoeken" value={data.total.toLocaleString('nl-BE')} icon={<ChartBar size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Unieke Bezoekers" value={data.uniques.toLocaleString('nl-BE')} icon={<Users size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Stad" value={data.topCity} icon={<MapPin size={24} className="text-green-500 mr-3" />} />
                    <StatCard title="Top Verwijzer" value={formatReferrer(data.topReferrer)} icon={<LinkIcon size={24} className="text-green-500 mr-3" />} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">Bezoeken Per Dag</h3>
                    <div ref={chartContainerRef} className="overflow-x-auto relative bg-zinc-900/50 rounded-lg p-2">
                       {containerWidth > 0 && data.daily && (
                            <DailyVisitsChart data={data.daily} period={days} />
                       )}
                    </div>
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