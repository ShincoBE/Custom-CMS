import React, { useState, useEffect } from 'react';
import type { BlogPost } from '../../../types';
import InputWithCounter from './InputWithCounter';
import ImageUpload from './ImageUpload';
import ToggleSwitch from './ToggleSwitch';
import RichTextEditor from './RichTextEditor';

interface BlogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost;
  onSave: (post: BlogPost) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const BlogEditModal = ({ isOpen, onClose, post, onSave, onImageUpload }: BlogEditModalProps) => {
  const [editedPost, setEditedPost] = useState(post);

  useEffect(() => {
    setEditedPost(post);
  }, [post]);
  
  const handleFieldChange = (field: string, value: any) => {
    setEditedPost(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (path: string, value: any) => {
    const keys = path.split('.');
    setEditedPost(prev => {
        const newPost = { ...prev };
        let current: any = newPost;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newPost;
    });
  };
  
  const handleImageUploadWrapper = async (file: File, path: string) => {
      const url = await onImageUpload(file);
      handleImageChange(path, url);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-zinc-800 w-full h-[100dvh] sm:h-[90vh] sm:max-w-4xl sm:rounded-lg sm:shadow-2xl sm:border sm:border-zinc-700 flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-zinc-700 flex-shrink-0 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Blogpost Bewerken</h3>
          <button onClick={onClose} className="sm:hidden text-zinc-400 hover:text-white text-2xl">&times;</button>
        </header>
        <div className="p-6 flex-grow overflow-y-auto">
          <ToggleSwitch
            label="Gepubliceerd"
            help="Zet aan om deze post op de live website te tonen."
            enabled={!!editedPost.published}
            onChange={val => handleFieldChange('published', val)}
          />
          <InputWithCounter 
            name="title" 
            label="Titel" 
            value={editedPost.title} 
            onChange={e => {
                const newTitle = e.target.value;
                const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setEditedPost(prev => ({ ...prev, title: newTitle, slug: newSlug }));
            }} 
            required 
          />
          <InputWithCounter name="slug" label="URL Slug" value={editedPost.slug} onChange={e => handleFieldChange('slug', e.target.value)} required />
          <InputWithCounter as="textarea" name="excerpt" label="Korte Samenvatting" help="Een korte introductie die wordt getoond in het overzicht." value={editedPost.excerpt} onChange={e => handleFieldChange('excerpt', e.target.value)} required />
          <ImageUpload
            name="mainImage"
            label="Hoofdafbeelding"
            help="De afbeelding die bovenaan de post en in het overzicht wordt getoond."
            currentUrl={editedPost.mainImage?.url}
            alt={editedPost.mainImage?.alt}
            onAltChange={e => handleImageChange('mainImage.alt', e.target.value)}
            onImageChange={file => handleImageUploadWrapper(file, 'mainImage.url')}
            required
          />
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Inhoud</label>
            <RichTextEditor value={editedPost.content} onChange={val => handleFieldChange('content', val)} onImageUpload={onImageUpload} />
          </div>
        </div>
        <footer className="p-4 border-t border-zinc-700 flex justify-end space-x-3 flex-shrink-0 bg-zinc-800 sm:rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600">
            Annuleren
          </button>
          <button type="button" onClick={() => onSave(editedPost)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            Opslaan
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BlogEditModal;