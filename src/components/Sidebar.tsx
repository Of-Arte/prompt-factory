import React, { useState } from 'react';
import { 
  Plus,
  Clock, 
  Compass, 
  Star, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon,
  Github
} from 'lucide-react';
import { Spec } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateSpec: () => void;
  recentItems: Spec[];
  onRecentClick: (spec: Spec) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onCreateSpec,
  recentItems,
  onRecentClick,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainNavItems = [
    { 
      id: 'explore', 
      label: 'Explore', 
      icon: <Compass size={20} /> 
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: <Clock size={20} /> 
    },
    { 
      id: 'favorites', 
      label: 'Favorites', 
      icon: <Star size={20} /> 
    },
  ];

  return (
    <div 
      className={`relative hidden sm:flex h-screen sticky top-0 flex-col bg-bg-sidebar border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-6 h-6 rounded-full border border-border bg-bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary shadow-md cursor-pointer z-50 transition-colors"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Title */}
      <div className={`p-4 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`px-2 pb-4 pt-2 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <h1 className="text-2xl font-cursive font-bold text-text-primary">PF</h1>
          ) : (
            <h1 className="text-3xl font-cursive font-bold text-text-primary whitespace-nowrap">
              Prompt Factory
            </h1>
          )}
        </div>

        {/* New Prompt Button */}
        <button 
          onClick={onCreateSpec}
          className={`w-full flex items-center gap-3 font-medium text-text-primary hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors ${
            isCollapsed ? 'justify-center p-3' : 'px-4 py-3 text-sm'
          }`}
          title={isCollapsed ? "New Prompt" : undefined}
        >
          <div className="bg-surface border border-border rounded-md p-1 shrink-0">
            <Plus size={16} />
          </div>
          {!isCollapsed && <span>New Prompt</span>}
        </button>
      </div>

      <div className="border-t border-border/40 mx-4" />

      {/* Main Nav */}
      <div className="p-4 flex flex-col gap-1.5">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 font-medium ${
                isCollapsed 
                  ? 'justify-center p-3' 
                  : 'px-4 py-3 text-sm'
              } ${
                isActive
                  ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900/30'
                  : 'text-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-text-primary'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={isActive ? 'text-blue-500 dark:text-blue-400' : 'text-text-secondary'}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="border-t border-border/40 mx-4" />

      {/* Secondary Settings Item */}
      <div className="p-4 flex flex-col gap-1.5">
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 font-medium ${
            isCollapsed 
              ? 'justify-center p-3' 
              : 'px-4 py-3 text-sm'
          } text-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-text-primary`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <div className="text-text-secondary">
            <Settings size={20} />
          </div>
          {!isCollapsed && <span>Settings</span>}
        </button>
        <a
          href="https://github.com/Of-Arte/prompt-builder"
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 font-medium ${
            isCollapsed 
              ? 'justify-center p-3' 
              : 'px-4 py-3 text-sm'
          } text-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-text-primary`}
          title={isCollapsed ? "GitHub Repository" : undefined}
        >
          <div className="text-text-secondary">
            <Github size={20} />
          </div>
          {!isCollapsed && <span>GitHub Repo</span>}
        </a>
      </div>

      {/* Recent Section */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-2 hide-scrollbar">
          <h3 className="text-xs font-semibold text-text-secondary mb-3 px-2 uppercase tracking-wider">Recent</h3>
          <div className="flex flex-col gap-1">
            {recentItems.length === 0 ? (
              <div className="px-2 py-2 text-sm text-gray-400 italic">No recent prompts</div>
            ) : (
              recentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onRecentClick(item)}
                  className="w-full text-left px-2 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg truncate transition-colors"
                >
                  {item.title || 'Untitled Prompt'}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Appearance Settings (bottom) */}
      <div className="mt-auto border-t border-border/40 p-4">
        {!isCollapsed && (
          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">
            Appearance
          </div>
        )}
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center gap-3 justify-center rounded-xl border border-border bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 text-text-primary transition-all duration-200 ${
            isCollapsed ? 'p-3' : 'px-4 py-2.5 text-sm font-medium'
          }`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <>
              <Sun size={18} className="text-yellow-500 shrink-0" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={18} className="text-blue-500 shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
