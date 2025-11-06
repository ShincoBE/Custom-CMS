import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PageContent, GalleryImage } from '../types';
import { Spinner, CheckCircle, SignOut, FloppyDisk, ArrowSquareOut, Gear } from 'phosphor-react';

// Import tabs
import DashboardTab from '../components/admin/tabs/DashboardTab';
import NavigationTab from '../components/admin/tabs/NavigationTab';
import HeroTab from '../components/admin/tabs/HeroTab';
import ServicesTab from '../components/admin/tabs/ServicesTab';
import BeforeAfterTab from '../components/admin/tabs/BeforeAfterTab';
import CtaGalleryTab from '../components/admin/tabs/CtaGalleryTab';
import GalleryTab from '../components/admin/tabs/GalleryTab';
import ContactTab from '../components/admin/tabs/ContactTab';
import SettingsTab from '../components/admin/tabs/SettingsTab';
import UserManagementTab from '../components/admin/tabs/UserManagementTab';
import HistoryTab from '../components/admin/tabs/HistoryTab';
import HelpTab from '../components/admin/tabs/HelpTab';

// Import UI components
import GalleryEditModal from '../components/admin/ui/GalleryEditModal';
import NotificationPopup from '../components/admin/ui/NotificationPopup';
import ConfirmationModal from '../components/admin/ui/ConfirmationModal';
import AdminDropdownMenu from '../components/admin/ui/AdminDropdownMenu';


function AdminDashboard() {
  const { user, logout } = useAuth();
  const [content, setContent] = useState<PageContent | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // --- START: Tab Definitions & Role-Based Access ---
  const userRole = user?.role;

  const contentTabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'navigatie', label: 'Navigatie', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'hero', label: 'Hero', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'diensten', label: 'Diensten', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'voor-na', label: 'Voor & Na', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'galerij-cta', label: 'Galerij CTA', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'galerij', label: 'Galerij', roles: ['SuperAdmin', 'Admin', 'Editor'] },
    { id: 'contact', label: 'Contact', roles: ['SuperAdmin', 'Admin', 'Editor'] },
  ], []);
  
  const adminTabs = useMemo(() => [
    { id: 'instellingen', label: 'Instellingen', roles: ['SuperAdmin', 'Admin'] },
    { id: 'gebruikers', label: 'Gebruikers', roles: ['SuperAdmin'] },
    { id: 'geschiedenis', label: 'Geschiedenis', roles: ['SuperAdmin'] },
    { id: 'help', label: 'Help', roles: ['SuperAdmin', 'Admin', 'Editor'] },
  ], []);
  
  const visibleAdminTabs = useMemo(() => adminTabs.filter(tab => userRole && tab.roles.includes(userRole)), [adminTabs, userRole]);
  const isAdminTabActive = useMemo(() => adminTabs.some(tab => tab.id === activeTab), [activeTab, adminTabs]);
  // --- END: Tab Definitions ---
  
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Kon content niet ophalen.');
      const data = await response.json();
      setContent(data.pageContent);
      setGallery(data.galleryImages);
      setSettings(data.settings || {});
      setOriginalContent(JSON.stringify({ pageContent: data.pageContent, galleryImages: data.galleryImages, settings: data.settings || {} }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const hasChanges = useMemo(() => {
    if (!content || !settings) return false;
    return JSON.stringify({ pageContent: content, galleryImages: gallery, settings: settings }) !== originalContent;
  }, [content, gallery, settings, originalContent]);
  
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);
  
  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, title, message, onConfirm });
  };

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

  const handleSettingsChange = useCallback((key: string, value: any) => {
      setSettings((prev: any) => ({
          ...prev,
          [key]: value,
      }));
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
      if (!content || !settings) return;
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
              body: JSON.stringify({ pageContent: content, galleryImages: gallery.filter(img => img.image.url), settings }),
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Opslaan mislukt.');
          }
          const data = await response.json();
          const validGallery = gallery.filter(img => img.image.url);
          setGallery(validGallery);
          setOriginalContent(JSON.stringify({ pageContent: content, galleryImages: validGallery, settings }));
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
    // Role-based check before rendering
    const allTabs = [...contentTabs, ...adminTabs];
    const currentTabInfo = allTabs.find(tab => tab.id === activeTab);
    if (!currentTabInfo || (userRole && !currentTabInfo.roles.includes(userRole))) {
      setActiveTab('dashboard'); // Fallback to dashboard if access is denied
      return <DashboardTab content={content} user={user} settings={settings} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
    }

    switch(activeTab) {
      case 'dashboard': return <DashboardTab content={content} user={user} settings={settings} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'navigatie': return <NavigationTab content={content} handleContentChange={handleContentChange} />;
      case 'hero': return <HeroTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'diensten': return <ServicesTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'voor-na': return <BeforeAfterTab content={content} handleContentChange={handleContentChange} handleImageUpload={handleImageUpload} />;
      case 'galerij-cta': return <CtaGalleryTab content={content} handleContentChange={handleContentChange} />;
      case 'galerij': return <GalleryTab content={content} gallery={gallery} handleContentChange={handleContentChange} setGallery={setGallery} setEditingImageIndex={setEditingImageIndex} />;
      case 'contact': return <ContactTab content={content} handleContentChange={handleContentChange} />;
      case 'instellingen': return <SettingsTab settings={settings} handleSettingsChange={handleSettingsChange} showNotification={showNotification} />;
      case 'gebruikers': return <UserManagementTab showNotification={showNotification} showConfirmation={showConfirmation} />;
      case 'geschiedenis': return <HistoryTab showNotification={showNotification} showConfirmation={showConfirmation} onRestore={loadContent} />;
      case 'help': return <HelpTab />;
      default: return null;
    }
  }

  const getSaveButtonState = () => {
    if (isSaving) {
      return { text: 'Opslaan...', icon: <Spinner size={20} className="animate-spin mr-2" />, className: 'bg-yellow-600', disabled: true };
    }
    if (hasChanges) {
      return { text: 'Wijzigingen Opslaan', icon: <FloppyDisk size={20} className="mr-2" />, className: 'bg-green-600 hover:bg-green-700', disabled: false };
    }
    return { text: 'Opgeslagen', icon: <CheckCircle size={20} className="mr-2" />, className: 'bg-zinc-600', disabled: true };
  };

  const saveButtonState = getSaveButtonState();
  const activeAdminTab = adminTabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-20 bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setActiveTab('dashboard')} className="text-xl font-bold hover:text-green-500 transition-colors">
              Content Management
            </button>
            <div className="flex items-center space-x-4">
               <a href="/" target="_blank" rel="noopener noreferrer" title="Bekijk live site" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700/50 rounded-md hover:bg-zinc-700 hover:text-white transition-colors">
                <ArrowSquareOut size={20} className="mr-2"/>
                Bekijk Site
              </a>
              <button onClick={handleSave} disabled={saveButtonState.disabled} className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 disabled:cursor-not-allowed transition-colors ${saveButtonState.className}`}>
                {saveButtonState.icon}
                {saveButtonState.text}
              </button>
              {userRole !== 'Editor' && <AdminDropdownMenu adminTabs={visibleAdminTabs} setActiveTab={setActiveTab} isAdminTabActive={isAdminTabActive} />}
              <button onClick={logout} title="Uitloggen" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors">
                  <SignOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
          {isAdminTabActive ? (
            <h2 className="text-3xl font-bold mb-6 px-4 sm:px-0">{activeAdminTab?.label}</h2>
          ) : (
            <div className="border-b border-zinc-700 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {contentTabs.map(tab => (
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
          )}
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              {renderTabContent()}
          </div>
        </div>
      </main>
      
      {editingImageIndex !== null && gallery[editingImageIndex] && (
        <GalleryEditModal isOpen={editingImageIndex !== null} onClose={handleCloseModal} image={gallery[editingImageIndex]} onSave={(updatedImage) => { setGallery(g => g.map((item, i) => (i === editingImageIndex ? updatedImage : item))); setEditingImageIndex(null); }} onImageUpload={handleModalImageUpload} />
      )}
      <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmation.onConfirm} title={confirmation.title} message={confirmation.message} />
      <NotificationPopup notification={notification} />
    </div>
  );
}

export default AdminDashboard;