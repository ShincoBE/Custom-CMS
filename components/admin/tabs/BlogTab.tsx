import React from 'react';
import type { BlogPost } from '../../../types';
import { Plus, Pencil, Trash, CheckCircle, Prohibit, Image as ImageIcon } from 'phosphor-react';
import LazyImage from '../../ui/LazyImage';

interface BlogTabProps {
  blogPosts: BlogPost[];
  setEditingPost: (post: BlogPost | null) => void;
  handleDeletePost: (postId: string) => void;
}

const BlogTab = ({ blogPosts, setEditingPost, handleDeletePost }: BlogTabProps) => {

  const handleCreateNew = () => {
    const newPost: BlogPost = {
      _id: `new-${Date.now()}`,
      title: 'Nieuwe Blogpost',
      slug: 'nieuwe-blogpost',
      excerpt: '',
      content: '',
      published: false,
      publishedAt: new Date().toISOString()
    };
    setEditingPost(newPost);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Blog / Projecten</h2>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <Plus size={16} className="mr-2"/> Nieuwe Post
        </button>
      </div>

      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <ul className="divide-y divide-zinc-700">
          {blogPosts.length > 0 ? blogPosts.map(post => (
            <li key={post._id} className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center flex-grow">
                    {post.mainImage?.url ? (
                        <LazyImage src={post.mainImage.url} alt={post.mainImage.alt || ''} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                    ) : (
                        <div className="w-16 h-12 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 flex-shrink-0"><ImageIcon /></div>
                    )}
                  <div className="ml-4 flex-grow truncate">
                    <p className="font-medium text-white truncate">{post.title}</p>
                    <p className="text-sm text-zinc-400 truncate">{post.excerpt}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-3 self-end sm:self-auto">
                  {post.published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300"><CheckCircle size={14} className="mr-1" /> Gepubliceerd</span>
                  ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300"><Prohibit size={14} className="mr-1" /> Concept</span>
                  )}
                  <button onClick={() => setEditingPost(post)} className="p-1 text-zinc-400 hover:text-green-400"><Pencil size={20} /></button>
                  <button onClick={() => handleDeletePost(post._id)} className="p-1 text-zinc-400 hover:text-red-400"><Trash size={20} /></button>
                </div>
              </div>
            </li>
          )) : (
            <li className="p-4 text-center text-zinc-400">Nog geen blogposts. Klik op 'Nieuwe Post' om te beginnen.</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default BlogTab;