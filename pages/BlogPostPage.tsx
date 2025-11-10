import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContent, BlogPost, GalleryImage, SiteSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import { Spinner, Calendar } from 'phosphor-react';
import LazyImage from '@/components/ui/LazyImage';
import StructuredData from '@/components/StructuredData';
import { useAnalytics } from '@/hooks/useAnalytics';
import MaintenancePage from '@/pages/MaintenancePage';
import CookieConsent from '@/components/CookieConsent';

type Status = 'loading' | 'success' | 'error' | 'notfound';

const BlogPostPage = () => {
    const { slug } = useParams();
    const [status, setStatus] = useState<Status>('loading');
    const [post, setPost] = useState<BlogPost | null>(null);
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
                if (!response.ok) throw new Error('API error');
                const data = await response.json();

                const blogEnabled = data.settings?.showBlog;
                const userIsAdmin = await (async () => {
                    try {
                        const res = await fetch('/api/verify-auth');
                        return res.ok;
                    } catch { return false; }
                })();

                setIsAdmin(userIsAdmin);
                
                // Fetch all data first to avoid UI flicker
                setPageContent(data.pageContent);
                setGalleryImages(data.galleryImages?.filter((img: GalleryImage) => img.published) || []);
                setSettings(data.settings);
                
                // Then check for access and content existence
                if (!blogEnabled && !userIsAdmin) {
                    setStatus('notfound');
                    return;
                }
                
                const currentPost = data.blogPosts?.find((p: BlogPost) => p.slug === slug && (p.published || userIsAdmin));
                if (!currentPost) {
                    setStatus('notfound');
                    return;
                }

                setPost(currentPost);
                setStatus('success');
            } catch (error) {
                console.error("Failed to fetch blog post:", error);
                setStatus('error');
            }
        };
        fetchContent();
    }, [slug]);

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
    
    // --- END: Page State Rendering Logic ---
    
    const renderContent = () => {
        switch (status) {
            case 'error':
                return <div className="text-center text-red-400 p-8 min-h-[60vh] flex items-center justify-center">Kon de post niet laden. Probeer het later opnieuw.</div>;
            case 'notfound':
                return (
                    <div className="text-center p-8 min-h-[60vh] flex flex-col justify-center items-center">
                        <h1 className="text-4xl font-bold mb-4">Pagina niet gevonden</h1>
                        <p className="text-zinc-400 mb-6">Het project of artikel dat u zoekt bestaat niet of is niet langer beschikbaar.</p>
                        <Link to="/blog" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                            Terug naar overzicht
                        </Link>
                    </div>
                );
            case 'success':
                return post && (
                    <article>
                         {post.mainImage && (
                            <header className="relative h-[50vh] max-h-[500px] overflow-hidden">
                                <LazyImage
                                    src={post.mainImage.url}
                                    alt={post.mainImage.alt || ''}
                                    className="w-full h-full object-cover"
                                    isBackground
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">{post.title}</h1>
                                        <div className="mt-4 flex items-center justify-center space-x-2 text-zinc-300">
                                            <Calendar size={16} />
                                            <span>{new Date(post.publishedAt).toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </header>
                        )}
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                            <div
                                className="prose prose-invert prose-lg max-w-none text-zinc-300"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </article>
                );
        }
    }

    return (
        <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(10,40,20,0.3),_transparent_40%)]">
            <StructuredData pageContent={pageContent} blogPost={post} />
            {/* Fix: Map the component's 'notfound' status to a status the Header component expects ('error'). */}
            <Header onOpenGallery={handleOpenGallery} content={pageContent} settings={settings} status={status === 'loading' ? 'loading' : status === 'success' ? 'success' : 'error'} />
            <main className="flex-grow pt-16">
               {renderContent()}
            </main>
            <Footer content={pageContent} />
            {isGalleryOpen && <Gallery onClose={handleCloseGallery} content={pageContent} images={galleryImages} />}
            <CookieConsent />
        </div>
    );
};

export default BlogPostPage;