import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContent, BlogPost, GalleryImage, SiteSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import BlogCard from '@/components/BlogCard';
import SectionHeader from '@/components/SectionHeader';
import { Spinner } from 'phosphor-react';
import MaintenancePage from '@/pages/MaintenancePage';
import CookieConsent from '@/components/CookieConsent';
import { useAnalytics } from '@/hooks/useAnalytics';

type Status = 'loading' | 'success' | 'error';

const BlogListPage = () => {
    const [status, setStatus] = useState<Status>('loading');
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useAnalytics();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/content');
                if (!response.ok) throw new Error('API error');
                const data = await response.json();

                setPageContent(data.pageContent);
                setBlogPosts(data.blogPosts?.filter((p: BlogPost) => p.published) || []);
                setGalleryImages(data.galleryImages?.filter((img: GalleryImage) => img.published) || []);
                setSettings(data.settings);
                setStatus('success');
            } catch (error) {
                console.error("Failed to fetch blog posts:", error);
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

    }, []);

    const handleOpenGallery = () => setIsGalleryOpen(true);
    const handleCloseGallery = () => setIsGalleryOpen(false);
    
    // --- START: Page State Rendering Logic ---

    if (status === 'loading') {
        return (
            <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950">
                <Header onOpenGallery={handleOpenGallery} content={null} settings={null} status="loading" />
                <main className="flex-grow pt-16 flex justify-center items-center">
                    <Spinner size={48} className="animate-spin text-green-500" />
                </main>
                <Footer content={null} />
            </div>
        );
    }
    
    if (settings?.maintenanceMode && !isAdmin) return <MaintenancePage />;
    
    if (status === 'success' && !settings?.showBlog && !isAdmin) {
         return (
            <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950">
                 <Header onOpenGallery={handleOpenGallery} content={pageContent} settings={settings} status={'success'} />
                 <main className="flex-grow pt-16 flex flex-col items-center justify-center text-center p-4">
                     <h1 className="text-4xl font-bold">Pagina Niet Gevonden</h1>
                     <p className="text-zinc-400 mt-2">Deze pagina is momenteel niet beschikbaar.</p>
                     <Link to="/" className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                        Terug naar Home
                     </Link>
                 </main>
                 <Footer content={pageContent} />
                 <CookieConsent />
            </div>
         );
    }
    // --- END: Page State Rendering Logic ---

    
    return (
        <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(10,40,20,0.3),_transparent_40%)]">
            <Header onOpenGallery={handleOpenGallery} content={pageContent} settings={settings} status={status} />
            <main className="flex-grow pt-16">
                <div className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader 
                            title={pageContent?.blogTitle || "Onze Projecten & Verhalen"}
                            subtitle={pageContent?.blogSubtitle || "Een kijkje in onze recente werkzaamheden, tips en inzichten."}
                        />

                        {status === 'error' && <p className="text-center text-red-400 mt-12">Kon de blogposts niet laden.</p>}
                        {status === 'success' && (
                             blogPosts.length > 0 ? (
                                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                                    {blogPosts.map(post => <BlogCard key={post._id} post={post} />)}
                                </div>
                             ) : (
                                <p className="text-center text-zinc-400 mt-12">Er zijn nog geen projecten of blogposts gepubliceerd.</p>
                             )
                        )}
                    </div>
                </div>
            </main>
            <Footer content={pageContent} />
            {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImages} />}
             <CookieConsent />
        </div>
    );
};

export default BlogListPage;