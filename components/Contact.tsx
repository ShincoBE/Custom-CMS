import React, { useState, useRef, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import type { PageContent } from '../types';

// --- CONFIGURATION ---
// For Vercel deployment, the frontend and API are on the same domain.
// We can use a simple relative path. The request will automatically go to
// our serverless function at `[your-domain].vercel.app/api/contact`.
const BACKEND_ENDPOINT = '/api/contact';


const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 500;

interface FloatingLabelInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  children: React.ReactNode;
}

// Reusable component for floating label inputs with validation
const FloatingLabelInput = ({ id, name, type, value, onChange, error, disabled = false, autoComplete, children }: FloatingLabelInputProps) => {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="relative z-0 mb-6 w-full group">
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className={`block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-600 focus:border-green-500'}`}
        placeholder=" "
        required
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={errorId}
        autoComplete={autoComplete}
      />
      <label
        htmlFor={id}
        className={`absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${error ? 'text-red-400 peer-focus:text-red-400' : 'text-gray-400 peer-focus:text-green-500'}`}
      >
        {children}
      </label>
      {error && <p id={errorId} className="mt-2 text-xs text-red-400" aria-live="polite">{error}</p>}
    </div>
  );
};


interface FloatingLabelTextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  children: React.ReactNode;
}

// Reusable component for floating label textarea with validation and character counter
const FloatingLabelTextarea = ({ id, name, value, onChange, error, disabled = false, maxLength, children }: FloatingLabelTextareaProps) => {
    const errorId = error ? `${id}-error` : undefined;
    const currentLength = value.length;
    return (
        <div className="relative z-0 mb-6 w-full group">
            <textarea
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                rows={4}
                className={`block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-600 focus:border-green-500'}`}
                placeholder=" "
                required
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={errorId}
                maxLength={maxLength}
            ></textarea>
            <label
                htmlFor={id}
                className={`absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${error ? 'text-red-400 peer-focus:text-red-400' : 'text-gray-400 peer-focus:text-green-500'}`}
            >
                {children}
            </label>
             <div className="flex justify-between items-start pt-2">
              {error ? (
                  <p id={errorId} className="text-xs text-red-400" aria-live="polite">{error}</p>
              ) : (
                  <span></span>
              )}
              {maxLength && (
                  <div className={`ml-auto text-xs ${currentLength > maxLength ? 'text-red-400' : 'text-gray-400'}`}>
                      {currentLength} / {maxLength}
                  </div>
              )}
            </div>
        </div>
    );
};

interface ContactProps {
  content: PageContent | null;
}

function Contact({ content }: ContactProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', fax: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', message: '' };
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht.';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Emailadres is verplicht.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Voer een geldig emailadres in.';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bericht is verplicht.';
      isValid = false;
    } else if (formData.message.length < MIN_MESSAGE_LENGTH) {
      newErrors.message = `Bericht moet minimaal ${MIN_MESSAGE_LENGTH} tekens lang zijn.`;
      isValid = false;
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Bericht mag maximaal ${MAX_MESSAGE_LENGTH} tekens lang zijn.`;
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      fax: formData.fax, // Honeypot field
    };

    try {
        const response = await fetch(BACKEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '', fax: '' }); // Clear form on success
        } else {
            // Robust error handling: Check if the response is JSON before parsing.
            const contentType = response.headers.get('content-type');
            let errorMessage = 'Er is een onbekende fout opgetreden bij het verzenden.';
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } else {
                // If not JSON, use the status text or a generic message.
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setSubmitError(error.message || 'Sorry, uw bericht kon niet worden verzonden. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetForm = () => {
    setSubmitted(false);
  }

  const defaultAddress = `Hazenstraat 65\n2500 Lier\nBelgië`;

  return (
    <section id="contact" className="py-20 bg-zinc-900 overflow-hidden">
      <div 
        ref={sectionRef}
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <SectionHeader 
          title={content?.contactTitle || "Neem Contact Op"}
          subtitle={content?.contactSubtitle || "Heeft u vragen of wilt u een vrijblijvende offerte? Wij staan voor u klaar."}
        />

        <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 p-8 text-gray-300">
                    <h3 className="text-2xl font-bold text-white mb-4">{content?.contactInfoTitle || 'Contactgegevens'}</h3>
                    <p className="mb-8">{content?.contactInfoText || 'U kunt ons bereiken via de onderstaande gegevens, of door het formulier in te vullen.'}</p>
                    <ul className="space-y-6">
                        <li className="flex">
                            <a 
                              href="https://www.google.com/maps/search/?api=1&query=Hazenstraat%2065%2C%202500%20Lier%2C%20Belgium" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-start group"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="font-semibold text-white group-hover:text-green-500 transition-colors">{content?.contactAddressTitle || 'Adres'}</p>
                                    <address className="not-italic group-hover:underline" style={{ whiteSpace: 'pre-line' }}>
                                      {content?.contactAddress || defaultAddress}
                                    </address>
                                </div>
                            </a>
                        </li>
                        <li className="flex items-start">
                             <div className="flex-shrink-0 mt-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-white">{content?.contactEmailTitle || 'Email'}</p>
                                <a href={`mailto:${content?.contactEmail || 'info.andries.serviceplus@gmail.com'}`} className="hover:text-green-500 hover:underline transition-colors break-all">
                                  {content?.contactEmail || 'info.andries.serviceplus@gmail.com'}
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start">
                             <div className="flex-shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-white">{content?.contactPhoneTitle || 'Telefoon'}</p>
                                <a href={`tel:${(content?.contactPhone || '+32494399286').replace(/\s/g, '')}`} className="hover:text-green-500 hover:underline transition-colors">
                                  {content?.contactPhone || '+32 494 39 92 86'}
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="md:col-span-3 p-8 bg-black/30">
                     {submitted ? (
                        <div className="flex flex-col items-center justify-center h-full text-center" role="alert">
                            <div className="p-8 bg-green-900/50 text-green-300 border border-green-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-2xl font-bold mt-4">{content?.contactFormSuccessTitle || 'Bericht Verzonden!'}</h3>
                                <p className="mt-2 mb-6">{content?.contactFormSuccessText || 'Bedankt voor uw bericht. We nemen zo spoedielijk mogelijk contact met u op.'}</p>
                                <button
                                    onClick={handleResetForm}
                                    className="text-green-300 font-semibold hover:underline"
                                >
                                    {content?.contactFormSuccessAgainButtonText || 'Nog een bericht sturen'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col h-full" noValidate>
                            <div className="flex-grow">
                              <FloatingLabelInput id="name" name="name" type="text" value={formData.name} onChange={handleChange} error={errors.name} disabled={isLoading} autoComplete="name">
                                  {content?.contactFormNameLabel || 'Naam'}
                              </FloatingLabelInput>
                              <FloatingLabelInput id="email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} disabled={isLoading} autoComplete="email">
                                  {content?.contactFormEmailLabel || 'Emailadres'}
                              </FloatingLabelInput>
                              <FloatingLabelTextarea id="message" name="message" value={formData.message} onChange={handleChange} error={errors.message} disabled={isLoading} maxLength={MAX_MESSAGE_LENGTH}>
                                  {content?.contactFormMessageLabel || 'Uw bericht'}
                              </FloatingLabelTextarea>
                              
                              {/* Honeypot Field: Visually hidden but available for bots */}
                              <div className="absolute w-px h-px -left-[9999px]" aria-hidden="true">
                                <label htmlFor="fax">Fax</label>
                                <input
                                  type="text"
                                  id="fax"
                                  name="fax"
                                  value={formData.fax}
                                  onChange={handleChange}
                                  tabIndex={-1}
                                  autoComplete="off"
                                />
                              </div>
                            </div>

                            <div className="text-left pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:bg-zinc-600 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verzenden...
                                        </>
                                    ) : (
                                        <>
                                            {content?.contactFormSubmitButtonText || 'Verstuur Bericht'}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                {submitError && <p className="mt-4 text-sm text-red-400" role="alert">{submitError}</p>}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;