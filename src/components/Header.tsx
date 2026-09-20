import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import type { NavigationTab } from '../types';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    level,
    levelTitle,
    xp,
    nextLevelXp,
    streakDays,
    audioEnabled,
    toggleAudio,
    resetProgress
  } = useSignMindStore();

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'journey', label: 'Journey' },
    { id: 'missions', label: 'Missions' },
    { id: 'signdna', label: 'SignDNA & Analytics' },
    { id: 'practice', label: 'Practice Studio' }
  ];

  const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <header className="hidden xl:block fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-2xl shadow-[0_1px_16px_rgba(0,0,0,0.4)] border-b border-surface-container-highest/30">
      <div className="h-20 w-full px-margin-mobile md:px-margin-tablet xl:px-margin-desktop flex items-center justify-between gap-unit-md">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-unit-md shrink-0 cursor-pointer group"
        >
          <img
            alt="SIGNMIND Brand Emblem"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            src="/emblem.svg"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase font-extrabold">
              SIGNMIND
            </span>
            <div className="flex items-center gap-unit-2xs mt-0.5">
              <span className="inline-flex items-center px-unit-xs py-0.5 rounded-full bg-surface-container-high text-primary-fixed-dim font-label-code-metric text-label-code-metric uppercase tracking-wider font-semibold">
                Movement Debugger
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Pill Bar */}
        <nav className="hidden xl:flex items-center gap-unit-2xs bg-surface-container-lowest/80 p-unit-2xs rounded-full backdrop-blur-xl border border-white/5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-unit-md py-unit-xs rounded-full transition-all text-body-sm cursor-pointer ${
                  isActive
                    ? 'bg-surface-container-highest text-primary font-semibold shadow-[0_0_12px_rgba(0,245,160,0.2)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Telemetry Indicators */}
        <div className="flex items-center gap-unit-md shrink-0">
          {/* Audio toggle button */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Audio cues active' : 'Audio cues muted'}
            className="p-unit-xs rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary-container hover:bg-surface-container transition-all flex items-center justify-center border border-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-body-lg">
              {audioEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Quick Demo Reset for Pitch Recording */}
          <button
            onClick={() => {
              if (window.confirm('Reset prototype for pitch demo? This clears progress, opens HELLO tutorial, and starts fresh.')) {
                resetProgress();
              }
            }}
            title="Reset prototype to beginning (HELLO) for pitching demo"
            className="px-2.5 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-amber-400 hover:bg-surface-container hover:border-amber-400/40 transition-all flex items-center gap-1.5 border border-white/5 cursor-pointer text-xs font-mono"
          >
            <span className="material-symbols-outlined text-sm text-amber-400">restart_alt</span>
            <span className="hidden lg:inline text-[11px] font-bold">RESET DEMO</span>
          </button>

          {/* Streak & XP Widget (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-unit-sm bg-surface-container-low/90 px-unit-md py-unit-xs rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.2)] border border-white/5">
            <div className="flex items-center gap-unit-2xs">
              <span
                className="material-symbols-outlined text-tertiary-fixed-dim text-body-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface font-bold">
                {streakDays}D STREAK
              </span>
            </div>
            <div className="h-4 w-px bg-surface-container-highest"></div>
            <div className="flex flex-col gap-0.5 min-w-[130px]">
              <div className="flex items-center justify-between text-label-code-metric font-label-code-metric">
                <span className="text-on-surface-variant">LVL 0{level} {levelTitle}</span>
                <span className="text-primary-container font-semibold">{xp.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tertiary-fixed-dim to-primary-container rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,245,160,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Profile Avatar Pill */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`relative flex items-center p-0.5 rounded-full border transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-primary-container shadow-[0_0_12px_rgba(0,245,160,0.5)]'
                : 'border-surface-container-highest hover:border-primary/50'
            }`}
          >
            <img
              alt="Profile Avatar"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOS74udIziJ5nrEC-rg31quiTrqcPUuYDBzHVNKVe0_rYCWcEj6YQUs6QeyyW1tFcATYx93uX0AlFf1YkewxYKzVDGbOiykfaekcpnpztAFJKHwTB8_r0whBS6IhsGMk6rJaHlb8ViAb_MrTClDwlhWLm3Nk_XS5NO670OUGU8aK9ueYFGfZK1BMif23kOB8JU4WZSTVSMV2XQdQnhTZUabU0fDqdtMMZwjVh7kakjaruCdJdBs0x"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-container border-2 border-surface shadow-[0_0_6px_#00f5a0]"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
