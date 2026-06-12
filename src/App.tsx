/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { Editor } from './components/Editor';
import { AIGuidedExplore } from './components/AIGuidedExplore';
import { Spec } from './types';
import { X } from 'lucide-react';

const INITIAL_TEMPLATES: Record<string, string> = {
  'AGENTS.md': '',
  'Image/Video Gen': `## Subject\n[What is the main subject of the image/video?]\n\n## Style & Aesthetic\n[e.g., Cinematic, 3D Render, Anime, Photorealistic]\n\n## Lighting & Composition\n[e.g., Golden hour, close-up, wide angle]\n\n## Action/Motion (Video)\n[Describe the movement or sequence of events]`
};

const MOCK_SPECS: Spec[] = [
  {
    id: '1',
    author: '',
    authorHandle: '',
    title: 'Gemini Prompt Template',
    content: `## Role
You are a [describe the role, e.g. "senior software engineer", "creative writing coach", "data analyst"].

## Context
[Provide relevant background the model needs to understand the task. Include constraints, prior work, or domain knowledge.]

## Task
[Clearly state what you want Gemini to do. Be specific and action-oriented.]

## Format
[Specify the desired output format: bullet list, JSON, markdown table, code block, numbered steps, etc.]

## Examples (optional)
Input: [example input]
Output: [expected output]

## Constraints
- Keep the response under [N] words / [N] lines
- Avoid [things to exclude]
- Prefer [style or tone preferences]`,
    provider: 'Gemini 3.1 Pro',
    templateType: 'Blank',
    visibility: 'private',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['template', 'gemini', 'starter'],
    fork_of: null,
    forks: 0,
    lastRefined: 'Just now',
    isFavorite: false,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [historyStack, setHistoryStack] = useState<Spec[]>(MOCK_SPECS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Spec | null>(null);
  const [isNewSpec, setIsNewSpec] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [templates, setTemplates] = useState<Record<string, string>>(INITIAL_TEMPLATES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handleAddTemplate = (name: string, content: string) => {
    setTemplates(prev => ({ ...prev, [name]: content }));
  };

  const handleCreateSpec = () => {
    const newSpec: Spec = {
      id: Date.now().toString(),
      author: 'User',
      authorHandle: 'user',
      title: '',
      content: '',
      provider: 'Claude Fable 5',
      templateType: 'Image/Video Gen',
      visibility: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      fork_of: null,
      forks: 0,
      lastRefined: 'Just now',
      isFavorite: false,
    };

    setHistoryStack(prev => [newSpec, ...prev]);
    setEditingSpec(newSpec);
    setIsNewSpec(true);
    setIsEditing(true);
  };

  const handleSpecClick = (spec: Spec) => {
    setEditingSpec(spec);
    setIsNewSpec(false);
    setIsEditing(true);
  };

  const handleSpecChange = (updatedSpec: Spec) => {
    setEditingSpec(updatedSpec);
    setHistoryStack(prev => prev.map(s => s.id === updatedSpec.id ? updatedSpec : s));
  };

  const handleAIGeneratedSpec = (newSpec: Spec) => {
    setHistoryStack(prev => [newSpec, ...prev]);
    setEditingSpec(newSpec);
    setIsEditing(true);
    setActiveTab('history');
  };

  const recentItems = historyStack.slice(0, 8);

  let displayedSpecs = historyStack;
  let feedTitle = "History";
  let feedDescription = "Your recently viewed and edited prompts.";

  if (activeTab === 'favorites') {
    displayedSpecs = historyStack.filter(s => s.isFavorite);
    feedTitle = "Favorites";
    feedDescription = "Your starred prompts.";
  }

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary font-sans pb-16 sm:pb-0">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateSpec={handleCreateSpec}
        recentItems={recentItems}
        onRecentClick={handleSpecClick}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-4xl pt-8 px-4 sm:px-8 h-full">
          {isEditing && editingSpec ? (
            <Editor
              key={editingSpec.id}
              spec={editingSpec}
              onChange={handleSpecChange}
              templates={templates}
              onAddTemplate={handleAddTemplate}
              initialPreview={!isNewSpec}
            />
          ) : activeTab === 'explore' ? (
            <AIGuidedExplore onGenerate={handleAIGeneratedSpec} />
          ) : (
            <Feed
              specs={displayedSpecs}
              onSpecClick={handleSpecClick}
              title={feedTitle}
              description={feedDescription}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border flex justify-around items-center p-3 z-50">
        <button onClick={() => handleTabChange('history')} className={`p-2 ${activeTab === 'history' ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>History</button>
        <button onClick={() => handleTabChange('explore')} className={`p-2 ${activeTab === 'explore' ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>Explore</button>
        <button onClick={handleCreateSpec} className="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mb-4 shadow-lg">+</button>
        <button onClick={() => handleTabChange('favorites')} className={`p-2 ${activeTab === 'favorites' ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>Favorites</button>
        <button onClick={() => setIsSettingsOpen(true)} className={`p-2 ${activeTab === 'settings' ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>Settings</button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-surface w-full max-w-md rounded-2xl shadow-xl p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border">
                <span className="font-medium text-text-primary">Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <p className="text-sm text-text-secondary">More settings coming soon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
