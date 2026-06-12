import React from 'react';
import { Plus, Clock, Compass, Star, Settings, Lock, Sun, Moon } from 'lucide-react';
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
  const mainNavItems = [
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'explore', label: 'Explore', icon: <Compass size={20} /> },
    { id: 'favorites', label: 'Favorites', icon: <Star size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, isModal: true },
  ];

  return (
    <div className="hidden sm:flex w-[260px] h-screen sticky top-0 flex-col bg-bg-sidebar border-r border-border">
      <div className="p-4 flex flex-col gap-2">
        {/* Logo / Title */}
        <div className="px-2 pb-4 pt-2">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Prompt Factory</h1>
        </div>


        <button 
          onClick={onCreateSpec}
          className="mt-2 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
        >
          <div className="bg-surface border border-border rounded-md p-1">
            <Plus size={16} />
          </div>
          New Prompt
        </button>

        {/* Main Nav */}
        <div className="mt-2 flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if ((item as any).locked) return;
                if (item.isModal && item.id === 'settings') {
                  onOpenSettings();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                activeTab === item.id && !item.isModal
                  ? 'text-text-primary bg-gray-200/50 dark:bg-gray-800/50' 
                  : (item as any).locked
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {(item as any).locked && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Soon</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Recent Section */}
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
      
      {/* Theme Toggle (bottom) */}
      <div className="mt-auto border-t border-border p-4 flex items-center justify-end">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-text-primary transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
