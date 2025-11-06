import React, { useState, useEffect, useCallback } from 'react';
import { ClockCounterClockwise, Spinner } from 'phosphor-react';

interface HistoryTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
    showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
    onRestore: () => void;
}

const HistoryTab = ({ showNotification, showConfirmation, onRestore }: HistoryTabProps) => {
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/content-history');
            if (!res.ok) throw new Error("Kon geschiedenis niet laden.");
            const data = await res.json();
            setHistory(data.history);
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleRestore = (timestamp: string) => {
        const date = new Date(timestamp);
        // This check is a safeguard; the button should be disabled for invalid dates.
        if (isNaN(date.getTime())) {
            showNotification('error', 'Kan versie met ongeldige datum niet herstellen.');
            return;
        }

        showConfirmation(
            'Versie Herstellen',
            `Weet u zeker dat u de content wilt herstellen naar de versie van ${date.toLocaleString('nl-BE')}? Alle niet-opgeslagen wijzigingen gaan verloren.`,
            async () => {
                setIsRestoring(timestamp);
                try {
                    const res = await fetch('/api/revert-content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ timestamp }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showNotification('success', data.message);
                    onRestore(); // Callback to reload content in parent
                } catch (error: any) {
                    showNotification('error', error.message);
                } finally {
                    setIsRestoring(null);
                }
            }
        );
    };
    
    return (
      <>
        <h2 className="text-2xl font-bold mb-1 text-zinc-100 flex items-center"><ClockCounterClockwise size={28} className="mr-3 text-green-500" />Content Geschiedenis</h2>
        <p className="text-zinc-400 mb-6">Hieronder vindt u de laatste 10 opgeslagen versies van de website content. U kunt een eerdere versie herstellen om wijzigingen ongedaan te maken.</p>
        
        {isLoading ? <Spinner size={24} className="animate-spin" /> : (
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
                <ul className="divide-y divide-zinc-700">
                    {history.length > 0 ? history.map(timestamp => {
                        const date = new Date(timestamp);
                        const isValidDate = !isNaN(date.getTime());
                        const displayDate = isValidDate
                            ? date.toLocaleString('nl-BE', { dateStyle: 'long', timeStyle: 'medium' })
                            : 'Ongeldige Datum';

                        return (
                            <li key={timestamp} className={`flex items-center justify-between p-4 bg-zinc-800/50 ${isValidDate ? 'hover:bg-zinc-700/50' : ''}`}>
                                <span className={`text-zinc-200 ${!isValidDate ? 'text-red-400' : ''}`}>
                                    Versie van <time dateTime={timestamp}>{displayDate}</time>
                                </span>
                                <button
                                    onClick={() => handleRestore(timestamp)}
                                    disabled={!!isRestoring || !isValidDate}
                                    className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRestoring === timestamp ? <Spinner size={16} className="animate-spin mr-2" /> : <ClockCounterClockwise size={16} className="mr-2"/>}
                                    {isRestoring === timestamp ? 'Herstellen...' : 'Herstel'}
                                </button>
                            </li>
                        );
                    }) : (
                        <li className="p-4 text-center text-zinc-400">Nog geen geschiedenis beschikbaar.</li>
                    )}
                </ul>
            </div>
        )}
      </>
    );
};

export default HistoryTab;