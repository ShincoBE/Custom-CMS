import React, { useState, useMemo } from 'react';
import type { PageContent, GalleryImage } from '../../../types';
import { Plus, Pencil, Trash, MagnifyingGlass, CheckCircle, Prohibit, DotsThree } from 'phosphor-react';
import InputWithCounter from '../ui/InputWithCounter';

interface GalleryTabProps {
    content: PageContent;
    gallery: GalleryImage[];
    handleContentChange: (path: string, value: any) => void;
    setGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
    setEditingImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const GalleryTab = ({ content, gallery, handleContentChange, setGallery, setEditingImageIndex }: GalleryTabProps) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

    const filteredGallery = useMemo(() => {
        if (!gallery) return [];
        if (!searchTerm) return gallery;
        return gallery.filter(img => 
            img.image.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [gallery, searchTerm]);

    const handleToggleSelection = (id: string) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedImages.size === filteredGallery.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(filteredGallery.map(img => img._id)));
        }
    };
    
    const handleBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
        const selectedIds = Array.from(selectedImages);
        if (action === 'delete') {
            setGallery(g => g.filter(img => !selectedIds.includes(img._id)));
        } else {
            setGallery(g => g.map(img => selectedIds.includes(img._id) ? { ...img, published: action === 'publish' } : img));
        }
        setSelectedImages(new Set());
        setIsBulkMenuOpen(false);
    };


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDropTargetIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDropTargetIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const list = [...gallery];
        const draggedItem = list[draggedIndex];
        list.splice(draggedIndex, 1);
        list.splice(dropIndex, 0, draggedItem);
        
        setGallery(list);
    };
    
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };


    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Galerij Instellingen</h2>
            <InputWithCounter name="galleryTitle" label="Galerij Titel" help="De titel die bovenaan in de galerij popup verschijnt." value={content.galleryTitle!} onChange={e => handleContentChange('galleryTitle', e.target.value)} required showStyler />
            <InputWithCounter as="textarea" name="gallerySubtitle" label="Galerij Subtitel" help="De subtitel in de galerij popup." value={content.gallerySubtitle!} onChange={e => handleContentChange('gallerySubtitle', e.target.value)} required showStyler />
            
            <div className="flex justify-between items-center mt-6 mb-4">
                <h3 className="text-lg font-semibold text-white">Galerij Afbeeldingen</h3>
                <div className="relative">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Zoek op alt of categorie..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-zinc-700 border border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            {selectedImages.size > 0 && (
                <div className="bg-zinc-700 p-2 rounded-md mb-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{selectedImages.size} afbeelding(en) geselecteerd</span>
                    <div className="relative">
                        <button onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)} className="flex items-center px-3 py-1 bg-zinc-600 rounded-md hover:bg-zinc-500">
                           <DotsThree size={20} /> <span className="ml-2">Acties</span>
                        </button>
                        {isBulkMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                                <button onClick={() => handleBulkAction('publish')} className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Publiceren</button>
                                <button onClick={() => handleBulkAction('unpublish')} className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Depubliceren</button>
                                <button onClick={() => handleBulkAction('delete')} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700">Verwijderen</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400">
                    <input type="checkbox" checked={selectedImages.size > 0 && selectedImages.size === filteredGallery.length} onChange={handleSelectAll} className="h-4 w-4 rounded bg-zinc-700 border-zinc-500 text-green-600 focus:ring-green-500" />
                    <label className="text-xs mt-2">Selecteer alles</label>
                </div>
                {filteredGallery.map((img, index) => (
                    <div
                        key={img._id}
                        draggable
                        onDragStart={e => handleDragStart(e, index)}
                        onDragOver={e => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative group aspect-square cursor-grab transition-all duration-300
                            ${draggedIndex === index ? 'opacity-50' : ''}
                            ${dropTargetIndex === index ? 'border-2 border-green-500 scale-105' : 'border-2 border-transparent'}
                            ${selectedImages.has(img._id) ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-zinc-800' : ''}
                        `}
                    >
                        <button type="button" onClick={() => setEditingImageIndex(index)} className="w-full h-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500">
                             {img.image.url ? (
                              <img src={img.image.url} alt={img.image.alt || 'Galerij afbeelding'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-center text-sm p-2">
                                <span>Afbeelding instellen</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Pencil size={32} className="text-white" />
                            </div>
                        </button>
                        <button type="button" onClick={() => setGallery(g => g.filter((_, i) => i !== index))} className="absolute top-1 right-1 z-10 text-white bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Verwijder afbeelding">
                            <Trash size={16} />
                        </button>
                         <div className="absolute top-1 left-1 z-10">
                            <input type="checkbox" checked={selectedImages.has(img._id)} onChange={() => handleToggleSelection(img._id)} className="h-4 w-4 rounded bg-zinc-900/50 border-zinc-500 text-green-600 focus:ring-green-500"/>
                        </div>
                        <div className="absolute bottom-1 right-1 z-10" title={img.published ? 'Gepubliceerd' : 'Concept'}>
                          {img.published ? <CheckCircle size={16} className="text-green-400 bg-black/50 rounded-full" /> : <Prohibit size={16} className="text-yellow-400 bg-black/50 rounded-full" />}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => { const newIndex = gallery.length; setGallery(g => [...g, { _id: `new-${Date.now()}`, image: { url: '', alt: '' }, published: false, category: '' }]); setEditingImageIndex(newIndex); }} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-green-500 transition-colors">
                    <Plus size={32} />
                    <span>Toevoegen</span>
                </button>
            </div>
        </>
    );
};

export default GalleryTab;