import React, { useState, useEffect } from 'react';
import type { PageContent } from './types';
import { pageContentData, galleryImagesData } from './content';

// Import components
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import BeforeAfter from './components/BeforeAfter';
import CtaGallery from './components/CtaGallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import ScrollToTopButton from './components/ScrollToTopButton';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    // --- Content is now loaded locally, no fetching needed ---
    setPageContent(pageContentData);
    console.log("✅ Local content loaded successfully:", pageContentData);

    // After content is loaded, update the social media meta tags dynamically.
    if (pageContentData.ogImage?.url) {
      const imageUrl = pageContentData.ogImage.url;
      document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);
      document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', imageUrl);
    }
  }, []);

  const handleOpenGallery = () => setIsGalleryOpen(true);
  const handleCloseGallery = () => setIsGalleryOpen(false);
  
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isGalleryOpen]);


  return (
    <ErrorBoundary>
      <div className="bg-zinc-950 text-white font-sans antialiased">
        <Header onOpenGallery={handleOpenGallery} content={pageContent} />
        <main>
          <Hero content={pageContent} />
          <Services content={pageContent} />
          <BeforeAfter content={pageContent} />
          <CtaGallery onOpenGallery={handleOpenGallery} content={pageContent} />
          <Contact content={pageContent} />
        </main>
        <Footer content={pageContent} />
        {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImagesData} />}
        <ScrollToTopButton />
      </div>
    </ErrorBoundary>
  );
}

export default App;