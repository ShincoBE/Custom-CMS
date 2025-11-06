import React, { useState, useEffect } from 'react';
import type { PageContent, GalleryImage, Service, SiteSettings } from '../types';
import { useAnalytics } from '../hooks/useAnalytics';

// Import components
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import BeforeAfter from '../components/BeforeAfter';
import CtaGallery from '../components/CtaGallery';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Gallery from '../components/Gallery';
import ScrollToTopButton from '../components/ScrollToTopButton';
import ErrorBoundary from '../components/ErrorBoundary';
import MaintenancePage from './MaintenancePage';

type Status = 'loading' | 'success' | 'error';

function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useAnalytics();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        
        const publishedServices = data.pageContent.servicesList?.filter((service: Service) => service.published) || [];
        const publishedContent = { ...data.pageContent, servicesList: publishedServices };
        
        const publishedGalleryImages = data.galleryImages?.filter((image: GalleryImage) => image.published) || [];

        setPageContent(publishedContent);
        setGalleryImages(publishedGalleryImages);
        setSettings(data.settings);
        setStatus('success');

        if (data.pageContent.ogImage?.url) {
          const imageUrl = data.pageContent.ogImage.url;
          document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);
          document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', imageUrl);
        }

      } catch (error) {
        console.error("Failed to fetch page content:", error);
        setStatus('error');
      }
    };
    
    // Check if user is an admin to bypass maintenance mode
    const checkAuth = async () => {
       try {
        const res = await fetch('/api/verify-auth');
        setIsAdmin(res.ok);
       } catch {
        setIsAdmin(false);
       }
    };

    Promise.all([fetchContent(), checkAuth()]);

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

  if (settings?.maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <ErrorBoundary>
      <div className="bg-zinc-950 text-white font-sans antialiased">
        <Header onOpenGallery={handleOpenGallery} content={pageContent} status={status} />
        <main>
          <Hero content={pageContent} status={status} />
          <Services content={pageContent} status={status} />
          <BeforeAfter content={pageContent} status={status} />
          <CtaGallery onOpenGallery={handleOpenGallery} content={pageContent} />
          <Contact content={pageContent} />
        </main>
        <Footer content={pageContent} />
        {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImages} />}
        <ScrollToTopButton />
      </div>
    </ErrorBoundary>
  );
}

export default HomePage;