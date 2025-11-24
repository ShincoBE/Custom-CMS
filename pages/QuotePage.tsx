import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent, Service, SiteSettings } from '@/types';
import { Spinner, ArrowLeft, ArrowRight, UploadSimple, ClipboardText, CheckCircle, Trash, Check } from 'phosphor-react';
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
      if (file.size > 4.5 * 1024 * 1024) { // 4.5MB limit for Vercel Serverless
        setErrors(prev => ({ ...prev, image: 'Bestand is te groot (max 4.5MB).' }));
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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const mockEvent = {
        target: { files: droppedFiles },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageChange(mockEvent);
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
  
  const steps = [
      { number: 1, name: 'Diensten' },
      { number: 2, name: 'Details' },
      { number: 3, name: 'Contact' }
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">Welke diensten interesseren u?</h2>
            <p className="text-zinc-400 mb-6">U kunt meerdere diensten selecteren.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(s => {
                  const isSelected = selectedServices.includes(s.title);
                  return (
                    <div 
                        key={s._key} 
                        onClick={() => {
                          setSelectedServices(prev =>
                            prev.includes(s.title)
                              ? prev.filter(item => item !== s.title)
                              : [...prev, s.title]
                          );
                        }}
                        className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-green-900/50 border-green-500' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'}`}
                    >
                      {isSelected && (
                          <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full text-white">
                            <Check size={12} weight="bold" />
                          </div>
                      )}
                      {s.customIcon?.url && <img src={s.customIcon.url} alt={s.customIcon.alt || ''} className="w-8 h-8 mr-4 object-contain" />}
                      <span className="font-medium text-white">{s.title}</span>
                    </div>
                  );
              })}
            </div>
            {errors.services && <p className="text-red-400 mt-4">{errors.services}</p>}
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">Vertel ons meer over uw project</h2>
            <p className="text-zinc-400 mb-6">Hoe meer details, hoe beter we u kunnen helpen.</p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={6}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
              placeholder="Beschrijf hier wat u wilt laten doen..."
            />
            {errors.details && <p className="text-red-400 text-xs mt-1">{errors.details}</p>}
            
            <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Voeg een foto toe (optioneel)</label>
                {!imagePreview ? (
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`flex justify-center items-center w-full h-32 px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDraggingOver ? 'bg-green-900/50 border-green-500' : 'border-zinc-600 hover:bg-zinc-700/50'}`}
                     >
                        <div className="text-center">
                            <UploadSimple size={24} className="mx-auto text-zinc-400" />
                            <p className="mt-2 text-sm text-zinc-400"><span className="font-semibold text-green-500">Klik om te uploaden</span> of sleep een bestand</p>
                            <p className="text-xs text-zinc-500">PNG, JPG, WEBP (MAX. 4.5MB)</p>
                        </div>
                     </div>
                ): (
                    <div className="relative w-40 h-40">
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                         <button onClick={removeImage} className="absolute -top-2 -right-2 p-1.5 text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors" aria-label="Verwijder afbeelding">
                            <Trash size={16} />
                         </button>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                {errors.image && <p className="text-red-400 text-xs mt-2">{errors.image}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">Bijna klaar! Hoe kunnen we u bereiken?</h2>
            <p className="text-zinc-400 mb-6">We gebruiken deze gegevens enkel om op uw aanvraag te reageren.</p>
            <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Naam</label>
                  <input
                      id="name"
                      type="text"
                      value={contactInfo.name}
                      onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                      placeholder="Uw naam"
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Emailadres</label>
                  <input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="Uw emailadres"
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="text-white font-sans antialiased flex flex-col min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top,_rgba(10,40,20,0.3),_transparent_40%)]">
        <Header onOpenGallery={() => {}} content={pageContent} settings={settings} status={pageContent ? 'success' : 'loading'} />
        <main className="flex-grow pt-16">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                {!isSubmitted ? (
                <>
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent pb-2">Vraag een Vrijblijvende Offerte Aan</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-400">Voltooi de 3 stappen om ons alle details voor uw project te bezorgen.</p>
                    </div>

                    <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                        <div className="lg:col-span-2">
                           <nav aria-label="Progress" className="mb-12">
                                <ol role="list" className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                                    
                                    {/* Continuous line container */}
                                    <div className="absolute top-4 left-0 w-full h-0.5" style={{ gridColumn: '1 / -1' }} aria-hidden="true">
                                        <div 
                                            className="relative h-full bg-zinc-700 mx-auto" 
                                            style={{ width: `calc(100% * (${steps.length} - 1) / ${steps.length})` }}
                                        >
                                            {/* Progress bar */}
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-500"
                                                style={{ width: `${(step - 1) / (steps.length - 1) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {steps.map((s) => (
                                        <li key={s.name} className="relative">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    onClick={() => step > s.number && setStep(s.number)}
                                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${step > s.number ? 'cursor-pointer' : ''} ${s.number < step ? 'bg-green-600' : s.number === step ? 'border-2 border-green-600 bg-zinc-800' : 'border-2 border-zinc-600 bg-zinc-800'}`}
                                                >
                                                    {s.number < step ? (
                                                        <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                                    ) : (
                                                        <span className={`${s.number === step ? 'text-green-500' : 'text-zinc-400'}`}>{s.number}</span>
                                                    )}
                                                </div>
                                                <p className={`mt-2 text-sm font-medium text-center hidden sm:block ${s.number <= step ? 'text-white' : 'text-zinc-500'}`}>{s.name}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                           
                           <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 min-h-[400px] flex flex-col justify-between">
                                <div>
                                    {renderStepContent()}
                                </div>
                                <div>
                                    {errors.submit && <p className="text-red-400 mt-4 text-center">{errors.submit}</p>}
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-8 gap-4">
                                        <button onClick={prevStep} disabled={step === 1 || isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-2 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 transition-colors">
                                            <ArrowLeft size={16} className="mr-2" /> Vorige
                                        </button>
                                        {step < 3 ? (
                                            <button onClick={nextStep} disabled={isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                                            Volgende <ArrowRight size={16} className="ml-2" />
                                            </button>
                                        ) : (
                                            <button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                                            {isLoading ? <Spinner size={20} className="animate-spin mr-2" /> : <ClipboardText size={20} className="mr-2" />}
                                            {isLoading ? 'Verzenden...' : 'Verstuur Aanvraag'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="sticky top-24 bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Uw Aanvraag</h3>
                                {selectedServices.length > 0 ? (
                                    <ul className="space-y-2">
                                    {selectedServices.map(service => (
                                        <li key={service} className="flex items-center text-zinc-300">
                                        <CheckCircle size={16} className="text-green-500 mr-3 flex-shrink-0" />
                                        <span>{service}</span>
                                        </li>
                                    ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-zinc-400">Selecteer diensten om ze hier te zien verschijnen.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
                ) : (
                    <div className="text-center py-12 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                        <h1 className="text-3xl font-bold mb-2">Aanvraag Verzonden!</h1>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Bedankt! We hebben uw offerteaanvraag ontvangen en nemen zo snel mogelijk contact met u op.</p>
                        <button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
                            Terug naar Home
                        </button>
                    </div>
                )}
            </div>
        </main>
        <Footer content={pageContent} />
    </div>
  );
};

export default QuotePage;