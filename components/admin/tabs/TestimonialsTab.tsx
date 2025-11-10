import React, { useState, useMemo } from 'react';
import type { PageContent, Testimonial } from '../../../types';
import { Plus, Trash, CaretDown, Star, Quotes } from 'phosphor-react';
import InputWithCounter from '../ui/InputWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';

interface TestimonialsTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
}

const RatingInput = ({ rating, onChange }: { rating: number, onChange: (rating: number) => void }) => (
    <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
            <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                className="focus:outline-none"
            >
                <Star
                    size={24}
                    weight="fill"
                    className={`transition-colors ${i < rating ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-300'}`}
                />
            </button>
        ))}
    </div>
);

const TestimonialsTab = ({ content, handleContentChange }: TestimonialsTabProps) => {
    const [opened, setOpened] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const testimonials = useMemo(() => content.testimonials || [], [content.testimonials]);

    const handleToggle = (index: number) => {
        setOpened(opened === index ? null : index);
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const list = [...testimonials];
        const draggedItem = list[draggedIndex];
        list.splice(draggedIndex, 1);
        list.splice(dropIndex, 0, draggedItem);
        
        handleContentChange('testimonials', list);
        setDraggedIndex(null);
    };


    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Wat Klanten Zeggen Sectie</h2>
            <InputWithCounter name="testimonialsTitle" label="Titel" value={content?.testimonialsTitle || ''} onChange={e => handleContentChange('testimonialsTitle', e.target.value)} required showStyler />
            <InputWithCounter as="textarea" name="testimonialsSubtitle" label="Subtitel" value={content?.testimonialsSubtitle || ''} onChange={e => handleContentChange('testimonialsSubtitle', e.target.value)} required showStyler />

            <h3 className="text-lg font-semibold text-white mt-6 mb-4">Reviews</h3>

            <div className="space-y-2">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={testimonial._key}
                        draggable
                        onDragStart={e => handleDragStart(e, index)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, index)}
                        className={`rounded-lg bg-zinc-800/50 border border-zinc-700 transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
                    >
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700/50"
                            onClick={() => handleToggle(index)}
                        >
                            <div className="flex items-center">
                                <Quotes size={16} className="text-green-500 mr-3" />
                                <span className="font-medium">{testimonial.name}</span>
                            </div>
                            <div className="flex items-center">
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleContentChange('testimonials', testimonials.filter((_, i) => i !== index)) }} className="p-2 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                                <CaretDown size={20} className={`ml-2 transform transition-transform ${opened === index ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        {opened === index && (
                            <div className="p-4 border-t border-zinc-700">
                                <ToggleSwitch
                                    label="Gepubliceerd"
                                    help="Zet aan om deze review op de live website te tonen."
                                    enabled={!!testimonial.published}
                                    onChange={val => handleContentChange(`testimonials.${index}.published`, val)}
                                />
                                <InputWithCounter name={`testimonial-name-${index}`} label="Naam Klant" value={testimonial.name} onChange={e => handleContentChange(`testimonials.${index}.name`, e.target.value)} required />
                                <InputWithCounter as="textarea" name={`testimonial-quote-${index}`} label="Quote" value={testimonial.quote} onChange={e => handleContentChange(`testimonials.${index}.quote`, e.target.value)} required />
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Beoordeling</label>
                                    <RatingInput rating={testimonial.rating} onChange={val => handleContentChange(`testimonials.${index}.rating`, val)} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => handleContentChange('testimonials', [...testimonials, { _key: `new-${Date.now()}`, name: 'Nieuwe Klant', quote: 'Fantastische service!', rating: 5, published: false }])}
                className="mt-4 inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600"
            >
                <Plus size={16} className="mr-2"/> Review Toevoegen
            </button>
        </>
    );
};

export default TestimonialsTab;