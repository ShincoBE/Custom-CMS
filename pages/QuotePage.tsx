import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContent, Service, SiteSettings } from '@/types';
import { Spinner, ArrowLeft, ArrowRight, UploadSimple, PaperPlaneTilt, CheckCircle, Trash } from 'phosphor-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const QUOTE_API_ENDPOINT = '/api/quote';
const CONTENT_API_ENDPOINT = '/api/content';

const QuotePage = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(CONTENT_API_ENDPOINT);
        const data = await res.json();
        setServices(data.pageContent?.servicesList?.filter((s: Service) => s.published) || []);
        setPageContent(data.pageContent);
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to fetch services for quote form", error);
      }
    };
    fetchServices();
  }, []);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && selectedServices.length === 0) {
      newErrors.services = 'Selecteer alstublieft minstens één dienst.';
    }
    if (step === 2 && details.trim().length < 10) {
      newErrors.details = 'Geef alstublieft wat meer details (min. 10 tekens).';
    }
    if (step === 3) {
      if (!contactInfo.name.trim()) newErrors.name = 'Naam is verplicht.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
        newErrors.email = 'Voer een geldig emailadres in.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Bestand is te groot (max 5MB).' }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
    }
  };


  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);

    let imageUrl = '';
    if (imageFile) {
        try {
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-vercel-filename': imageFile.name },
                body: imageFile,
            });
            if (!uploadResponse.ok) throw new Error('Image upload failed');
            const blob = await uploadResponse.json();
            imageUrl = blob.url;
        } catch (error) {
            setErrors({ submit: 'Kon afbeelding niet uploaden. Probeer het zonder, of probeer opnieuw.' });
            setIsLoading(false);
            return;
        }
    }

    try {
        const payload = { ...contactInfo, services: selectedServices, details, imageUrl };
        const res = await fetch(QUOTE_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to send quote request');
        setIsSubmitted(true);
    } catch (error) {
        setErrors({ submit: 'Er is iets misgegaan bij het versturen. Probeer het later opnieuw.' });
    } finally {
        setIsLoading(false);
    }
};


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welke diensten interesseren u?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(s => (
                <label key={s._key} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedServices.includes(s.title) ? 'bg-green-900/50 border-green-500' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'}`}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(s.title)}
                    onChange={() => {
                      setSelectedServices(prev =>
                        prev.includes(s.title)
                          ? prev.filter(item => item !== s.title)
                          : [...prev, s.title]
                      );
                    }}
                    className="h-5 w-5 rounded bg-zinc-700 border-zinc-500 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-3 font-medium">{s.title}</span>
                </label>
              ))}
            </div>
            {errors.services && <p className="text-red-400 mt-2">{errors.services}</p>}
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Vertel ons meer over uw project</h2>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={6}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
              placeholder="Beschrijf hier wat u wilt laten doen. Hoe meer details, hoe beter we u kunnen helpen."
            />
            {errors.details && <p className="text-red-400 text-xs mt-1">{errors.details}</p>}
            
            <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Voeg een foto toe (optioneel)</label>
                <div className="flex items-start sm:items-center flex-col sm:flex-row gap-4">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center px-4 py-2 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                        <UploadSimple size={16} className="mr-2" /> Foto kiezen
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    {imagePreview && (
                        <div className="flex items-center space-x-2">
                             <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md"/>
                             <button onClick={removeImage} className="p-2 text-zinc-400 hover:text-red-400 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors" aria-label="Verwijder afbeelding">
                                <Trash size={20} />
                             </button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-zinc-400 mt-2">Max. bestandsgrootte: 5MB. Toegestane types: JPG, PNG, WEBP.</p>
                {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Bijna klaar! Hoe kunnen we u bereiken?</h2>
            <div className="space-y-4">
                <input
                    type="text"
                    value={contactInfo.name}
                    onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                    placeholder="Uw naam"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                />
                 {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                <input
                    type="email"
                    value={contactInfo.email}
                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="Uw emailadres"
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                />
                 {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950">
        <Header onOpenGallery={() => {}} content={pageContent} settings={settings} status={pageContent ? 'success' : 'loading'} />
        <main className="flex-grow pt-16 flex items-center justify-center">
            <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl p-6 sm:p-10">
                    {!isSubmitted ? (
                        <>
                         <h1 className="text-3xl font-bold text-center mb-2">Vraag een vrijblijvende offerte aan</h1>
                         <p className="text-zinc-400 text-center mb-8">Voltooi de stappen om ons de details van uw project te bezorgen.</p>

                         {/* Progress Bar */}
                         <div className="w-full bg-zinc-700 rounded-full h-2.5 mb-8">
                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                         </div>
                        
                         <div className="min-h-[250px]">
                            {renderStep()}
                         </div>
                         
                         {errors.submit && <p className="text-red-400 mt-4 text-center">{errors.submit}</p>}
                         
                         {/* Navigation */}
                         <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-8 gap-4 sm:gap-0">
                            <button onClick={prevStep} disabled={step === 1 || isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">
                                <ArrowLeft size={16} className="mr-2" /> Vorige
                            </button>
                            {step < 3 ? (
                                <button onClick={nextStep} disabled={isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                Volgende <ArrowRight size={16} className="ml-2" />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                {isLoading ? <Spinner size={16} className="animate-spin mr-2" /> : <PaperPlaneTilt size={16} className="mr-2" />}
                                {isLoading ? 'Verzenden...' : 'Verstuur Aanvraag'}
                                </button>
                            )}
                         </div>
                        </>
                    ) : (
                         <div className="text-center py-12">
                             <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Aanvraag Verzonden!</h1>
                            <p className="text-zinc-400 mb-8">Bedankt! We hebben uw offerteaanvraag ontvangen en nemen zo snel mogelijk contact met u op.</p>
                            <button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                                Terug naar Home
                            </button>
                         </div>
                    )}
                 </div>
            </div>
        </main>
        <Footer content={pageContent} />
    </div>
  );
};

export default QuotePage;