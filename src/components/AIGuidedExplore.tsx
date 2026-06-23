import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Spec } from '../types';

const PLACEHOLDERS = [
  "I need a system prompt for an OpenClaw agent...",
  "Create a Soul.md for my ClaudeCode project...",
  "Write a skill.md for my agent's new capabilities...",
  "I need a custom instruction set for ChatGPT...",
  "Draft a Codex prompt for a Python script..."
];

interface AIGuidedExploreProps {
  onGenerate: (spec: Spec) => void;
}

export function AIGuidedExplore({ onGenerate }: AIGuidedExploreProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `You are an expert prompt engineer and AI architect for 'Prompt Factory'. 
The user will describe what they need. They might ask for a system prompt for an agent, a 'Soul.md' for ClaudeCode, a 'skill.md' for agent skills, custom instructions for ChatGPT, or a Codex prompt.
Your job is to generate a highly structured, professional, and comprehensive prompt template for their specific use case.
Use markdown formatting. Include clear placeholders like [INSERT_HERE] or {{VARIABLE}} for them to fill out later.
Return ONLY the raw markdown template. Do not include conversational filler before or after the markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const generatedContent = response.text || "Failed to generate template.";

      // Extract a title from the first line or use a default
      let title = 'AI Generated Template';
      const firstLine = generatedContent.split('\n')[0];
      if (firstLine && firstLine.startsWith('#')) {
        title = firstLine.replace(/^#+\s*/, '').substring(0, 50);
      } else if (input.length < 40) {
        title = input;
      }

      const newSpec: Spec = {
        id: Date.now().toString(),
        author: 'Prompt Factory AI',
        authorHandle: 'ai_system',
        title: title,
        content: generatedContent,
        provider: 'Gemini',
        templateType: 'AI Generated',
        visibility: 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['ai-generated', 'template'],
        fork_of: null,
        forks: 0,
        lastRefined: 'Just now',
        isFavorite: false,
      };

      onGenerate(newSpec);
    } catch (error) {
      console.error("Generation error:", error);
      alert("An error occurred while generating the template. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] max-w-3xl mx-auto px-4 animate-fade-in">
      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8">
        <Bot size={32} className="text-accent" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 text-center tracking-tight">
        What are we building today?
      </h2>
      <p className="text-text-secondary text-center mb-12 max-w-xl text-lg">
        Describe your use case, and I'll craft a tailored prompt template for you.
      </p>

      <div className="w-full relative">
        <div className="relative bg-surface border border-border rounded-2xl p-2 flex items-center shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            className="w-full bg-transparent border-none px-4 py-4 text-lg text-text-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="bg-accent text-white p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[56px]"
          >
            {isGenerating ? (
              <Sparkles size={24} className="animate-pulse" />
            ) : (
              <ArrowRight size={24} />
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {['OpenClaw Agent', 'ClaudeCode Soul.md', 'Agent skill.md', 'ChatGPT Custom Instructions'].map((tag) => (
          <button 
            key={tag}
            onClick={() => setInput(`I need a template for ${tag}`)}
            className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-text-secondary hover:text-text-primary hover:border-gray-400 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
