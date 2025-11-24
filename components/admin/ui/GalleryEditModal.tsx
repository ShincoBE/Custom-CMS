
import React, { useState, useEffect, useRef } from 'react';
import type { GalleryImage } from '../../../types';
import { UploadSimple, Spinner, Image } from 'phosphor-react';
import InputWithCounter from './InputWithCounter';
import ToggleSwitch from './ToggleSwitch.tsx';
import MediaLibraryModal from './MediaLibraryModal';
import { compressImageIfNeeded, MAX_FILE_SIZE } from '../../../utils/imageUtils';

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
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedImage(image); // Sync state if the prop changes
  }, [image]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedImage(prev => {
        if (field === 'alt') {
            return { ...prev, image: { ...prev.image, alt: value }};
        }
        return { ...prev, [field]: value };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileToUpload = await compressImageIfNeeded(file);
        
        if (fileToUpload.size > MAX_FILE_SIZE) {
            alert('Bestand is zelfs na compressie te groot. Maximaal 4.5MB toegestaan.');
            setIsUploading(false);
            return;
        }

        const newUrl = await onImageUpload(fileToUpload);
        setEditedImage(prev => ({ ...prev, image: { ...prev.image, url: newUrl } }));
      } catch (error) {
        console.error("Upload failed", error);
        alert('Upload mislukt. Probeer het opnieuw.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleLibrarySelect = (url: string) => {
      setEditedImage(prev => ({ ...prev, image: { ...prev.image, url } }));
  };

  const handleSave = () => {
    onSave(editedImage);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
      <div className="bg-zinc-800 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:shadow-2xl sm:border sm:border-zinc-700 flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-zinc-700 flex-shrink-0 flex justify-between items-center">
          <h3 id="gallery-modal-title" className="text-xl font-bold text-white">Galerij Afbeelding Bewerken</h3>
          <button onClick={onClose} className="sm:hidden text-zinc-400 hover:text-white text-2xl">&times;</button>
        </header>
        
        <main className="p-4 sm:p-6 flex-grow overflow-y-auto">
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
                        {isUploading ? 'Verwerken...' : (editedImage.image.url ? 'Wijzigen' : 'Uploaden')}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />

                    <button type="button" onClick={() => setIsLibraryOpen(true)} className="w-full mt-2 inline-flex items-center justify-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                        <Image size={16} className="mr-2" />
                        Bibliotheek
                    </button>
                </div>
                <div className="w-full sm:w-2/3">
                  <ToggleSwitch 
                    label="Gepubliceerd"
                    help="Zet aan om deze afbeelding op de live website te tonen."
                    enabled={!!editedImage.published}
                    onChange={(val) => handleFieldChange('published', val)}
                  />
                   <InputWithCounter
                    name="gallery-category"
                    label="Categorie"
                    help="Optioneel. Gebruikt om de galerij te filteren (bv. 'Tuinonderhoud', 'Schilderwerken')."
                    value={editedImage.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  />
                  <InputWithCounter
                    as="textarea"
                    name="gallery-alt-text"
                    label="Alternatieve Tekst (voor SEO)"
                    help="Beschrijf de afbeelding voor zoekmachines en gebruikers met een visuele beperking."
                    value={editedImage.image.alt || ''}
                    onChange={(e) => handleFieldChange('alt', e.target.value)}
                    maxLength={125}
                    optimalRange={[70, 120]}
                    required
                  />
                </div>
            </div>
        </main>

        <footer className="p-4 border-t border-zinc-700 flex justify-end space-x-3 flex-shrink-0 bg-zinc-800 sm:rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600">
            Annuleren
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700" disabled={!editedImage.image.url}>
            Opslaan
          </button>
        </footer>
      </div>
      
      <MediaLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onSelect={handleLibrarySelect} 
      />
    </div>
  );
};

export default GalleryEditModal;
