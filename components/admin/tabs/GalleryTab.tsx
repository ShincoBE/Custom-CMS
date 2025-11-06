import React from 'react';
import type { PageContent, GalleryImage } from '../../../types';
import { Plus, Pencil, Trash } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';

interface GalleryTabProps {
    content: PageContent;
    gallery: GalleryImage[];
    handleContentChange: (path: string, value: any) => void;
    setGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
    setEditingImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const GalleryTab = ({ content, gallery, handleContentChange, setGallery, setEditingImageIndex }: GalleryTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Galerij Instellingen</h2>
            <AdminInput name="galleryTitle" label="Galerij Titel" help="De titel die bovenaan in de galerij popup verschijnt." value={content.galleryTitle!} onChange={e => handleContentChange('galleryTitle', e.target.value)} required showStyler />
            <AdminTextarea name="gallerySubtitle" label="Galerij Subtitel" help="De subtitel in de galerij popup." value={content.gallerySubtitle!} onChange={e => handleContentChange('gallerySubtitle', e.target.value)} required showStyler />
            <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Galerij Afbeeldingen</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.map((img, index) => (
                    <div key={img._id} className="relative group aspect-square">
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
                    </div>
                ))}
                <button type="button" onClick={() => { const newIndex = gallery.length; setGallery(g => [...g, { _id: `new-${Date.now()}`, image: { url: '', alt: '' }}]); setEditingImageIndex(newIndex); }} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-green-500 transition-colors">
                    <Plus size={32} />
                    <span>Toevoegen</span>
                </button>
            </div>
        </>
    );
};

export default GalleryTab;
