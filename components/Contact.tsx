import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import type { PageContent } from '../types';
import { trackEvent } from '../hooks/useAnalytics';
import { PaperPlaneTilt, EnvelopeSimple, Phone } from 'phosphor-react';

interface ContactProps {
  content: PageContent | null;
}

function Contact({ content }: ContactProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Card for Quote Request */}
          <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="p-4 bg-green-900/50 rounded-full border border-green-700/50 mb-4">
              <PaperPlaneTilt size={32} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Vraag een Offerte Aan</h3>
            <p className="text-gray-400 mb-6 flex-grow">
              Heeft u een specifiek project in gedachten? Gebruik ons gedetailleerde formulier om ons alle info te bezorgen voor een accurate offerte.
            </p>
            <Link 
              to="/offerte"
              onClick={() => trackEvent('Click', 'CTA Quote Card')}
              className="group inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
            >
              Start Offerteaanvraag
            </Link>
          </div>

          {/* Card for General Question */}
          <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="p-4 bg-zinc-700/50 rounded-full border border-zinc-600/50 mb-4">
              <EnvelopeSimple size={32} className="text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Stel een Vraag</h3>
            <p className="text-gray-400 mb-6 flex-grow">
              Voor algemene vragen, opmerkingen of een snel overleg kunt u ons het beste direct bereiken via e-mail of telefoon.
            </p>
            <div className="space-y-4">
               <a 
                  href={`mailto:${content?.contactEmail || 'info.andries.serviceplus@gmail.com'}`} 
                  className="inline-flex items-center group text-green-500 hover:underline"
                  onClick={() => trackEvent('Click', 'Email')}
                >
                  <EnvelopeSimple size={20} className="mr-2"/>
                  <span>{content?.contactEmail || 'info.andries.serviceplus@gmail.com'}</span>
                </a>
                <div className="w-full text-center">
                   <a 
                      href={`tel:${(content?.contactPhone || '+32494399286').replace(/\s/g, '')}`} 
                      className="inline-flex items-center group text-green-500 hover:underline"
                      onClick={() => trackEvent('Click', 'Phone')}
                    >
                      <Phone size={20} className="mr-2"/>
                      <span>{content?.contactPhone || '+32 494 39 92 86'}</span>
                    </a>
                </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Contact;
