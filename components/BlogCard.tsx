import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import LazyImage from './ui/LazyImage';
import { Calendar } from 'phosphor-react';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block bg-zinc-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-green-500/10 transition-shadow duration-300">
      <div className="relative overflow-hidden">
        {post.mainImage ? (
          <LazyImage
            src={post.mainImage.url}
            alt={post.mainImage.alt || ''}
            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-48 bg-zinc-700 flex items-center justify-center text-zinc-500">
            Geen afbeelding
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
            <Calendar size={14} />
            <span>{new Date(post.publishedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-500 transition-colors">{post.title}</h3>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
        <span className="font-semibold text-green-500 group-hover:underline">
          Lees meer &rarr;
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;