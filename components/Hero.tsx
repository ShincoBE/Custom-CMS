import React, { useState, useEffect } from 'react';
import { urlFor } from '../sanity/image';
import type { PageContent } from '../types';

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

const FALLBACK_CONTENT = {
  heroTitle: 'Andries Service+',
  heroTagline: 'Uw Tuin, Onze Zorg. Professioneel tuinonderhoud voor een onberispelijke buitenruimte.',
  heroButtonText: 'Vraag een Offerte Aan',
};

const SkeletonLoader = () => (
  <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden bg-zinc-900">
    <div className="relative z-10 p-4 w-full max-w-4xl animate-pulse">
      <div className="h-10 sm:h-12 md:h-20 bg-zinc-800 rounded-md w-3/4 mx-auto mb-4"></div>
      <div className="h-6 md:h-8 bg-zinc-800 rounded-md w-full max-w-2xl mx-auto mb-8"></div>
      <div className="h-12 w-56 bg-zinc-800 rounded-full mx-auto"></div>
    </div>
  </section>
);

interface HeroProps {
  content: PageContent | null;
  status: 'loading' | 'success' | 'error';
}

function Hero({ content, status }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'loading') {
    return <SkeletonLoader />;
  }

  if (status === 'error') {
    return (
      <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden bg-zinc-900">
         <div className="bg-zinc-800 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 S0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <p className="text-zinc-300">De content van de hoofdpagina kon niet geladen worden.</p>
            <p className="text-xs text-zinc-400 mt-1">Controleer of de pagina content is gepubliceerd in de Sanity CMS.</p>
          </div>
      </section>
    );
  }
    
  const heroImage = content?.heroImage;
  const backgroundImageUrl = heroImage
    ? urlFor(heroImage)?.width(1920).quality(80).format('webp').url()
    : 'https://i.postimg.cc/431ktwwb/Hero.jpg';
    
  const heroTitle = content?.heroTitle || FALLBACK_CONTENT.heroTitle;
  const heroTagline = content?.heroTagline || FALLBACK_CONTENT.heroTagline;
  const heroButtonText = content?.heroButtonText || FALLBACK_CONTENT.heroButtonText;

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden" role="banner" aria-label="Hoofdpagina introductie">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
        role="img"
        aria-label={heroImage?.alt || 'Een prachtig onderhouden tuin als achtergrond'}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
      <div className="relative z-10 p-4">
        <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          dangerouslySetInnerHTML={{ __html: heroTitle.replace('Service+', '<span class="text-green-500">Service+</span>') }}
        />
        <p className={`text-lg md:text-2xl max-w-2xl mx-auto mb-8 text-gray-300 transition-all duration-700 ease-out delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {heroTagline}
        </p>
        <a 
          href="#contact" 
          onClick={handleSmoothScroll}
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 duration-300 ease-out delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {heroButtonText}
        </a>
      </div>
    </section>
  );
}

export default Hero;