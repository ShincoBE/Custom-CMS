// pages/AdminDashboard.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PageContent, GalleryImage, Service } from '../types';
import { CaretDown, Plus, Trash, UploadSimple, Spinner, CheckCircle, WarningCircle } from 'phosphor-react';

// --- HELPER COMPONENTS (scoped to this file) ---

const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-700 rounded-lg mb-4 bg-zinc-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-white"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <CaretDown size={20} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-zinc-700">
          {children}
        </div>
      )}
    </div>
  );
};

const Input = ({ label, help, value, onChange, name, required = false }: { label: string, help: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, required?: boolean }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
    />
    <p className="text-xs text-zinc-400 mt-1">{help}</p>
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

const ImageUpload = ({ label, help, currentUrl, alt, onAltChange, onImageChange, name, required = false }: { label: string, help: string, currentUrl?: string, alt?: string, onAltChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onImageChange: (file: File) => void, name: string, required?: boolean }) => {
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
                    <img src={currentUrl} alt={alt || 'Preview'} className="w-24 h-24 object-cover rounded-md bg-zinc-700" />
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
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" />
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
  
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleContentChange = useCallback((path: string, value: any) => {
    setContent(prev => {
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
  
  const handleGalleryImageUpload = async (file: File, index: number) => {
      const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-vercel-filename': file.name },
          body: file,
      });
      if (!response.ok) throw new Error('Upload mislukt');
      const blob = await response.json();
      setGallery(prev => {
          const newGallery = [...prev];
          newGallery[index].image.url = blob.url;
          return newGallery;
      });
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
              body: JSON.stringify({ pageContent: content, galleryImages: gallery }),
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Opslaan mislukt.');
          }
          const data = await response.json();
          setOriginalContent(JSON.stringify({ pageContent: content, galleryImages: gallery }));
          showNotification('success', data.message);
      } catch (err: any) {
          showNotification('error', err.message);
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center"><Spinner size={32} className="animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center text-red-400">{error}</div>;
  if (!content) return null;

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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* --- Main Content --- */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

              <Accordion title="Algemene Pagina-instellingen" defaultOpen>
                <Input name="companyName" label="Bedrijfsnaam" help="De naam van het bedrijf, wordt weergegeven in de header." value={content.companyName!} onChange={e => handleContentChange('companyName', e.target.value)} required />
                <ImageUpload name="logo" label="Logo" help="Het logo dat linksboven in de header staat. (Aanbevolen: 1:1 ratio, bv. 80x80px)" currentUrl={content.logo?.url} alt={content.logo?.alt} onAltChange={e => handleContentChange('logo.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'logo.url')} required />
                <Input name="facebookUrl" label="Facebook URL" help="Link naar de Facebook pagina. Laat leeg om het icoon te verbergen." value={content.facebookUrl!} onChange={e => handleContentChange('facebookUrl', e.target.value)} />
                <Input name="footerCopyrightText" label="Footer Copyright Tekst" help="De tekst die na het jaartal in de footer komt." value={content.footerCopyrightText!} onChange={e => handleContentChange('footerCopyrightText', e.target.value)} required />
                <ImageUpload name="ogImage" label="Social Media Afbeelding (OG)" help="De afbeelding die wordt getoond bij het delen van de link op social media. (Aanbevolen: 1200x630px)" currentUrl={content.ogImage?.url} alt={content.ogImage?.alt} onAltChange={e => handleContentChange('ogImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'ogImage.url')} />
              </Accordion>

              <Accordion title="Navigatiebalk">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="navHome" label="Home Link" help="Tekst voor de 'Home' link." value={content.navHome!} onChange={e => handleContentChange('navHome', e.target.value)} required />
                  <Input name="navServices" label="Diensten Link" help="Tekst voor de 'Diensten' link." value={content.navServices!} onChange={e => handleContentChange('navServices', e.target.value)} required />
                  <Input name="navBeforeAfter" label="Voor & Na Link" help="Tekst voor de 'Voor & Na' link." value={content.navBeforeAfter!} onChange={e => handleContentChange('navBeforeAfter', e.target.value)} required />
                  <Input name="navGallery" label="Galerij Knop" help="Tekst voor de 'Galerij' knop." value={content.navGallery!} onChange={e => handleContentChange('navGallery', e.target.value)} required />
                  <Input name="navContact" label="Contact Link" help="Tekst voor de 'Contact' link." value={content.navContact!} onChange={e => handleContentChange('navContact', e.target.value)} required />
                </div>
              </Accordion>
              
              <Accordion title="Hero Sectie (Bovenaan pagina)">
                  <Input name="heroTitle" label="Hoofdtitel" help="De grote titel op de homepagina. Gebruik 'Service+' om het groene accent te krijgen." value={content.heroTitle!} onChange={e => handleContentChange('heroTitle', e.target.value)} required />
                  <Textarea name="heroTagline" label="Tagline" help="De subtitel onder de hoofdtitel." value={content.heroTagline!} onChange={e => handleContentChange('heroTagline', e.target.value)} required />
                  <Input name="heroButtonText" label="Knop Tekst" help="De tekst op de knop in de hero sectie." value={content.heroButtonText!} onChange={e => handleContentChange('heroButtonText', e.target.value)} required />
                  <ImageUpload name="heroImage" label="Achtergrondafbeelding" help="De grote afbeelding op de achtergrond van de hero sectie." currentUrl={content.heroImage?.url} alt={content.heroImage?.alt} onAltChange={e => handleContentChange('heroImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'heroImage.url')} required />
              </Accordion>

              <Accordion title="Diensten Sectie">
                <Input name="servicesTitle" label="Titel" help="Titel van de diensten sectie." value={content.servicesTitle!} onChange={e => handleContentChange('servicesTitle', e.target.value)} required />
                <Textarea name="servicesSubtitle" label="Subtitel" help="Subtitel van de diensten sectie." value={content.servicesSubtitle!} onChange={e => handleContentChange('servicesSubtitle', e.target.value)} required />
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Diensten Lijst</h3>
                {content.servicesList?.map((service, index) => (
                    <div key={service._key} className="p-4 border border-zinc-700 rounded-lg mb-4 bg-zinc-900/50 relative">
                        <Input name={`service-title-${index}`} label="Dienst Titel" help="" value={service.title} onChange={e => handleContentChange(`servicesList.${index}.title`, e.target.value)} required />
                        <Textarea name={`service-desc-${index}`} label="Dienst Omschrijving" help="" value={service.description} onChange={e => handleContentChange(`servicesList.${index}.description`, e.target.value)} required />
                        <ImageUpload name={`service-icon-${index}`} label="Icoon" help="Een klein icoon voor deze dienst." currentUrl={service.customIcon?.url} alt={service.customIcon?.alt} onAltChange={e => handleContentChange(`servicesList.${index}.customIcon.alt`, e.target.value)} onImageChange={file => handleImageUpload(file, `servicesList.${index}.customIcon.url`)} />
                        <button type="button" onClick={() => handleContentChange('servicesList', content.servicesList?.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                    </div>
                ))}
                 <button type="button" onClick={() => handleContentChange('servicesList', [...(content.servicesList || []), { _key: `new-${Date.now()}`, title: 'Nieuwe Dienst', description: 'Beschrijving van de nieuwe dienst.', customIcon: { url: '', alt: ''} }])} className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                    <Plus size={16} className="mr-2"/> Dienst Toevoegen
                </button>
              </Accordion>

              <Accordion title="Voor & Na Sectie">
                <Input name="beforeAfterTitle" label="Titel" help="Titel van de Voor & Na sectie." value={content.beforeAfterTitle!} onChange={e => handleContentChange('beforeAfterTitle', e.target.value)} required />
                <Textarea name="beforeAfterSubtitle" label="Subtitel" help="Subtitel van de Voor & Na sectie." value={content.beforeAfterSubtitle!} onChange={e => handleContentChange('beforeAfterSubtitle', e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <ImageUpload name="beforeImage" label="'Voor' Afbeelding" help="De afbeelding die de situatie 'voor' toont." currentUrl={content.beforeImage?.url} alt={content.beforeImage?.alt} onAltChange={e => handleContentChange('beforeImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'beforeImage.url')} required />
                  <ImageUpload name="afterImage" label="'Na' Afbeelding" help="De afbeelding die de situatie 'na' toont." currentUrl={content.afterImage?.url} alt={content.afterImage?.alt} onAltChange={e => handleContentChange('afterImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'afterImage.url')} required />
                </div>
              </Accordion>

              <Accordion title="Galerij Call-to-Action Sectie">
                <Input name="servicesCtaTitle" label="Titel" help="Titel van de sectie die oproept om de galerij te bekijken." value={content.servicesCtaTitle!} onChange={e => handleContentChange('servicesCtaTitle', e.target.value)} required />
                <Textarea name="servicesCtaSubtitle" label="Subtitel" help="Subtitel van deze sectie." value={content.servicesCtaSubtitle!} onChange={e => handleContentChange('servicesCtaSubtitle', e.target.value)} required />
                <Input name="servicesCtaButtonText" label="Knop Tekst" help="Tekst op de knop om de galerij te openen." value={content.servicesCtaButtonText!} onChange={e => handleContentChange('servicesCtaButtonText', e.target.value)} required />
              </Accordion>

              <Accordion title="Galerij Instellingen">
                <Input name="galleryTitle" label="Galerij Titel" help="De titel die bovenaan in de galerij popup verschijnt." value={content.galleryTitle!} onChange={e => handleContentChange('galleryTitle', e.target.value)} required />
                <Textarea name="gallerySubtitle" label="Galerij Subtitel" help="De subtitel in de galerij popup." value={content.gallerySubtitle!} onChange={e => handleContentChange('gallerySubtitle', e.target.value)} required />
                 <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Galerij Afbeeldingen</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((img, index) => (
                        <div key={img._id} className="relative group">
                            <ImageUpload name={`gallery-img-${index}`} label="" help="" currentUrl={img.image.url} alt={img.image.alt} onAltChange={e => setGallery(g => g.map((item, i) => i === index ? {...item, image: {...item.image, alt: e.target.value}} : item))} onImageChange={file => handleGalleryImageUpload(file, index)} />
                            <button type="button" onClick={() => setGallery(g => g.filter((_, i) => i !== index))} className="absolute top-1 right-1 z-10 text-white bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={16} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setGallery(g => [...g, { _id: `new-${Date.now()}`, image: { url: '', alt: '' }}])} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-green-500 transition-colors">
                        <Plus size={32} />
                        <span>Toevoegen</span>
                    </button>
                 </div>
              </Accordion>

              <Accordion title="Contact Sectie">
                <Input name="contactTitle" label="Titel" help="Titel van de contact sectie." value={content.contactTitle!} onChange={e => handleContentChange('contactTitle', e.target.value)} required />
                <Textarea name="contactSubtitle" label="Subtitel" help="Subtitel van de contact sectie." value={content.contactSubtitle!} onChange={e => handleContentChange('contactSubtitle', e.target.value)} required />
                <Input name="contactInfoTitle" label="Titel Contactkolom" help="Titel boven de adresgegevens." value={content.contactInfoTitle!} onChange={e => handleContentChange('contactInfoTitle', e.target.value)} required />
                <Textarea name="contactInfoText" label="Tekst Contactkolom" help="De introtekst in de linkerkolom." value={content.contactInfoText!} onChange={e => handleContentChange('contactInfoText', e.target.value)} required />
                <Input name="contactAddressTitle" label="Adres Titel" help="Bijv. 'Adres'." value={content.contactAddressTitle!} onChange={e => handleContentChange('contactAddressTitle', e.target.value)} required />
                <Textarea name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <Input name="contactEmailTitle" label="Email Titel" help="Bijv. 'Email'." value={content.contactEmailTitle!} onChange={e => handleContentChange('contactEmailTitle', e.target.value)} required />
                <Input name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <Input name="contactPhoneTitle" label="Telefoon Titel" help="Bijv. 'Telefoon'." value={content.contactPhoneTitle!} onChange={e => handleContentChange('contactPhoneTitle', e.target.value)} required />
                <Input name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Contactformulier Teksten</h3>
                <Input name="contactFormNameLabel" label="Naam Veld Label" help="Label voor het 'Naam' invulveld." value={content.contactFormNameLabel!} onChange={e => handleContentChange('contactFormNameLabel', e.target.value)} required />
                <Input name="contactFormEmailLabel" label="Email Veld Label" help="Label voor het 'Email' invulveld." value={content.contactFormEmailLabel!} onChange={e => handleContentChange('contactFormEmailLabel', e.target.value)} required />
                <Input name="contactFormMessageLabel" label="Bericht Veld Label" help="Label voor het 'Bericht' invulveld." value={content.contactFormMessageLabel!} onChange={e => handleContentChange('contactFormMessageLabel', e.target.value)} required />
                <Input name="contactFormSubmitButtonText" label="Verstuurknop Tekst" help="Tekst op de verstuurknop." value={content.contactFormSubmitButtonText!} onChange={e => handleContentChange('contactFormSubmitButtonText', e.target.value)} required />
                <Input name="contactFormSuccessTitle" label="Succes Titel" help="Titel na succesvol verzenden." value={content.contactFormSuccessTitle!} onChange={e => handleContentChange('contactFormSuccessTitle', e.target.value)} required />
                <Textarea name="contactFormSuccessText" label="Succes Tekst" help="Tekst na succesvol verzenden." value={content.contactFormSuccessText!} onChange={e => handleContentChange('contactFormSuccessText', e.target.value)} required />
                <Input name="contactFormSuccessAgainButtonText" label="'Nogmaals Versturen' Knop Tekst" help="Tekst op de knop om het formulier te resetten." value={content.contactFormSuccessAgainButtonText!} onChange={e => handleContentChange('contactFormSuccessAgainButtonText', e.target.value)} required />
              </Accordion>

            </form>
        </div>
      </main>

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