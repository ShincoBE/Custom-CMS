import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import type { PageContent } from '../types';
import SectionHeader from './SectionHeader';
import { trackEvent } from '../hooks/useAnalytics';

interface CtaGalleryProps {
  onOpenGallery: () => void;
  content: PageContent | null;
}

function CtaGallery({ onOpenGallery, content }: CtaGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });

  return (
    <section 
      ref={sectionRef}
      className={`bg-zinc-950 py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      aria-label="Galerij Oproep tot Actie"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeader
          title={content?.servicesCtaTitle || 'Bekijk Ons Werk'}
          subtitle={content?.servicesCtaSubtitle || 'Een foto zegt meer dan duizend woorden. Ontdek onze projecten in de galerij.'}
        />
        <button
          onClick={() => {
            onOpenGallery();
            trackEvent('Click', 'CTA Gallery Button');
          }}
          className="group inline-flex items-center justify-center py-4 px-10 border border-transparent shadow-sm text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 -ml-1 transition-transform duration-300 group-hover:rotate-[-10deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {content?.servicesCtaButtonText || 'Open Galerij'}
        </button>
      </div>
    </section>
  );
}

export default CtaGallery;