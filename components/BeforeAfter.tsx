import React, { useState, useRef, useCallback, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import { urlFor } from '../sanity/image';
import type { PageContent } from '../types';

// Helper to generate a responsive srcset for Sanity images
const generateSrcSet = (image: PageContent['beforeImage'], format: 'webp' = 'webp', sizes: number[] = [600, 1024, 1280]) => {
  if (!image) return '';
  return sizes
    .map(size => `${urlFor(image)?.width(size).format(format).quality(80).url()} ${size}w`)
    .join(', ');
};

const SkeletonLoader = () => (
    <div className="relative w-full max-w-4xl mx-auto aspect-[1024/683]">
        <div className="w-full h-full bg-zinc-800 rounded-lg shadow-2xl animate-pulse"></div>
    </div>
);

interface BeforeAfterProps {
  content: PageContent | null;
  status: 'loading' | 'success' | 'error';
}

const BeforeAfter = ({ content, status: propStatus }: BeforeAfterProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });
  
  const beforeImage = content?.beforeImage;
  const afterImage = content?.afterImage;

  let status: 'loading' | 'success' | 'error' = propStatus;
  if (propStatus === 'success' && (!beforeImage || !afterImage)) {
    status = 'error'; 
  }

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    let newPosition = (x / width) * 100;
    
    newPosition = Math.max(0, Math.min(100, newPosition));
    
    setSliderPosition(newPosition);
  }, []);

  return (
    <section id="before-after" className="py-20 bg-zinc-900 overflow-hidden">
      <div 
        ref={sectionRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <SectionHeader
          title={content?.beforeAfterTitle || "Voor & Na"}
          subtitle={content?.beforeAfterSubtitle || "Zie het verschil dat professioneel onderhoud maakt."}
        />
        <div className="relative w-full max-w-4xl mx-auto aspect-[1024/683]">
          {status === 'loading' && <SkeletonLoader />}
          {status === 'error' && (
            <div className="w-full h-full bg-zinc-800 rounded-lg shadow-2xl flex flex-col items-center justify-center text-center p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-zinc-300">Afbeeldingen konden niet geladen worden.</p>
              <p className="text-xs text-zinc-400 mt-1">Controleer of de Voor & Na afbeeldingen zijn gepubliceerd in de Sanity CMS.</p>
            </div>
          )}
          {status === 'success' && beforeImage && afterImage && (
            <div 
              ref={containerRef}
              className="absolute inset-0 overflow-hidden rounded-lg shadow-2xl select-none"
              onMouseUp={() => isDragging.current = false}
              onMouseLeave={() => isDragging.current = false}
              onTouchEnd={() => isDragging.current = false}
              onMouseMove={(e) => { if (isDragging.current) handleMove(e.clientX) }}
              onTouchMove={(e) => { if (isDragging.current) handleMove(e.touches[0].clientX) }}
            >
              <picture>
                <source type="image/webp" srcSet={generateSrcSet(afterImage, 'webp')} sizes="(max-width: 1024px) 100vw, 1024px" />
                <img
                  src={urlFor(afterImage)?.width(1024).url()}
                  alt={afterImage.alt || "Tuin na onderhoud"}
                  className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                  draggable="false"
                />
              </picture>

              <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <picture>
                  <source type="image/webp" srcSet={generateSrcSet(beforeImage, 'webp')} sizes="(max-width: 1024px) 100vw, 1024px" />
                  <img
                    src={urlFor(beforeImage)?.width(1024).url()}
                    alt={beforeImage.alt || "Tuin voor onderhoud"}
                    className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                    draggable="false"
                  />
                </picture>
              </div>
              <div
                className="absolute top-0 bottom-0 -translate-x-1/2 w-12 h-full cursor-ew-resize group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; }}
                onTouchStart={() => { isDragging.current = true; }}
              >
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-white/50 backdrop-blur-sm group-hover:bg-green-500 transition-colors duration-200"></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm group-hover:bg-green-500 shadow-lg flex items-center justify-center transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;