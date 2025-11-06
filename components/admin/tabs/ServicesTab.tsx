import React, { useState, useMemo } from 'react';
import type { PageContent } from '../../../types';
import { Plus, Trash, Image, CaretDown, MagnifyingGlass, CheckCircle, Prohibit } from 'phosphor-react';
import InputWithCounter from '../ui/InputWithCounter';
import ImageUpload from '../ui/ImageUpload';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';
import SeoFields from '../ui/SeoFields';

interface ServicesTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
}

const ServicesTab = ({ content, handleContentChange, handleImageUpload }: ServicesTabProps) => {
    const [openedService, setOpenedService] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = useMemo(() => {
        if (!content.servicesList) return [];
        if (!searchTerm) return content.servicesList;
        return content.servicesList.filter(service =>
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [content.servicesList, searchTerm]);

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

    const getOriginalIndex = (filteredIndex: number) => {
        const service = filteredServices[filteredIndex];
        return content.servicesList?.findIndex(s => s._key === service._key) ?? -1;
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Diensten Sectie</h2>
            <InputWithCounter name="servicesTitle" label="Titel" help="Titel van de diensten sectie." value={content.servicesTitle!} onChange={e => handleContentChange('servicesTitle', e.target.value)} required showStyler />
            <InputWithCounter as="textarea" name="servicesSubtitle" label="Subtitel" help="Subtitel van de diensten sectie." value={content.servicesSubtitle!} onChange={e => handleContentChange('servicesSubtitle', e.target.value)} required showStyler />
            
            <div className="flex justify-between items-center mt-6 mb-4">
                <h3 className="text-lg font-semibold text-white">Diensten Lijst</h3>
                <div className="relative">
                    <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Zoek dienst..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-zinc-700 border border-zinc-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            <div className="space-y-2">
                {filteredServices?.map((service, index) => {
                    const originalIndex = getOriginalIndex(index);
                    if (originalIndex === -1) return null;
                    return (
                        <div
                            key={service._key}
                            draggable
                            onDragStart={e => handleDragStart(e, originalIndex)}
                            onDragOver={e => handleDragOver(e, originalIndex)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, originalIndex)}
                            onDragEnd={handleDragEnd}
                            className={`border border-zinc-700 rounded-lg bg-zinc-800/50 transition-all duration-300
                                ${draggedIndex === originalIndex ? 'opacity-50' : ''}
                                ${dropTargetIndex === originalIndex ? 'border-green-500 scale-105' : ''}
                            `}
                        >
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700/50"
                                onClick={() => handleToggleService(originalIndex)}
                            >
                                <div className="flex items-center">
                                    {service.published ? <span title="Gepubliceerd"><CheckCircle size={16} className="text-green-500 mr-3" /></span> : <span title="Concept"><Prohibit size={16} className="text-yellow-500 mr-3" /></span>}
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
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleContentChange('servicesList', content.servicesList?.filter((_, i) => i !== originalIndex)) }} className="p-1 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                                    <CaretDown size={20} className={`ml-2 transform transition-transform ${openedService === originalIndex ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            {openedService === originalIndex && (
                                <div className="p-4 border-t border-zinc-700">
                                    <ToggleSwitch
                                        label="Gepubliceerd"
                                        help="Zet aan om deze dienst op de live website te tonen."
                                        enabled={!!service.published}
                                        onChange={val => handleContentChange(`servicesList.${originalIndex}.published`, val)}
                                    />
                                    <InputWithCounter name={`service-title-${originalIndex}`} label="Dienst Titel" value={service.title} onChange={e => handleContentChange(`servicesList.${originalIndex}.title`, e.target.value)} required showStyler />
                                    <InputWithCounter as="textarea" name={`service-desc-${originalIndex}`} label="Dienst Omschrijving" help="Korte omschrijving van de dienst, getoond op de dienstenkaart." value={service.description} onChange={e => handleContentChange(`servicesList.${originalIndex}.description`, e.target.value)} required showStyler />
                                    <ImageUpload name={`service-icon-${originalIndex}`} label="Icoon" help="Een klein icoon voor deze dienst." currentUrl={service.customIcon?.url} alt={service.customIcon?.alt} onAltChange={e => handleContentChange(`servicesList.${originalIndex}.customIcon.alt`, e.target.value)} onImageChange={file => handleImageUpload(file, `servicesList.${originalIndex}.customIcon.url`)} />
                                    
                                    <div className="mt-4 pt-4 border-t border-zinc-600">
                                        <ToggleSwitch
                                            label="Heeft eigen pagina"
                                            help="Zet aan om een aparte, gedetailleerde pagina voor deze dienst aan te maken."
                                            enabled={!!service.hasPage}
                                            onChange={val => handleContentChange(`servicesList.${originalIndex}.hasPage`, val)}
                                        />
                                        {service.hasPage && (
                                            <div className="pl-4 border-l-2 border-zinc-600">
                                                <InputWithCounter 
                                                    name={`service-slug-${originalIndex}`} 
                                                    label="URL Slug" 
                                                    help="Uniek, kort stukje voor de URL. Bv: 'tuinonderhoud'. Geen spaties of speciale tekens."
                                                    value={service.slug || ''} 
                                                    onChange={e => handleContentChange(`servicesList.${originalIndex}.slug`, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                                                    required 
                                                />
                                                <InputWithCounter 
                                                    as="textarea"
                                                    name={`service-pageContent-${originalIndex}`} 
                                                    label="Pagina Inhoud" 
                                                    help="De volledige inhoud voor de aparte dienstpagina. HTML is toegestaan."
                                                    value={service.pageContent || ''} 
                                                    onChange={e => handleContentChange(`servicesList.${originalIndex}.pageContent`, e.target.value)} 
                                                    showStyler
                                                />
                                                <SeoFields
                                                    seo={service.seo}
                                                    onSeoChange={(field, value) => handleContentChange(`servicesList.${originalIndex}.seo.${field}`, value)}
                                                    baseName={`service-${originalIndex}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button type="button" onClick={() => handleContentChange('servicesList', [...(content.servicesList || []), { _key: `new-${Date.now()}`, title: 'Nieuwe Dienst', description: 'Beschrijving van de nieuwe dienst.', published: false, hasPage: false, customIcon: { url: '', alt: ''} }])} className="mt-4 inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600">
                <Plus size={16} className="mr-2"/> Dienst Toevoegen
            </button>
        </>
    );
};

export default ServicesTab;