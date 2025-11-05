import React, { useRef } from 'react';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import type { PageContent, Service } from '../types';
import ErrorBoundary from './ErrorBoundary';
import { Question } from 'phosphor-react';

type Status = 'loading' | 'success' | 'error';

const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-800/80 p-6 rounded-lg text-center">
                <div className="h-20 w-20 bg-zinc-700 rounded-full mb-6 mx-auto"></div>
                <div className="h-6 bg-zinc-700 rounded w-1/2 mb-3 mx-auto"></div>
                <div className="h-4 bg-zinc-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-zinc-700 rounded w-5/6 mx-auto"></div>
            </div>
        ))}
    </div>
);

const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const iconUrl = service.customIcon?.url || null;

    return (
        <div
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl shadow-lg text-center transition-all duration-300 hover:border-green-500/50 hover:shadow-green-500/10 hover:-translate-y-1"
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-900/50 border border-green-700/50 mb-6 mx-auto">
                {iconUrl ? (
                    <img 
                        src={iconUrl} 
                        alt={service.customIcon?.alt || `Icoon voor ${service.title}`} 
                        className="h-12 w-12 object-contain"
                        width="48"
                        height="48"
                        loading="lazy"
                    />
                ) : (
                    // Fallback to a simple Question icon if no custom icon is provided
                    <Question size={48} className="text-zinc-500" weight="bold" />
                )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{service.title || 'Onbekende Dienst'}</h3>
            <p className="text-gray-400">{service.description || 'Geen beschrijving beschikbaar.'}</p>
        </div>
    );
};


interface ServicesProps {
    content: PageContent | null;
    status: Status;
}

function Services({ content, status }: ServicesProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });

    const services = content?.servicesList || [];
    const isLoading = status === 'loading';

    return (
        <section id="diensten" className="py-20 bg-zinc-950 overflow-hidden">
            <div
                ref={sectionRef}
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
                <SectionHeader
                    title={content?.servicesTitle || (isLoading ? '' : "Onze Diensten")}
                    subtitle={content?.servicesSubtitle || (isLoading ? '' : "Wij bieden een breed scala aan diensten om uw tuin in topconditie te houden.")}
                />
                <ErrorBoundary>
                    <div className="mt-12">
                        {isLoading && <SkeletonLoader />}
                        {!isLoading && (
                            services.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {services.map((service, index) => (
                                        <ServiceCard key={service._key || index} service={service} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-zinc-400">Geen diensten gevonden. Voeg diensten toe via het admin panel.</div>
                            )
                        )}
                    </div>
                </ErrorBoundary>
            </div>
        </section>
    );
}

export default Services;