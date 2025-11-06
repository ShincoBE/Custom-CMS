import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PageContent, GalleryImage } from '../types';
import { Spinner, CheckCircle, SignOut } from 'phosphor-react';

// Import new components
import GeneralTab from '../components/admin/tabs/GeneralTab';
import NavigationTab from '../components/admin/tabs/NavigationTab';
import HeroTab from '../components/admin/tabs/HeroTab';
import ServicesTab from '../components/admin/tabs/ServicesTab';
import BeforeAfterTab from '../components/admin/tabs/BeforeAfterTab';
import CtaGalleryTab from '../components/admin/tabs/CtaGalleryTab';
import GalleryTab from '../components/admin/tabs/GalleryTab';
import ContactTab from '../components/admin/tabs/ContactTab';
import UserManagementTab from '../components/admin/tabs/UserManagementTab';
import GalleryEditModal from '../components/admin/ui/GalleryEditModal';
import NotificationPopup from '../components/admin/ui/NotificationPopup';


function AdminDashboard() {
  const { logout } = useAuth();
  const [content, setContent] = useState<PageContent | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState('algemeen');
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  const tabs = [
    { id: 'algemeen', label: 'Algemeen' },
    { id: 'navigatie', label: 'Navigatie' },
    { id: 'hero', label: 'Hero' },
    { id: 'diensten', label: 'Diensten' },
    { id: 'voor-na', label: 'Voor & Na' },
    { id: 'galerij-cta', label: 'Galerij CTA' },
    { id: 'galerij', label: 'Galerij' },
    { id: 'contact', label: 'Contact' },
    { id: 'gebruikers', label: 'Gebruikers' },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('Kon content niet ophalen.');
        const data = await response.json();
        setContent(data.pageContent);
        setGallery(data.galleryImages);
        setOriginalContent(JSON.stringify({ pageContent: data.pageContent, galleryImages: data.galleryImages }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const hasChanges = useMemo(() => {
    if (!content) return false;
    return JSON.stringify({ pageContent: content, galleryImages: gallery }) !== originalContent;
  }, [content, gallery, originalContent]);
  
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleContentChange = useCallback((path: string, value: any) => {
    setContent(prev => {
        if (!prev) return null;
        const newContent = JSON.parse(JSON.stringify(prev));
        const keys = path.split('.');
        let current = newContent;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newContent;
    });
  }, []);

  const handleImageUpload = async (file: File, path: string) => {
      const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-vercel-filename': file.name },
          body: file,
      });
      if (!response.ok) {
          throw new Error('Upload mislukt');
      }
      const blob = await response.json();
      handleContentChange(path, blob.url);
  };
  
  const handleModalImageUpload = async (file: File) => {
      const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-vercel-filename': file.name },
          body: file,
      });
      if (!response.ok) throw new Error('Upload mislukt');
      const blob = await response.json();
      return blob.url;
  };

  const handleSave = async () => {
      if (!content) return;
      setIsSaving(true);
      setError(null);
      
      if (!content.logo?.url || !content.heroImage?.url || !content.beforeImage?.url || !content.afterImage?.url) {
          showNotification('error', "Zorg ervoor dat alle verplichte afbeeldingen (Logo, Hero, Voor & Na) zijn ingesteld.");
          setIsSaving(false);
          return;
      }
      
      try {
          const response = await fetch('/api/update-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pageContent: content, galleryImages: gallery.filter(img => img.image.url) }),
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Opslaan mislukt.');
          }
          const data = await response.json();
          const validGallery = gallery.filter(img => img.image.url);
          setGallery(validGallery);
          setOriginalContent(JSON.stringify({ pageContent: content, galleryImages: validGallery }));
          showNotification('success', data.message);
      } catch (err: any) {
          showNotification('error', err.message);
      } finally {
          setIsSaving(false);
      }
  };

  const handleCloseModal = () => {
      if (editingImageIndex !== null) {
          const image = gallery[editingImageIndex];
          if (image && image._id.startsWith('new-') && !image.image.url) {
              setGallery(g => g.filter((_, i) => i !== editingImageIndex));
          }
      }
      setEditingImageIndex(null);
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center"><Spinner size={32} className="animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center text-red-400">{error}</div>;
  if (!content) return null;

  const renderTabContent = () => {
    switch(activeTab) {
      case 'algemeen': return <GeneralTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'navigatie': return <NavigationTab content={content} handleContentChange={handleContentChange} />;
      case 'hero': return <HeroTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'diensten': return <ServicesTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'voor-na': return <BeforeAfterTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'galerij-cta': return <CtaGalleryTab content={content} handleContentChange={handleContentChange} />;
      case 'galerij': return <GalleryTab content={content} gallery={gallery} handleContentChange={handleContentChange} setGallery={setGallery} setEditingImageIndex={setEditingImageIndex} />;
      case 'contact': return <ContactTab content={content} handleContentChange={handleContentChange} />;
      case 'gebruikers': return <UserManagementTab showNotification={showNotification} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-20 bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Content Management</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 disabled:bg-zinc-600 disabled:cursor-not-allowed"
              >
                {isSaving ? <Spinner size={20} className="animate-spin mr-2"/> : <CheckCircle size={20} className="mr-2"/>}
                {isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
              </button>
              <button
                onClick={logout}
                title="Uitloggen"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors"
              >
                  <SignOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="border-b border-zinc-700 mb-6">
              <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                  {tabs.map(tab => (
                      <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                              activeTab === tab.id
                                  ? 'border-green-500 text-green-500'
                                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
                          }`}
                          aria-current={activeTab === tab.id ? 'page' : undefined}
                      >
                          {tab.label}
                      </button>
                  ))}
              </nav>
          </div>
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              {renderTabContent()}
          </div>
        </div>
      </main>
      
      {editingImageIndex !== null && gallery[editingImageIndex] && (
        <GalleryEditModal
            isOpen={editingImageIndex !== null}
            onClose={handleCloseModal}
            image={gallery[editingImageIndex]}
            onSave={(updatedImage) => {
                setGallery(g => g.map((item, i) => (i === editingImageIndex ? updatedImage : item)));
                setEditingImageIndex(null);
            }}
            onImageUpload={handleModalImageUpload}
        />
      )}

      <NotificationPopup notification={notification} />

    </div>
  );
}

export default AdminDashboard;
