import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';

interface NavigationTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
}

const NavigationTab = ({ content, handleContentChange }: NavigationTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Navigatiebalk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <AdminInput name="navHome" label="Home Link" help="Tekst voor de 'Home' link." value={content?.navHome || ''} onChange={e => handleContentChange('navHome', e.target.value)} required />
              <AdminInput name="navServices" label="Diensten Link" help="Tekst voor de 'Diensten' link." value={content?.navServices || ''} onChange={e => handleContentChange('navServices', e.target.value)} required />
              <AdminInput name="navBeforeAfter" label="Voor & Na Link" help="Tekst voor de 'Voor & Na' link." value={content?.navBeforeAfter || ''} onChange={e => handleContentChange('navBeforeAfter', e.target.value)} required />
              <AdminInput name="navGallery" label="Galerij Knop" help="Tekst voor de 'Galerij' knop." value={content?.navGallery || ''} onChange={e => handleContentChange('navGallery', e.target.value)} required />
              <AdminInput name="navContact" label="Contact Link" help="Tekst voor de 'Contact' link." value={content?.navContact || ''} onChange={e => handleContentChange('navContact', e.target.value)} required />
            </div>
        </>
    );
};

export default NavigationTab;