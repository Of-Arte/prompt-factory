import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { Spec, Provider, TemplateType } from '../types';
import { Pen, FileText, Download, CheckCircle2, ChevronDown, X, Quote, Minimize2, Wand2, RefreshCw, Plus, Copy, Save } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { diffWords } from 'diff';

interface EditorProps {
  spec: Spec;
  onChange: (spec: Spec) => void;
  templates: Record<string, string>;
  onAddTemplate: (name: string, content: string) => void;
  initialPreview?: boolean;
}

const IMAGE_VIDEO_PROVIDERS: Provider[] = ['Grok Imagine', 'Gemini'];
const STANDARD_PROVIDERS: Provider[] = [
  'Claude',
  'Gemini',
  'ChatGPT',
  'Grok',
  'Qwen',
];

export function Editor({ spec, onChange, templates, onAddTemplate, initialPreview = false }: EditorProps) {
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(initialPreview);

  // Enhance Modal State
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [enhanceMode, setEnhanceMode] = useState<'Proofread' | 'Shorten' | 'Structure' | null>(null);
  const [enhancedText, setEnhancedText] = useState('');
  const [targetEnhancedText, setTargetEnhancedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Metrics
  const wordCount = spec.content.trim() ? spec.content.trim().split(/\s+/).length : 0;
  const charCount = spec.content.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  const availableProviders = spec.templateType === 'Image/Video Gen' ? IMAGE_VIDEO_PROVIDERS : STANDARD_PROVIDERS;

  // Ensure provider is valid for the selected template type
  useEffect(() => {
    if (!availableProviders.includes(spec.provider)) {
      onChange({ ...spec, provider: availableProviders[0] });
    }
  }, [spec.templateType, spec.provider, availableProviders, onChange]);

  // Simulated Streaming Effect for Enhance Modal
  useEffect(() => {
    if (!isGenerating || !targetEnhancedText) return;
    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 10) + 5;
      if (currentLength >= targetEnhancedText.length) {
        setEnhancedText(targetEnhancedText);
        setIsGenerating(false);
        clearInterval(interval);
      } else {
        setEnhancedText(targetEnhancedText.slice(0, currentLength));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isGenerating, targetEnhancedText]);

  const handleRunEnhance = async (mode: 'Proofread' | 'Shorten' | 'Structure') => {
    setEnhanceMode(mode);
    setEnhancedText('');
    setShowDiff(true);
    setIsGenerating(true);

    const input = spec.content || '';

    if (!input.trim()) {
      setTargetEnhancedText("Please enter a prompt first to see the magic!");
      setIsGenerating(false);
      return;
    }

    try {
      // Use the Gemini API key from environment variables
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

      let systemInstruction = "";
      if (mode === 'Proofread') {
        systemInstruction = "You are an expert editor. Proofread the following prompt for grammar, spelling, and clarity. Do not change the core meaning. Return ONLY the corrected text.";
      } else if (mode === 'Shorten') {
        systemInstruction = "You are an expert editor. Shorten the following prompt to be concise and punchy while retaining the core instructions. Return ONLY the shortened text.";
      } else if (mode === 'Structure') {
        systemInstruction = "You are an expert editor. Add proper Markdown semantic structure and formatting (such as headings, lists, bold text, and code blocks where appropriate) to the following text. Do not change the core meaning. Return ONLY the structured text.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      setTargetEnhancedText(response.text || "Failed to generate enhancement.");
    } catch (error) {
      console.error("Enhancement error:", error);
      setTargetEnhancedText("An error occurred while enhancing the prompt. Please check your API key or try again later.");
    }
  };

  const handleInsertEnhanced = () => {
    onChange({ ...spec, content: enhancedText });
    setShowEnhanceModal(false);
    setMessage({ type: 'success', text: `Prompt enhanced with ${spec.provider}!` });
  };

  const diffs = useMemo(() => {
    if (!enhancedText || isGenerating) return [];
    return diffWords(spec.content, enhancedText);
  }, [spec.content, enhancedText, isGenerating]);

  const diffPercentage = useMemo(() => {
    if (!diffs.length) return Math.floor(Math.random() * 15) + 5;
    let changedChars = 0;
    let totalChars = 0;
    diffs.forEach(part => {
      if (part.added || part.removed) {
        changedChars += part.value.length;
      }
      if (!part.removed) {
        totalChars += part.value.length;
      }
    });
    return totalChars === 0 ? 0 : Math.round((changedChars / totalChars) * 100);
  }, [diffs]);

  // When template changes, if content is empty or matches another template, update it.
  const handleTemplateChange = (newTemplate: TemplateType) => {
    const currentTemplateContent = templates[spec.templateType] || '';
    const isContentEmptyOrUnchanged = !spec.content || spec.content.trim() === '' || spec.content === currentTemplateContent;

    onChange({
      ...spec,
      templateType: newTemplate,
      content: isContentEmptyOrUnchanged ? (templates[newTemplate] || '') : spec.content
    });
  };

  const handleSaveTemplate = () => {
    if (newTemplateName.trim()) {
      onAddTemplate(newTemplateName.trim(), spec.content);
      onChange({ ...spec, templateType: newTemplateName.trim() });
      setShowTemplateModal(false);
      setNewTemplateName('');
      setMessage({ type: 'success', text: 'Template saved successfully!' });
    }
  };

  const handlePublish = () => {
    if (!spec.content || spec.content.trim() === '') {
      setMessage({ type: 'error', text: 'Prompt content cannot be empty.' });
      return;
    }
    onChange({ ...spec, lastRefined: 'Just now' });
    setMessage({ type: 'success', text: 'Prompt ready. Saved to your history.' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(spec.content);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.title || 'prompt'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Exported as Markdown!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const markdownContent = `
# ${spec.title || 'Untitled Prompt'}
**Provider:** ${spec.provider} | **Template:** ${spec.templateType}

---

${spec.content || '*No content provided*'}
  `;

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto pb-32">
      {/* Header / Title */}
      <div className="mb-6">
        <TextareaAutosize
          value={spec.title}
          onChange={(e) => onChange({ ...spec, title: e.target.value })}
          placeholder="Prompt Title"
          className="w-full bg-transparent text-4xl sm:text-5xl font-bold text-text-primary outline-none resize-none placeholder-gray-300 dark:placeholder-gray-600"
        />
      </div>

      {/* Metadata Selectors */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative">
          <select
            value={spec.provider}
            onChange={(e) => onChange({ ...spec, provider: e.target.value as Provider })}
            className="appearance-none bg-surface border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium text-text-primary hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            {availableProviders.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        <div className="relative flex items-center gap-2">
          <div className="relative">
            <select
              value={spec.templateType}
              onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
              className="appearance-none bg-surface border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium text-text-primary hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {Object.keys(templates).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Save current content as a new template"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
          }`}>
          <CheckCircle2 size={20} className={message.type === 'error' ? 'text-red-500' : 'text-green-500'} />
          {message.text}
        </div>
      )}

      {/* Toggle Preview */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <FileText size={16} />
          {showPreview ? 'Edit Prompt' : 'Preview Markdown'}
        </button>
      </div>

      {showPreview ? (
        <div className="spec-preview prose prose-slate max-w-none bg-surface p-8 rounded-2xl shadow-sm border border-border">
          <Markdown>{markdownContent}</Markdown>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TextareaAutosize
            minRows={10}
            value={spec.content}
            onChange={(e) => onChange({ ...spec, content: e.target.value })}
            placeholder="Start typing your prompt here... Use markdown for formatting."
            className="w-full bg-transparent text-lg text-text-primary outline-none resize-none placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
          />

          {/* Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-medium text-text-secondary border-t border-border pt-4 mt-4">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span>~{estimatedTokens} tokens</span>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface shadow-xl border border-border rounded-full p-2 flex items-center gap-2 z-20 max-w-[90vw] overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setShowEnhanceModal(true)}
          className="px-4 py-2 rounded-full text-sm font-bold text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Pen size={16} className="text-accent" />
          Enhance
        </button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-full text-sm font-bold text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Copy size={16} />
          Copy
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-full text-sm font-bold text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <button
          onClick={handlePublish}
          className="bg-text-primary text-bg-primary px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Save size={16} />
          Save
        </button>
      </div>

      {/* Enhance Modal */}
      {showEnhanceModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowEnhanceModal(false)}
        >
          <div
            className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <button onClick={() => setShowEnhanceModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Enhance your post with {spec.provider}</h2>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6">
              <p className="text-lg text-text-primary mb-6 whitespace-pre-wrap">
                {spec.content || "Start typing a prompt to enhance it..."}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                  onClick={() => handleRunEnhance('Proofread')}
                  className={`px-4 py-2 rounded-full border ${enhanceMode === 'Proofread' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'} text-sm font-medium flex items-center gap-2 transition-colors`}
                >
                  <Quote size={16} /> Proofread
                </button>
                <button
                  onClick={() => handleRunEnhance('Shorten')}
                  className={`px-4 py-2 rounded-full border ${enhanceMode === 'Shorten' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'} text-sm font-medium flex items-center gap-2 transition-colors`}
                >
                  <Minimize2 size={16} /> Shorten
                </button>
                <button
                  onClick={() => handleRunEnhance('Structure')}
                  className={`px-4 py-2 rounded-full border ${enhanceMode === 'Structure' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'} text-sm font-medium flex items-center gap-2 transition-colors`}
                >
                  <Wand2 size={16} /> Add Structure
                </button>
              </div>

              {enhanceMode && (
                <div className="animate-fade-in">
                  <div className="h-px w-full bg-border mb-6"></div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-primary">{enhanceMode}</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${showDiff ? 'border-border text-text-secondary bg-surface hover:bg-gray-100 dark:hover:bg-gray-800' : 'border-accent/30 text-accent bg-accent/10'}`}
                      >
                        ± {diffPercentage}%
                      </button>
                      <button
                        onClick={() => handleRunEnhance(enhanceMode)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors"
                      >
                        <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={handleInsertEnhanced}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary font-medium text-sm disabled:opacity-50 transition-colors"
                      >
                        <Plus size={16} /> Insert as post
                      </button>
                    </div>
                  </div>

                  <div className="text-lg text-text-primary leading-relaxed whitespace-pre-wrap">
                    {isGenerating ? (
                      <>
                        {enhancedText}
                        <span className="inline-block w-2 h-5 bg-accent ml-1 animate-pulse align-middle"></span>
                      </>
                    ) : showDiff ? (
                      diffs.map((part, index) => {
                        if (part.added) {
                          return <span key={index} className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-0.5">{part.value}</span>;
                        }
                        if (part.removed) {
                          return <span key={index} className="text-slate-400 dark:text-slate-500 line-through decoration-slate-400/50">{part.value}</span>;
                        }
                        return <span key={index}>{part.value}</span>;
                      })
                    ) : (
                      enhancedText
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-surface w-full max-w-md rounded-2xl shadow-xl p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Save as Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Character Design"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="w-full py-2.5 px-4 bg-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
