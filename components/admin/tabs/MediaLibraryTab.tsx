
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spinner, Trash, UploadSimple, MagnifyingGlass, Copy, Check, Image as ImageIcon } from 'phosphor-react';
import type { MediaItem } from '../../../types';
import { compressImageIfNeeded, MAX_FILE_SIZE } from '../../../utils/imageUtils';

const MediaLibraryTab = () => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/media');
            if (!res.ok) throw new Error('Failed to load media');
            const data = await res.json();
            setMedia(data.media);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileToUpload = await compressImageIfNeeded(file);

            if (fileToUpload.size > MAX_FILE_SIZE) {
                alert('Bestand is te groot. Maximaal 4.5MB toegestaan.');
                setIsUploading(false);
                return;
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-vercel-filename': fileToUpload.name },
                body: fileToUpload,
            });
            if (!response.ok) throw new Error('Upload failed');
            await fetchMedia();
        } catch (err) {
            console.error(err);
            alert('Upload mislukt.');
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (url: string) => {
        if (!confirm('Weet u zeker dat u deze afbeelding wilt verwijderen? Dit kan niet ongedaan worden gemaakt en kan leiden tot gebroken links op uw site.')) return;

        setDeletingUrl(url);
        try {
            const response = await fetch('/api/media/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            if (!response.ok) throw new Error('Delete failed');
            setMedia(prev => prev.filter(item => item.url !== url));
        } catch (err) {
            console.error(err);
            alert('Verwijderen mislukt.');
        } finally {
            setDeletingUrl(null);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const filteredMedia = media.filter(item => 
        item.pathname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center">
                    <ImageIcon size={28} className="mr-3 text-green-500" />Media Bibliotheek
                </h2>
                 <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                    {isUploading ? <Spinner size={20} className="animate-spin mr-2" /> : <UploadSimple size={20} className="mr-2" />}
                    {isUploading ? 'Verwerken...' : 'Nieuwe Afbeelding'}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                </label>
            </div>

            <div className="mb-6 relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Zoek bestand..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Spinner size={32} className="animate-spin text-green-500" />
                </div>
            ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                        <div key={item.url} className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-all">
                            <img src={item.url} alt={item.pathname} className="w-full h-full object-cover" loading="lazy" />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                <p className="text-xs text-zinc-300 truncate w-full text-center px-2">{item.pathname.split('/').pop()}</p>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => copyToClipboard(item.url)} 
                                        className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-full text-white"
                                        title="Kopieer URL"
                                    >
                                        {copiedUrl === item.url ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.url)} 
                                        className="p-2 bg-zinc-700 hover:bg-red-600 rounded-full text-white"
                                        disabled={deletingUrl === item.url}
                                        title="Verwijderen"
                                    >
                                        {deletingUrl === item.url ? <Spinner size={16} className="animate-spin" /> : <Trash size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                     {filteredMedia.length === 0 && !isLoading && (
                        <div className="col-span-full text-center text-zinc-500 py-10">Geen media gevonden.</div>
                    )}
                </div>
            )}
        </>
    );
};

export default MediaLibraryTab;
