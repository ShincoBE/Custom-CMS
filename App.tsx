import React, { useState, useEffect } from 'react';
import { client, isSanityConfigured } from './sanity/client';
import type { PageContent } from './types';
import { urlFor } from './sanity/image';

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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (!isSanityConfigured) {
      console.warn("Sanity client is not configured. Skipping data fetch.");
      setStatus('error');
      return;
    }

    const fetchPageContent = async () => {
      setStatus('loading');
      try {
        // This is the definitive, fully expanded query.
        // It fetches the main page content AND expands all references for services and images.
        const query = `*[_type == "pageContent"][0] {
          ..., // Include all top-level fields from the pageContent document
          
          // Explicitly expand all top-level image assets to get their full data
          logo { ..., asset-> },
          heroImage { ..., asset-> },
          beforeImage { ..., asset-> },
          afterImage { ..., asset-> },
          ogImage { ..., asset-> },

          // This is the critical fix:
          // For the 'servicesList' array, follow each reference ('->')
          // and select the specific fields we need from each 'service' document.
          servicesList[]->{
              // Fix: Alias the document's '_id' to '_key' to match the 'Service' type and for use in React lists.
              "_key": _id,
              title,
              description,
              customIcon {
                  ...,
                  asset-> // Also expand the image asset within the service
              }
          }
        }`;
        
        const result: PageContent | null = await client!.fetch(query);
        
        if (result) {
          setPageContent(result);
          setStatus('success');
          console.log("✅ Sanity content loaded successfully:", result);

          // After content is loaded, update the social media meta tags dynamically.
          if (result.ogImage) {
            const imageUrl = urlFor(result.ogImage)?.width(1200).height(630).fit('crop').quality(80).url();
            if (imageUrl) {
              document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl);
              document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', imageUrl);
            }
          }
        } else {
          console.warn("No 'pageContent' document found in Sanity.");
          setStatus('error');
        }
      } catch (error) {
        console.error('Failed to fetch page content from Sanity:', error);
        setStatus('error');
      }
    };

    fetchPageContent();
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
          <Hero content={pageContent} status={status} />
          <Services content={pageContent} status={status} />
          <BeforeAfter content={pageContent} status={status} />
          <CtaGallery onOpenGallery={handleOpenGallery} content={pageContent} />
          <Contact content={pageContent} />
        </main>
        <Footer content={pageContent} />
        {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} />}
        <ScrollToTopButton />
      </div>
    </ErrorBoundary>
  );
}

export default App;