
import React, { useRef, useState } from 'react';
import type { PageContent, Testimonial, SiteSettings } from '../types';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import { Star, PencilSimple } from 'phosphor-react';
import ReviewModal from './ReviewModal';

const Rating = ({ rating }: { rating: number }) => (
  <div className="flex justify-center space-x-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        weight="fill"
        className={i < rating ? 'text-yellow-400' : 'text-zinc-600'}
      />
    ))}
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-4">
        <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl shadow-lg flex flex-col text-center">
            <Rating rating={testimonial.rating} />
            <p className="text-zinc-300 italic my-6 flex-grow">"{testimonial.quote}"</p>
            <p className="font-bold text-white">{testimonial.name}</p>
        </div>
    </div>
);


const Testimonials = ({ content, settings }: { content: PageContent, settings?: SiteSettings | null }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const testimonials = content.testimonials || [];
    const hasTestimonials = testimonials.length > 0;
    const allowReviews = settings?.enablePublicReviews;

    // Don't render if there are no testimonials AND review submission is disabled.
    if (!hasTestimonials && !allowReviews) return null;

    return (
        <section
            ref={sectionRef}
            id="testimonials"
            className={`py-20 bg-zinc-950 overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    title={content.testimonialsTitle || "Wat Klanten Zeggen"}
                    subtitle={content.testimonialsSubtitle || "Onze grootste trots is de tevredenheid van onze klanten."}
                />

                {hasTestimonials ? (
                    <div className="relative">
                        <div 
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar -m-4 p-4"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {testimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial._key} testimonial={testimonial} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 py-10 italic">
                        Nog geen reviews. Wees de eerste om een review te schrijven!
                    </div>
                )}

                {allowReviews && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="inline-flex items-center px-6 py-3 border border-zinc-600 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-500 transition-colors duration-300"
                        >
                            <PencilSimple size={20} className="mr-2" />
                            Schrijf een review
                        </button>
                    </div>
                )}
            </div>
            
            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)} 
            />
        </section>
    );
};

export default Testimonials;
