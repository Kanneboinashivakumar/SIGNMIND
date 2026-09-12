import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import type { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSignMindStore();

  const tabs: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'journey', label: 'Journey', icon: 'route' },
    { id: 'practice', label: 'Practice', icon: 'videocam' },
    { id: 'missions', label: 'Missions', icon: 'military_tech' },
    { id: 'signdna', label: 'SignDNA', icon: 'hub' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-surface/90 backdrop-blur-2xl border-t border-surface-container-highest/40 px-unit-sm py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-container font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-primary-container/15 shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                    : ''
                }`}
              >
                <span
                  className="material-symbols-outlined text-headline-sm"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
              </div>
              <span className="font-label-code-metric text-[10px] tracking-wider uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
