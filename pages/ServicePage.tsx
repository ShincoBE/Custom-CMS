import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PageContent, GalleryImage, Service, SiteSettings } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';

// Import components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import ErrorBoundary from '@/components/ErrorBoundary';
import MaintenancePage from '@/pages/MaintenancePage';
import { Spinner } from 'phosphor-react';
import CookieConsent from '@/components/CookieConsent';
import StructuredData from '@/components/StructuredData';


type Status = 'loading' | 'success' | 'error' | 'notfound';

function ServicePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { slug } = useParams();

  useAnalytics();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        
        const publishedServices = data.pageContent.servicesList?.filter((s: Service) => s.published) || [];
        const currentService = publishedServices.find((s: Service) => s.slug === slug);

        if (!currentService) {
            setStatus('notfound');
            return;
        }
        
        const publishedGalleryImages = data.galleryImages?.filter((image: GalleryImage) => image.published) || [];
        
        setPageContent(data.pageContent);
        setGalleryImages(publishedGalleryImages);
        setSettings(data.settings);
        setService(currentService);
        setStatus('success');

      } catch (error) {
        console.error("Failed to fetch page content:", error);
        setStatus('error');
      }
    };
    
    const checkAuth = async () => {
       try {
        const res = await fetch('/api/verify-auth');
        setIsAdmin(res.ok);
       } catch { setIsAdmin(false); }
    };

    Promise.all([fetchContent(), checkAuth()]);
  }, [slug]);

  const handleOpenGallery = () => setIsGalleryOpen(true);
  const handleCloseGallery = () => setIsGalleryOpen(false);
  
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isGalleryOpen]);

  if (settings?.maintenanceMode && !isAdmin) return <MaintenancePage />;
  
  const renderContent = () => {
      switch (status) {
          case 'loading':
              return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size={48} className="animate-spin text-green-500" /></div>;
          case 'error':
              return <div className="text-center text-red-400 p-8">Kon de service niet laden. Probeer het later opnieuw.</div>;
          case 'notfound':
              return (
                <div className="text-center p-8 min-h-[60vh] flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-bold mb-4">Pagina niet gevonden</h1>
                    <p className="text-zinc-400 mb-6">De dienst die u zoekt bestaat niet of is niet langer beschikbaar.</p>
                    <Link to="/" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                        Terug naar Home
                    </Link>
                </div>
              );
          case 'success':
              return service && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StructuredData pageContent={pageContent} service={service} />
                    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl my-12 sm:my-16 overflow-hidden">
                        <div className="p-6 sm:p-10 lg:p-12">
                            <header className="text-center mb-10">
                                {service.customIcon?.url && (
                                    <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-900/50 border border-green-700/50 mb-6 mx-auto transition-transform duration-300 hover:scale-110">
                                        <img 
                                            src={service.customIcon.url} 
                                            alt={service.customIcon.alt || `Icoon voor ${service.title}`} 
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                )}
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent pb-2"
                                    dangerouslySetInnerHTML={{ __html: service.title }}
                                />
                                <div className="w-24 h-1 bg-green-600 mx-auto mt-4 rounded"></div>
                            </header>
                            <article 
                                className="prose prose-invert prose-lg max-w-none text-zinc-300"
                                dangerouslySetInnerHTML={{ __html: service.pageContent || service.description }}
                            />
                        </div>
                    </div>
                </div>
              );
      }
  };

  return (
    <ErrorBoundary>
      <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(10,40,20,0.3),_transparent_40%)]">
        <Header onOpenGallery={handleOpenGallery} content={pageContent} settings={settings} status={status === 'loading' ? 'loading' : 'success'} />
        <main className="flex-grow pt-16">
          {renderContent()}
        </main>
        <Footer content={pageContent} />
        {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImages} />}
        <ScrollToTopButton />
        <CookieConsent />
      </div>
    </ErrorBoundary>
  );
}

export default ServicePage;