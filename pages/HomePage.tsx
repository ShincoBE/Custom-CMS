
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { PageContent, GalleryImage, Service, SiteSettings, Testimonial, BlogPost } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';

// Import components
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import BeforeAfter from '@/components/BeforeAfter';
import CtaGallery from '@/components/CtaGallery';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import ErrorBoundary from '@/components/ErrorBoundary';
import MaintenancePage from '@/pages/MaintenancePage';
import CookieConsent from '@/components/CookieConsent';
import Testimonials from '@/components/Testimonials';
import StructuredData from '@/components/StructuredData';

type Status = 'loading' | 'success' | 'error';

function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useAnalytics();
  
  // Effect to handle scrolling to anchor links when navigating from another page.
  useEffect(() => {
    const scrollToAnchor = () => {
      if (location.hash) {
        const id = location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = id === 'home' ? 0 : 64; // Match header height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    };

    // Only scroll after content has successfully loaded to ensure sections exist.
    // A small timeout allows the browser to paint the layout first.
    if (status === 'success') {
      const timer = setTimeout(scrollToAnchor, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash, status]);


  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        
        const publishedServices = data.pageContent.servicesList?.filter((service: Service) => service.published) || [];
        const publishedTestimonials = data.pageContent.testimonials?.filter((testimonial: Testimonial) => testimonial.published) || [];
        const publishedContent = { ...data.pageContent, servicesList: publishedServices, testimonials: publishedTestimonials };
        
        const publishedGalleryImages = data.galleryImages?.filter((image: GalleryImage) => image.published) || [];
        const publishedBlogPosts = data.blogPosts?.filter((post: BlogPost) => post.published) || [];


        setPageContent(publishedContent);
        setGalleryImages(publishedGalleryImages);
        setBlogPosts(publishedBlogPosts);
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
        <StructuredData pageContent={pageContent} />
        <Header onOpenGallery={handleOpenGallery} content={pageContent} settings={settings} status={status} />
        <main>
          <Hero content={pageContent} status={status} />
          <Services content={pageContent} status={status} />
          <BeforeAfter content={pageContent} status={status} />
          {settings?.showTestimonials && (
            <Testimonials content={pageContent} settings={settings} />
          )}
          <CtaGallery onOpenGallery={handleOpenGallery} content={pageContent} />
          <Contact content={pageContent} />
        </main>
        <Footer content={pageContent} />
        {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImages} />}
        <ScrollToTopButton />
        <CookieConsent />
      </div>
    </ErrorBoundary>
  );
}

export default HomePage;
