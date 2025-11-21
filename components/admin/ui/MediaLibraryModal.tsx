import React, { useState, useEffect } from 'react';
import { Spinner, Trash, UploadSimple, X, Check } from 'phosphor-react';
import type { MediaItem } from '../../../types';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const MediaLibraryModal = ({ isOpen, onClose, onSelect }: MediaLibraryModalProps) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/media');
            if (!res.ok) throw new Error('Failed to load media');
            const data = await res.json();
            setMedia(data.media);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-vercel-filename': file.name },
                body: file,
            });
            if (!response.ok) throw new Error('Upload failed');
            await fetchMedia(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Upload mislukt.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                
                <header className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800">
                    <h3 className="text-xl font-bold text-white">Media Bibliotheek</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner size={32} className="animate-spin text-green-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 mt-10">{error}</div>
                    ) : media.length === 0 ? (
                         <div className="text-center text-zinc-500 mt-10">
                            <p className="mb-4">Geen afbeeldingen gevonden.</p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {media.map((item) => (
                                <button
                                    key={item.url}
                                    onClick={() => { onSelect(item.url); onClose(); }}
                                    className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                >
                                    <img src={item.url} alt={item.pathname} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">Selecteer</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-zinc-700 bg-zinc-800 flex justify-between items-center">
                    <div className="text-xs text-zinc-400">
                        {media.length} bestand(en)
                    </div>
                    <div>
                         <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-zinc-700 hover:bg-zinc-600 transition-colors">
                            {isUploading ? <Spinner size={18} className="animate-spin mr-2" /> : <UploadSimple size={18} className="mr-2" />}
                            {isUploading ? 'Uploaden...' : 'Nieuw Uploaden'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                        </label>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MediaLibraryModal;