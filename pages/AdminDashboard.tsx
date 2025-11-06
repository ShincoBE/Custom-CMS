// pages/AdminDashboard.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PageContent, GalleryImage, Service } from '../types';
import { Plus, Trash, UploadSimple, Spinner, CheckCircle, WarningCircle, Pencil, SignOut, Users } from 'phosphor-react';

// --- HELPER COMPONENTS (scoped to this file) ---

const Input = ({ label, help, value, onChange, name, required = false, type = 'text', autoComplete = 'off' }: { label: string, help?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, required?: boolean, type?: string, autoComplete?: string }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
    />
    {help && <p className="text-xs text-zinc-400 mt-1">{help}</p>}
  </div>
);

const Textarea = ({ label, help, value, onChange, name, required = false }: { label: string, help: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, name: string, required?: boolean }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      rows={3}
      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
    />
    <p className="text-xs text-zinc-400 mt-1">{help}</p>
  </div>
);

const ImageUpload = ({ label, help, currentUrl, alt, onAltChange, onImageChange, name, required = false }: { label: string, help: string, currentUrl?: string, alt?: string, onAltChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onImageChange: (file: File) => Promise<void>, name: string, required?: boolean }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setUploadError(null);
            try {
                await onImageChange(file);
            } catch (error) {
                setUploadError('Upload mislukt. Probeer het opnieuw.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="mb-6 p-4 border border-zinc-600 rounded-lg bg-zinc-900/50">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="flex items-start space-x-4">
                {currentUrl ? (
                    <img src={currentUrl} alt={alt || 'Preview'} className="w-24 h-24 object-contain rounded-md bg-zinc-700" />
                ) : (
                    <div className="w-24 h-24 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400">
                        Geen afbeelding
                    </div>
                )}
                <div className="flex-1">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">
                        {isUploading ? <Spinner size={16} className="animate-spin mr-2" /> : <UploadSimple size={16} className="mr-2" />}
                        {isUploading ? 'Uploaden...' : 'Afbeelding wijzigen'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
                    <p className="text-xs text-zinc-400 mt-1 mb-2">{help}</p>
                    
                    <label htmlFor={`${name}-alt`} className="sr-only">Alternatieve tekst</label>
                    <input
                        type="text"
                        id={`${name}-alt`}
                        name={`${name}-alt`}
                        value={alt || ''}
                        onChange={onAltChange}
                        placeholder="Alternatieve tekst (voor SEO)"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500 text-sm mt-2"
                    />
                </div>
            </div>
            {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
        </div>
    );
};

const GalleryEditModal = ({ isOpen, onClose, image, onSave, onImageUpload }: {
  isOpen: boolean;
  onClose: () => void;
  image: GalleryImage;
  onSave: (image: GalleryImage) => void;
  onImageUpload: (file: File) => Promise<string>;
}) => {
  const [editedImage, setEditedImage] = useState(image);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedImage(image); // Sync state if the prop changes
  }, [image]);

  if (!isOpen) return null;

  const handleAltChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedImage(prev => ({ ...prev, image: { ...prev.image, alt: e.target.value } }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const newUrl = await onImageUpload(file);
        setEditedImage(prev => ({ ...prev, image: { ...prev.image, url: newUrl } }));
      } catch (error) {
        console.error("Upload failed", error);
        // Future improvement: show an error message in the modal
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    onSave(editedImage);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
      <div className="bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 border border-zinc-700 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 id="gallery-modal-title" className="text-xl font-bold mb-4 text-white">Galerij Afbeelding Bewerken</h3>
        <div className="flex flex-col sm:flex-row items-start sm:space-x-6">
            <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                {editedImage.image.url ? (
                    <img src={editedImage.image.url} alt={editedImage.image.alt || 'Preview'} className="w-full aspect-square object-cover rounded-md bg-zinc-700" />
                ) : (
                    <div className="w-full aspect-square bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 text-center p-2">
                        Upload een afbeelding
                    </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full mt-2 inline-flex items-center justify-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">
                    {isUploading ? <Spinner size={16} className="animate-spin mr-2" /> : <UploadSimple size={16} className="mr-2" />}
                    {isUploading ? 'Uploaden...' : (editedImage.image.url ? 'Wijzigen' : 'Uploaden')}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
            </div>
            <div className="w-full sm:w-2/3">
              <Textarea
                name="gallery-alt-text"
                label="Alternatieve Tekst (voor SEO)"
                help="Beschrijf de afbeelding voor zoekmachines en gebruikers met een visuele beperking."
                value={editedImage.image.alt || ''}
                onChange={handleAltChange}
              />
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600">
            Annuleren
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700" disabled={!editedImage.image.url}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT COMPONENT ---

const UserManagement = ({ showNotification }: { showNotification: (type: 'success' | 'error', message: string) => void }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<string[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error("Kon gebruikers niet laden.");
            const data = await res.json();
            setUsers(data.users);
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username.length < 3 || newUser.password.length < 8) {
            showNotification('error', 'Gebruikersnaam moet > 2 tekens zijn en wachtwoord > 7 tekens.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            setNewUser({ username: '', password: '' }); // Reset form
            fetchUsers(); // Refresh user list
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async (username: string) => {
        if (!window.confirm(`Weet je zeker dat je de gebruiker '${username}' wilt verwijderen?`)) {
            return;
        }
        setIsSubmitting(true);
         try {
            const res = await fetch('/api/users/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            fetchUsers(); // Refresh user list
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100 flex items-center"><Users size={28} className="mr-3 text-green-500" />Gebruikersbeheer</h2>
            
            {/* Add New User Form */}
            <div className="mb-8 p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                <h3 className="text-lg font-semibold mb-3 text-white">Nieuwe Gebruiker Toevoegen</h3>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input name="username" label="Gebruikersnaam" value={newUser.username} onChange={handleNewUserChange} required autoComplete="off" />
                    <Input name="password" label="Wachtwoord" type="password" value={newUser.password} onChange={handleNewUserChange} required autoComplete="new-password" />
                    <button type="submit" disabled={isSubmitting} className="w-full md:w-auto self-end mb-6 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-zinc-600">
                       {isSubmitting ? <Spinner size={20} className="animate-spin" /> : 'Gebruiker Aanmaken'}
                    </button>
                </form>
            </div>

            {/* User List */}
            <div>
                 <h3 className="text-lg font-semibold mb-3 text-white">Huidige Gebruikers</h3>
                 {isLoadingUsers ? <Spinner size={24} className="animate-spin" /> : (
                    <ul className="space-y-2">
                        {users.map(username => (
                            <li key={username} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-md">
                                <span className="text-zinc-200">{username}</span>
                                {username === currentUser?.username ? (
                                    <span className="text-xs text-zinc-400 italic">Huidige gebruiker</span>
                                ) : (
                                    <button
                                        onClick={() => handleDeleteUser(username)}
                                        disabled={isSubmitting}
                                        className="text-zinc-400 hover:text-red-400 disabled:opacity-50"
                                        aria-label={`Verwijder ${username}`}
                                     >
                                        <Trash size={20} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
        </>
    );
};

// --- MAIN COMPONENT ---

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
      
      // Validation
      if (!content.logo?.url || !content.heroImage?.url || !content.beforeImage?.url || !content.afterImage?.url) {
          showNotification('error', "Zorg ervoor dat alle verplichte afbeeldingen (Logo, Hero, Voor & Na) zijn ingesteld.");
          setIsSaving(false);
          return;
      }
      
      try {
          const response = await fetch('/api/update-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pageContent: content, galleryImages: gallery.filter(img => img.image.url) }), // Filter out empty new images
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Opslaan mislukt.');
          }
          const data = await response.json();
          // After saving, also filter out any invalid images from local state
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
      case 'algemeen':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Algemene Pagina-instellingen</h2>
            <Input name="companyName" label="Bedrijfsnaam" help="De naam van het bedrijf, wordt weergegeven in de header." value={content.companyName!} onChange={e => handleContentChange('companyName', e.target.value)} required />
            <ImageUpload name="logo" label="Logo" help="Het logo dat linksboven in de header staat. (Aanbevolen: 1:1 ratio, bv. 80x80px)" currentUrl={content.logo?.url} alt={content.logo?.alt} onAltChange={e => handleContentChange('logo.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'logo.url')} required />
            <Input name="facebookUrl" label="Facebook URL" help="Link naar de Facebook pagina. Laat leeg om het icoon te verbergen." value={content.facebookUrl!} onChange={e => handleContentChange('facebookUrl', e.target.value)} />
            <Input name="footerCopyrightText" label="Footer Copyright Tekst" help="De tekst die na het jaartal in de footer komt." value={content.footerCopyrightText!} onChange={e => handleContentChange('footerCopyrightText', e.target.value)} required />
            <ImageUpload name="ogImage" label="Social Media Afbeelding (OG)" help="De afbeelding die wordt getoond bij het delen van de link op social media. (Aanbevolen: 1200x630px)" currentUrl={content.ogImage?.url} alt={content.ogImage?.alt} onAltChange={e => handleContentChange('ogImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'ogImage.url')} />
          </>
        );
      case 'navigatie':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Navigatiebalk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input name="navHome" label="Home Link" help="Tekst voor de 'Home' link." value={content.navHome!} onChange={e => handleContentChange('navHome', e.target.value)} required />
              <Input name="navServices" label="Diensten Link" help="Tekst voor de 'Diensten' link." value={content.navServices!} onChange={e => handleContentChange('navServices', e.target.value)} required />
              <Input name="navBeforeAfter" label="Voor & Na Link" help="Tekst voor de 'Voor & Na' link." value={content.navBeforeAfter!} onChange={e => handleContentChange('navBeforeAfter', e.target.value)} required />
              <Input name="navGallery" label="Galerij Knop" help="Tekst voor de 'Galerij' knop." value={content.navGallery!} onChange={e => handleContentChange('navGallery', e.target.value)} required />
              <Input name="navContact" label="Contact Link" help="Tekst voor de 'Contact' link." value={content.navContact!} onChange={e => handleContentChange('navContact', e.target.value)} required />
            </div>
          </>
        );
      case 'hero':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Hero Sectie</h2>
            <Input name="heroTitle" label="Hoofdtitel" help="De grote titel op de homepagina. Gebruik 'Service+' om het groene accent te krijgen." value={content.heroTitle!} onChange={e => handleContentChange('heroTitle', e.target.value)} required />
            <Textarea name="heroTagline" label="Tagline" help="De subtitel onder de hoofdtitel." value={content.heroTagline!} onChange={e => handleContentChange('heroTagline', e.target.value)} required />
            <Input name="heroButtonText" label="Knop Tekst" help="De tekst op de knop in de hero sectie." value={content.heroButtonText!} onChange={e => handleContentChange('heroButtonText', e.target.value)} required />
            <ImageUpload name="heroImage" label="Achtergrondafbeelding" help="De grote afbeelding op de achtergrond van de hero sectie." currentUrl={content.heroImage?.url} alt={content.heroImage?.alt} onAltChange={e => handleContentChange('heroImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'heroImage.url')} required />
          </>
        );
      case 'diensten':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Diensten Sectie</h2>
            <Input name="servicesTitle" label="Titel" help="Titel van de diensten sectie." value={content.servicesTitle!} onChange={e => handleContentChange('servicesTitle', e.target.value)} required />
            <Textarea name="servicesSubtitle" label="Subtitel" help="Subtitel van de diensten sectie." value={content.servicesSubtitle!} onChange={e => handleContentChange('servicesSubtitle', e.target.value)} required />
            <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Diensten Lijst</h3>
            {content.servicesList?.map((service, index) => (
                <div key={service._key} className="p-4 border border-zinc-700 rounded-lg mb-4 bg-zinc-800/50 relative">
                    <Input name={`service-title-${index}`} label="Dienst Titel" value={service.title} onChange={e => handleContentChange(`servicesList.${index}.title`, e.target.value)} required />
                    <Textarea name={`service-desc-${index}`} label="Dienst Omschrijving" help="" value={service.description} onChange={e => handleContentChange(`servicesList.${index}.description`, e.target.value)} required />
                    <ImageUpload name={`service-icon-${index}`} label="Icoon" help="Een klein icoon voor deze dienst." currentUrl={service.customIcon?.url} alt={service.customIcon?.alt} onAltChange={e => handleContentChange(`servicesList.${index}.customIcon.alt`, e.target.value)} onImageChange={file => handleImageUpload(file, `servicesList.${index}.customIcon.url`)} />
                    <button type="button" onClick={() => handleContentChange('servicesList', content.servicesList?.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                </div>
            ))}
             <button type="button" onClick={() => handleContentChange('servicesList', [...(content.servicesList || []), { _key: `new-${Date.now()}`, title: 'Nieuwe Dienst', description: 'Beschrijving van de nieuwe dienst.', customIcon: { url: '', alt: ''} }])} className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                <Plus size={16} className="mr-2"/> Dienst Toevoegen
            </button>
          </>
        );
      case 'voor-na':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Voor & Na Sectie</h2>
            <Input name="beforeAfterTitle" label="Titel" help="Titel van de Voor & Na sectie." value={content.beforeAfterTitle!} onChange={e => handleContentChange('beforeAfterTitle', e.target.value)} required />
            <Textarea name="beforeAfterSubtitle" label="Subtitel" help="Subtitel van de Voor & Na sectie." value={content.beforeAfterSubtitle!} onChange={e => handleContentChange('beforeAfterSubtitle', e.target.value)} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ImageUpload name="beforeImage" label="'Voor' Afbeelding" help="De afbeelding die de situatie 'voor' toont." currentUrl={content.beforeImage?.url} alt={content.beforeImage?.alt} onAltChange={e => handleContentChange('beforeImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'beforeImage.url')} required />
              <ImageUpload name="afterImage" label="'Na' Afbeelding" help="De afbeelding die de situatie 'na' toont." currentUrl={content.afterImage?.url} alt={content.afterImage?.alt} onAltChange={e => handleContentChange('afterImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'afterImage.url')} required />
            </div>
          </>
        );
      case 'galerij-cta':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Galerij Call-to-Action Sectie</h2>
            <Input name="servicesCtaTitle" label="Titel" help="Titel van de sectie die oproept om de galerij te bekijken." value={content.servicesCtaTitle!} onChange={e => handleContentChange('servicesCtaTitle', e.target.value)} required />
            <Textarea name="servicesCtaSubtitle" label="Subtitel" help="Subtitel van deze sectie." value={content.servicesCtaSubtitle!} onChange={e => handleContentChange('servicesCtaSubtitle', e.target.value)} required />
            <Input name="servicesCtaButtonText" label="Knop Tekst" help="Tekst op de knop om de galerij te openen." value={content.servicesCtaButtonText!} onChange={e => handleContentChange('servicesCtaButtonText', e.target.value)} required />
          </>
        );
      case 'galerij':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Galerij Instellingen</h2>
            <Input name="galleryTitle" label="Galerij Titel" help="De titel die bovenaan in de galerij popup verschijnt." value={content.galleryTitle!} onChange={e => handleContentChange('galleryTitle', e.target.value)} required />
            <Textarea name="gallerySubtitle" label="Galerij Subtitel" help="De subtitel in de galerij popup." value={content.gallerySubtitle!} onChange={e => handleContentChange('gallerySubtitle', e.target.value)} required />
             <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Galerij Afbeeldingen</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.map((img, index) => (
                    <div key={img._id} className="relative group aspect-square">
                        <button type="button" onClick={() => setEditingImageIndex(index)} className="w-full h-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500">
                             {img.image.url ? (
                              <img src={img.image.url} alt={img.image.alt || 'Galerij afbeelding'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-center text-sm p-2">
                                <span>Afbeelding instellen</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Pencil size={32} className="text-white" />
                            </div>
                        </button>
                        <button type="button" onClick={() => setGallery(g => g.filter((_, i) => i !== index))} className="absolute top-1 right-1 z-10 text-white bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Verwijder afbeelding">
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => { const newIndex = gallery.length; setGallery(g => [...g, { _id: `new-${Date.now()}`, image: { url: '', alt: '' }}]); setEditingImageIndex(newIndex); }} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-green-500 transition-colors">
                    <Plus size={32} />
                    <span>Toevoegen</span>
                </button>
             </div>
          </>
        );
      case 'contact':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Contact Sectie</h2>
            <Input name="contactTitle" label="Titel" help="Titel van de contact sectie." value={content.contactTitle!} onChange={e => handleContentChange('contactTitle', e.target.value)} required />
            <Textarea name="contactSubtitle" label="Subtitel" help="Subtitel van de contact sectie." value={content.contactSubtitle!} onChange={e => handleContentChange('contactSubtitle', e.target.value)} required />
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Linkerkolom (Contactinfo)</h3>
                <Input name="contactInfoTitle" label="Titel Contactkolom" help="Titel boven de adresgegevens." value={content.contactInfoTitle!} onChange={e => handleContentChange('contactInfoTitle', e.target.value)} required />
                <Textarea name="contactInfoText" label="Tekst Contactkolom" help="De introtekst in de linkerkolom." value={content.contactInfoText!} onChange={e => handleContentChange('contactInfoText', e.target.value)} required />
                <Input name="contactAddressTitle" label="Adres Titel" help="Bijv. 'Adres'." value={content.contactAddressTitle!} onChange={e => handleContentChange('contactAddressTitle', e.target.value)} required />
                <Textarea name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <Input name="contactEmailTitle" label="Email Titel" help="Bijv. 'Email'." value={content.contactEmailTitle!} onChange={e => handleContentChange('contactEmailTitle', e.target.value)} required />
                <Input name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <Input name="contactPhoneTitle" label="Telefoon Titel" help="Bijv. 'Telefoon'." value={content.contactPhoneTitle!} onChange={e => handleContentChange('contactPhoneTitle', e.target.value)} required />
                <Input name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
            </div>
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Rechterkolom (Contactformulier Teksten)</h3>
                <Input name="contactFormNameLabel" label="Naam Veld Label" help="Label voor het 'Naam' invulveld." value={content.contactFormNameLabel!} onChange={e => handleContentChange('contactFormNameLabel', e.target.value)} required />
                <Input name="contactFormEmailLabel" label="Email Veld Label" help="Label voor het 'Email' invulveld." value={content.contactFormEmailLabel!} onChange={e => handleContentChange('contactFormEmailLabel', e.target.value)} required />
                <Input name="contactFormMessageLabel" label="Bericht Veld Label" help="Label voor het 'Bericht' invulveld." value={content.contactFormMessageLabel!} onChange={e => handleContentChange('contactFormMessageLabel', e.target.value)} required />
                <Input name="contactFormSubmitButtonText" label="Verstuurknop Tekst" help="Tekst op de verstuurknop." value={content.contactFormSubmitButtonText!} onChange={e => handleContentChange('contactFormSubmitButtonText', e.target.value)} required />
                <Input name="contactFormSuccessTitle" label="Succes Titel" help="Titel na succesvol verzenden." value={content.contactFormSuccessTitle!} onChange={e => handleContentChange('contactFormSuccessTitle', e.target.value)} required />
                <Textarea name="contactFormSuccessText" label="Succes Tekst" help="Tekst na succesvol verzenden." value={content.contactFormSuccessText!} onChange={e => handleContentChange('contactFormSuccessText', e.target.value)} required />
                <Input name="contactFormSuccessAgainButtonText" label="'Nogmaals Versturen' Knop Tekst" help="Tekst op de knop om het formulier te resetten." value={content.contactFormSuccessAgainButtonText!} onChange={e => handleContentChange('contactFormSuccessAgainButtonText', e.target.value)} required />
            </div>
          </>
        );
      case 'gebruikers':
        return <UserManagement showNotification={showNotification} />;
      default:
        return null;
    }
  }


  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* --- Sticky Header --- */}
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
      
      {/* --- Main Content --- */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* --- Tab Navigation --- */}
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

          {/* --- Tab Panel --- */}
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              {renderTabContent()}
          </div>
        </div>
      </main>

       {/* --- Gallery Edit Modal --- */}
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

      {/* --- Notification Popup --- */}
       {notification && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={24} className="mr-3" /> : <WarningCircle size={24} className="mr-3" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;