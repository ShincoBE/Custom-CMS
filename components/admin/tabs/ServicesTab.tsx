import React from 'react';
import type { PageContent } from '../../../types';
import { Plus, Trash } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';
import ImageUpload from '../ui/ImageUpload';

interface ServicesTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
}

const ServicesTab = ({ content, handleContentChange, handleImageUpload }: ServicesTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Diensten Sectie</h2>
            <AdminInput name="servicesTitle" label="Titel" help="Titel van de diensten sectie." value={content.servicesTitle!} onChange={e => handleContentChange('servicesTitle', e.target.value)} required showStyler />
            <AdminTextarea name="servicesSubtitle" label="Subtitel" help="Subtitel van de diensten sectie." value={content.servicesSubtitle!} onChange={e => handleContentChange('servicesSubtitle', e.target.value)} required showStyler />
            <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Diensten Lijst</h3>
            {content.servicesList?.map((service, index) => (
                <div key={service._key} className="p-4 border border-zinc-700 rounded-lg mb-4 bg-zinc-800/50 relative">
                    <AdminInput name={`service-title-${index}`} label="Dienst Titel" value={service.title} onChange={e => handleContentChange(`servicesList.${index}.title`, e.target.value)} required showStyler />
                    <AdminTextarea name={`service-desc-${index}`} label="Dienst Omschrijving" help="" value={service.description} onChange={e => handleContentChange(`servicesList.${index}.description`, e.target.value)} required showStyler />
                    <ImageUpload name={`service-icon-${index}`} label="Icoon" help="Een klein icoon voor deze dienst." currentUrl={service.customIcon?.url} alt={service.customIcon?.alt} onAltChange={e => handleContentChange(`servicesList.${index}.customIcon.alt`, e.target.value)} onImageChange={file => handleImageUpload(file, `servicesList.${index}.customIcon.url`)} />
                    <button type="button" onClick={() => handleContentChange('servicesList', content.servicesList?.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                </div>
            ))}
            <button type="button" onClick={() => handleContentChange('servicesList', [...(content.servicesList || []), { _key: `new-${Date.now()}`, title: 'Nieuwe Dienst', description: 'Beschrijving van de nieuwe dienst.', customIcon: { url: '', alt: ''} }])} className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                <Plus size={16} className="mr-2"/> Dienst Toevoegen
            </button>
        </>
    );
};

export default ServicesTab;
