import React, { useRef } from 'react';
import type { PageContent, Testimonial } from '../types';
import SectionHeader from './SectionHeader';
import { useOnScreen } from '../hooks/useOnScreen';
import { Star } from 'phosphor-react';

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

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-4">
        <div className="h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl shadow-lg flex flex-col text-center">
            <Rating rating={testimonial.rating} />
            <p className="text-zinc-300 italic my-6 flex-grow">"{testimonial.quote}"</p>
            <p className="font-bold text-white">{testimonial.name}</p>
        </div>
    </div>
);


const Testimonials = ({ content }: { content: PageContent }) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(sectionRef, { threshold: 0.1 });
    
    const testimonials = content.testimonials || [];

    if (!testimonials || testimonials.length === 0) return null;

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
            </div>
        </section>
    );
};

export default Testimonials;