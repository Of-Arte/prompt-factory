import React from 'react';
import Markdown from 'react-markdown';
import { Spec } from '../types';
import { Clock, Cpu, LayoutTemplate, Star } from 'lucide-react';

interface SpecCardProps {
  spec: Spec;
  onClick: (spec: Spec) => void;
}

export function SpecCard({ spec, onClick }: SpecCardProps) {
  return (
    <div 
      onClick={() => onClick(spec)}
      className="bg-surface border border-border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group"
    >
      {spec.isFavorite && (
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2.5 py-1 rounded-full w-fit">
            <Star size={12} className="fill-yellow-700 dark:fill-yellow-500" /> Favorite
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-accent transition-colors">
        {spec.title || 'Untitled Prompt'}
      </h3>
      
      {/* Markdown preview — clipped to ~4 lines */}
      <div className="relative mb-4 overflow-hidden max-h-[5.5rem]">
        <div className="text-text-secondary text-sm leading-relaxed card-preview pointer-events-none select-none">
          <Markdown>{spec.content || '*No content provided*'}</Markdown>
        </div>
        {/* Fade-out gradient at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm font-medium mb-4">
        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
          <Cpu size={14} className="text-gray-500 dark:text-gray-400" />
          {spec.provider}
        </span>
        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
          <LayoutTemplate size={14} className="text-gray-500 dark:text-gray-400" />
          {spec.templateType}
        </span>
      </div>

      <div className="flex items-center gap-6 text-text-secondary text-sm font-medium pt-4 border-t border-border">
        <span className="flex items-center gap-1.5">
          <Clock size={16} />
          {spec.lastRefined}
        </span>
        <div className="flex gap-2 ml-auto">
          {spec.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
