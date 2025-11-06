import React, { useState } from 'react';
import type { PageContent } from '../../../types';
import { Plus, Trash, Image, CaretDown } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';
import ImageUpload from '../ui/ImageUpload';

interface ServicesTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
}

const ServicesTab = ({ content, handleContentChange, handleImageUpload }: ServicesTabProps) => {
    const [openedService, setOpenedService] = useState<number | null>(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

    const handleToggleService = (index: number) => {
        setOpenedService(openedService === index ? null : index);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDropTargetIndex(index);
        }
    };
    
    const handleDragLeave = () => {
        setDropTargetIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const list = [...(content.servicesList || [])];
        const draggedItem = list[draggedIndex];
        list.splice(draggedIndex, 1);
        list.splice(dropIndex, 0, draggedItem);
        
        handleContentChange('servicesList', list);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Diensten Sectie</h2>
            <AdminInput name="servicesTitle" label="Titel" help="Titel van de diensten sectie." value={content.servicesTitle!} onChange={e => handleContentChange('servicesTitle', e.target.value)} required showStyler />
            <AdminTextarea name="servicesSubtitle" label="Subtitel" help="Subtitel van de diensten sectie." value={content.servicesSubtitle!} onChange={e => handleContentChange('servicesSubtitle', e.target.value)} required showStyler />
            <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Diensten Lijst</h3>
            <div className="space-y-2">
                {content.servicesList?.map((service, index) => (
                    <div
                        key={service._key}
                        draggable
                        onDragStart={e => handleDragStart(e, index)}
                        onDragOver={e => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`border border-zinc-700 rounded-lg bg-zinc-800/50 transition-all duration-300
                            ${draggedIndex === index ? 'opacity-50' : ''}
                            ${dropTargetIndex === index ? 'border-green-500 scale-105' : ''}
                        `}
                    >
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700/50"
                            onClick={() => handleToggleService(index)}
                        >
                            <div className="flex items-center">
                                {service.customIcon?.url ? (
                                    <img src={service.customIcon.url} alt={service.customIcon.alt || ''} className="w-8 h-8 mr-3 rounded-md object-contain bg-zinc-700 p-1" />
                                ) : (
                                    <div className="w-8 h-8 mr-3 rounded-md bg-zinc-700 flex items-center justify-center text-zinc-400">
                                        <Image size={16} />
                                    </div>
                                )}
                                <span className="font-medium">{service.title}</span>
                            </div>
                            <div className="flex items-center">
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleContentChange('servicesList', content.servicesList?.filter((_, i) => i !== index)) }} className="p-1 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                                <CaretDown size={20} className={`ml-2 transform transition-transform ${openedService === index ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        {openedService === index && (
                            <div className="p-4 border-t border-zinc-700">
                                <AdminInput name={`service-title-${index}`} label="Dienst Titel" value={service.title} onChange={e => handleContentChange(`servicesList.${index}.title`, e.target.value)} required showStyler />
                                <AdminTextarea name={`service-desc-${index}`} label="Dienst Omschrijving" help="" value={service.description} onChange={e => handleContentChange(`servicesList.${index}.description`, e.target.value)} required showStyler />
                                <ImageUpload name={`service-icon-${index}`} label="Icoon" help="Een klein icoon voor deze dienst." currentUrl={service.customIcon?.url} alt={service.customIcon?.alt} onAltChange={e => handleContentChange(`servicesList.${index}.customIcon.alt`, e.target.value)} onImageChange={file => handleImageUpload(file, `servicesList.${index}.customIcon.url`)} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => handleContentChange('servicesList', [...(content.servicesList || []), { _key: `new-${Date.now()}`, title: 'Nieuwe Dienst', description: 'Beschrijving van de nieuwe dienst.', customIcon: { url: '', alt: ''} }])} className="mt-4 inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                <Plus size={16} className="mr-2"/> Dienst Toevoegen
            </button>
        </>
    );
};

export default ServicesTab;
