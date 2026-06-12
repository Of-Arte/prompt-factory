import React from 'react';
import { Spec } from '../types';
import { SpecCard } from './SpecCard';

interface FeedProps {
  specs: Spec[];
  onSpecClick: (spec: Spec) => void;
  title?: string;
  description?: string;
}

export function Feed({ 
  specs, 
  onSpecClick, 
  title = "Explore Prompts", 
  description = "Discover and fork community-built LLM prompts and templates." 
}: FeedProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto pb-32">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
        <p className="text-text-secondary mt-2">{description}</p>
      </div>
      
      {specs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface border border-border rounded-2xl text-center">
          <p className="text-text-secondary">No prompts found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {specs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} onClick={onSpecClick} />
          ))}
        </div>
      )}
    </div>
  );
}
