import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';
import ImageUpload from '../ui/ImageUpload';

interface HeroTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
    handleImageSelect: (url: string, path: string) => void; // New prop
}

const HeroTab = ({ content, handleContentChange, handleImageUpload, handleImageSelect }: HeroTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Hero Sectie</h2>
            <AdminInput name="heroTitle" label="Hoofdtitel" help="De grote titel op de homepagina." value={content?.heroTitle || ''} onChange={e => handleContentChange('heroTitle', e.target.value)} required showStyler />
            <AdminTextarea name="heroTagline" label="Tagline" help="De subtitel onder de hoofdtitel." value={content?.heroTagline || ''} onChange={e => handleContentChange('heroTagline', e.target.value)} required showStyler />
            <AdminInput name="heroButtonText" label="Knop Tekst" help="De tekst op de knop in de hero sectie." value={content?.heroButtonText || ''} onChange={e => handleContentChange('heroButtonText', e.target.value)} required />
            <ImageUpload 
                name="heroImage" 
                label="Achtergrondafbeelding" 
                help="De grote afbeelding op de achtergrond van de hero sectie." 
                currentUrl={content.heroImage?.url} 
                alt={content.heroImage?.alt} 
                onAltChange={e => handleContentChange('heroImage.alt', e.target.value)} 
                onImageChange={file => handleImageUpload(file, 'heroImage.url')}
                onUrlChange={url => handleImageSelect(url, 'heroImage.url')} 
                required 
            />
        </>
    );
};

export default HeroTab;