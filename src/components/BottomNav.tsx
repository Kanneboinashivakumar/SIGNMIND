import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import type { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSignMindStore();

  // Tab order matches the design reference: Home · Journey · Missions · SignDNA · Practice
  const tabs: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'journey',  label: 'Journey',  icon: 'route' },
    { id: 'missions', label: 'Missions', icon: 'military_tech' },
    { id: 'signdna',  label: 'SignDNA',  icon: 'hub' },
    { id: 'practice', label: 'Practice', icon: 'videocam' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-surface/92 backdrop-blur-2xl border-t border-surface-container-highest/40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around w-full px-1 pt-2 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 cursor-pointer relative"
            >
              {/* Active indicator dot above icon */}
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-container" />
              )}

              {/* Icon container */}
              <div
                className={`flex items-center justify-center w-10 h-6 rounded-full transition-all ${
                  isActive
                    ? 'bg-primary-container/15'
                    : ''
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-all ${
                    isActive
                      ? 'text-primary-container'
                      : 'text-on-surface-variant'
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  {tab.icon}
                </span>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold tracking-wider uppercase transition-all ${
                  isActive ? 'text-primary-container' : 'text-on-surface-variant'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
