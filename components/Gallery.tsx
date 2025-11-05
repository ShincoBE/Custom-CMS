import React, { useState, useCallback, useEffect } from 'react';
import type { GalleryImage, PageContent } from '../types';
import SectionHeader from './SectionHeader';

interface GalleryProps {
  onClose: () => void;
  content: PageContent | null;
  images: GalleryImage[];
}

function Gallery({ onClose, content, images = [] }: GalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const isModalOpen = selectedImageIndex !== null;
  const status = images.length > 0 ? 'success' : 'error'; // Simplified status based on passed images
  
  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (images.length > 0) {
      setSelectedImageIndex(prev => (prev === null ? 0 : (prev + 1) % images.length));
    }
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length > 0) {
      setSelectedImageIndex(prev => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
    }
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          handleCloseModal();
        } else {
          onClose();
        }
      }
      if (isModalOpen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, onClose, handleCloseModal, handlePrev, handleNext]);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Fotogalerij"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
          aria-label="Sluit galerij"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8 text-center">
            <SectionHeader 
              title={content?.galleryTitle || "Galerij"} 
              subtitle={content?.gallerySubtitle || "Een selectie van onze voltooide projecten."} 
            />
        </div>
        
        {status === 'error' && (
           <div className="bg-zinc-800 border border-red-500/30 rounded-lg p-6 text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <p className="text-zinc-300">Galerij kon niet geladen worden.</p>
            <p className="text-xs text-zinc-400 mt-1">Controleer of de afbeeldingen zijn toegevoegd in content.ts.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => {
              const thumbUrl = image.image.url;
              return (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer aspect-square bg-black/20"
                  onClick={() => setSelectedImageIndex(index)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedImageIndex(index); }}
                  tabIndex={0}
                  role="button"
                  aria-label={image.image.alt || `Bekijk afbeelding ${index + 1}`}
                >
                  <img
                    src={thumbUrl}
                    alt={image.image.alt || ''}
                    loading="lazy"
                    width="400"
                    height="400"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && images[selectedImageIndex] && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label="Afbeelding weergave"
        >
          <div
            className={`relative transition-all duration-300 ${isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex].image.url}
              alt={images[selectedImageIndex].image.alt || ''}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            
            <button
                onClick={handleCloseModal}
                className="absolute -top-4 -right-4 z-[70] p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500 transition-all"
                aria-label="Sluit weergave"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <button
                onClick={handlePrev}
                className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 z-[70] p-3 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500 transition-all disabled:opacity-50"
                aria-label="Vorige afbeelding"
                disabled={images.length <= 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <button
                onClick={handleNext}
                className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 z-[70] p-3 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500 transition-all disabled:opacity-50"
                aria-label="Volgende afbeelding"
                disabled={images.length <= 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;