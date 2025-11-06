import React, { useState, useEffect, useRef } from 'react';
import type { GalleryImage } from '../../../types';
import { UploadSimple, Spinner } from 'phosphor-react';
import AdminTextarea from './AdminTextarea';

interface GalleryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GalleryImage;
  onSave: (image: GalleryImage) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const GalleryEditModal = ({ isOpen, onClose, image, onSave, onImageUpload }: GalleryEditModalProps) => {
  const [editedImage, setEditedImage] = useState(image);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedImage(image); // Sync state if the prop changes
  }, [image]);

  if (!isOpen) return null;

  const handleAltChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedImage(prev => ({ ...prev, image: { ...prev.image, alt: e.target.value } }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const newUrl = await onImageUpload(file);
        setEditedImage(prev => ({ ...prev, image: { ...prev.image, url: newUrl } }));
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    onSave(editedImage);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
      <div className="bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 border border-zinc-700 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 id="gallery-modal-title" className="text-xl font-bold mb-4 text-white">Galerij Afbeelding Bewerken</h3>
        <div className="flex flex-col sm:flex-row items-start sm:space-x-6">
            <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                {editedImage.image.url ? (
                    <img src={editedImage.image.url} alt={editedImage.image.alt || 'Preview'} className="w-full aspect-square object-cover rounded-md bg-zinc-700" />
                ) : (
                    <div className="w-full aspect-square bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 text-center p-2">
                        Upload een afbeelding
                    </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full mt-2 inline-flex items-center justify-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">
                    {isUploading ? <Spinner size={16} className="animate-spin mr-2" /> : <UploadSimple size={16} className="mr-2" />}
                    {isUploading ? 'Uploaden...' : (editedImage.image.url ? 'Wijzigen' : 'Uploaden')}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
            </div>
            <div className="w-full sm:w-2/3">
              <AdminTextarea
                name="gallery-alt-text"
                label="Alternatieve Tekst (voor SEO)"
                help="Beschrijf de afbeelding voor zoekmachines en gebruikers met een visuele beperking."
                value={editedImage.image.alt || ''}
                onChange={handleAltChange}
              />
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600">
            Annuleren
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700" disabled={!editedImage.image.url}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryEditModal;
