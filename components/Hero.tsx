import React, { useState, useEffect } from 'react';
import type { PageContent } from '../types';
import LazyImage from './ui/LazyImage';
import { trackEvent } from '../hooks/useAnalytics';

type Status = 'loading' | 'success' | 'error';

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (!href || href === '#') return;
  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    const headerOffset = 64;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

const SkeletonLoader = () => (
  <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden bg-zinc-900">
    <div className="absolute top-0 left-0 w-full h-full bg-zinc-800 animate-pulse"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
    <div className="relative z-10 p-4 w-full max-w-4xl">
      <div className="h-10 sm:h-12 md:h-20 bg-zinc-700 rounded-md w-3/4 mx-auto mb-4"></div>
      <div className="h-6 md:h-8 bg-zinc-700 rounded-md w-full max-w-2xl mx-auto mb-8"></div>
      <div className="h-12 w-56 bg-zinc-700 rounded-full mx-auto"></div>
    </div>
  </section>
);

interface HeroProps {
  content: PageContent | null;
  status: Status;
}

function Hero({ content, status }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Animate in when component has successfully loaded data
    if (status === 'success') {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'loading') {
    return <SkeletonLoader />;
  }
  
  if (status === 'error' || !content) {
     return (
      <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden bg-zinc-900">
          <div className="relative z-10 p-4 bg-zinc-800 border border-red-500/30 rounded-lg">
            <h1 className="text-2xl font-bold text-zinc-200">Kon content niet laden</h1>
            <p className="text-zinc-400 mt-2">Er is een fout opgetreden. Probeer de pagina te vernieuwen.</p>
          </div>
      </section>
     )
  }
    
  const heroImage = content.heroImage;
  const backgroundImageUrl = heroImage?.url || '';
    
  const heroTitle = content.heroTitle || '';
  const heroTagline = content.heroTagline || '';
  const heroButtonText = content.heroButtonText || '';

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden" role="banner" aria-label="Hoofdpagina introductie">
      <LazyImage
        src={backgroundImageUrl}
        alt={heroImage?.alt || 'Een prachtig onderhouden tuin als achtergrond'}
        className="absolute top-0 left-0 w-full h-full object-cover"
        isBackground={true}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
      <div className="relative z-10 p-4">
        <h1 className={`text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          dangerouslySetInnerHTML={{ __html: heroTitle }}
        />
        <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-300 transition-all duration-700 ease-out delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           dangerouslySetInnerHTML={{ __html: heroTagline }}
        />
        <a 
          href="#contact" 
          onClick={(e) => {
            handleSmoothScroll(e);
            trackEvent('Click', 'Hero CTA');
          }}
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 duration-300 ease-out delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {heroButtonText}
        </a>
      </div>
    </section>
  );
}

export default Hero;