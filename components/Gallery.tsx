import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { GalleryImage, PageContent } from '../types';
import SectionHeader from './SectionHeader';
import LazyImage from './ui/LazyImage';

interface GalleryProps {
  onClose: () => void;
  content: PageContent | null;
  images: GalleryImage[];
}

function Gallery({ onClose, content, images = [] }: GalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const isModalOpen = selectedImageIndex !== null;
  const status = images.length > 0 ? 'success' : 'error';
  
  const categories = useMemo(() => {
    const uniqueCategories = new Set(images.map(img => img.category).filter(Boolean));
    return ['all', ...Array.from(uniqueCategories)];
  }, [images]);

  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter(img => img.category === activeFilter);
  }, [images, activeFilter]);
  
  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (filteredImages.length > 0) {
      setSelectedImageIndex(prev => (prev === null ? 0 : (prev + 1) % filteredImages.length));
    }
  }, [filteredImages.length]);

  const handlePrev = useCallback(() => {
    if (filteredImages.length > 0) {
      setSelectedImageIndex(prev => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length));
    }
  }, [filteredImages.length]);
  
  // Accessibility: Focus trapping
  const trapFocus = (e: KeyboardEvent, container: HTMLElement | null) => {
    if (!container) return;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };


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
        if (e.key === 'ArrowLeft') e.preventDefault(); handlePrev();
        if (e.key === 'ArrowRight') e.preventDefault(); handleNext();
        trapFocus(e, lightboxRef.current);
      } else {
        trapFocus(e, galleryRef.current);
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
        ref={galleryRef}
        className="relative bg-zinc-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8 animate-slide-up"
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

        <div className="mb-4 text-center flex-shrink-0">
            <SectionHeader 
              title={content?.galleryTitle || "Galerij"} 
              subtitle={content?.gallerySubtitle || "Een selectie van onze voltooide projecten."} 
            />
             {categories.length > 2 && (
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === category
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {category === 'all' ? 'Alles' : category}
                  </button>
                ))}
              </div>
            )}
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {status === 'error' && (
            <div className="bg-zinc-800 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-zinc-300">Galerij kon niet geladen worden.</p>
            </div>
          )}
          {status === 'success' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer aspect-square bg-black/20"
                  onClick={() => setSelectedImageIndex(index)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedImageIndex(index); }}
                  tabIndex={0}
                  role="button"
                  aria-label={image.image.alt || `Bekijk afbeelding ${index + 1}`}
                >
                  <LazyImage
                    src={image.image.url}
                    alt={image.image.alt || ''}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && filteredImages[selectedImageIndex] && (
        <div
          ref={lightboxRef}
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
            <LazyImage
              src={filteredImages[selectedImageIndex].image.url}
              alt={filteredImages[selectedImageIndex].image.alt || ''}
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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[70] p-3 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500 transition-all disabled:opacity-50"
                aria-label="Vorige afbeelding"
                disabled={filteredImages.length <= 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[70] p-3 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-green-500 transition-all disabled:opacity-50"
                aria-label="Volgende afbeelding"
                disabled={filteredImages.length <= 1}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {filteredImages.length}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;