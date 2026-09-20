import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import {
  bestScoreForSign,
  isLessonCleared,
  nextPracticeLesson,
  previousBestForSign,
  recommendFromDna
} from '../store/progress';
import { SIGN_ORDER } from '../data/signCatalog';

const SIGN_ICONS: Record<string, string> = {
  HELLO: 'waving_hand',
  'THANK YOU': 'favorite',
  PLEASE: 'volunteer_activism',
  SORRY: 'sentiment_dissatisfied',
  YES: 'thumb_up',
  NO: 'thumb_down'
};

export const HomeDashboard: React.FC = () => {
  const {
    userName,
    level,
    levelTitle,
    xp,
    nextLevelXp,
    streakDays,
    signDNA,
    lessons,
    attemptsHistory,
    setActiveTab,
    setTargetSign
  } = useSignMindStore();

  const next = nextPracticeLesson(lessons);
  const rec = recommendFromDna(lessons, signDNA, attemptsHistory);
  const xpPct = nextLevelXp > 0 ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 0;
  const cleared = lessons.filter(isLessonCleared).length;
  const latest = attemptsHistory[0];
  const latestBest = latest ? bestScoreForSign(attemptsHistory, latest.signId) : null;
  const prior = latest ? previousBestForSign(attemptsHistory, latest.signId) : null;

  const openSign = (name: string) => {
    const lesson = lessons.find((l) => l.signName === name);
    if (!lesson || lesson.status === 'locked') return;
    setTargetSign(name);
    setActiveTab('practice');
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const attemptDays = new Set(attemptsHistory.map((a) => a.timestamp.slice(0, 10)));

  const continueName = next?.signName || rec.signName;

  return (
    <div className="w-full flex flex-col gap-0">

      {/* ═══════════════════════════════════════════════════════════
          MOBILE LAYOUT (< xl)
          ═══════════════════════════════════════════════════════════ */}
      <div className="xl:hidden w-full px-4 pt-4 pb-2 flex flex-col gap-4">

        {/* Mobile Header Row: SIGNMIND logo + avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              alt="SIGNMIND"
              className="h-7 w-auto"
              src="/emblem.svg"
            />
            <span className="font-extrabold text-base tracking-tight text-on-surface uppercase">
              SIGNMIND
            </span>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="relative w-9 h-9 rounded-full border-2 border-primary-container/60 overflow-hidden cursor-pointer"
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOS74udIziJ5nrEC-rg31quiTrqcPUuYDBzHVNKVe0_rYCWcEj6YQUs6QeyyW1tFcATYx93uX0AlFf1YkewxYKzVDGbOiykfaekcpnpztAFJKHwTB8_r0whBS6IhsGMk6rJaHlb8ViAb_MrTClDwlhWLm3Nk_XS5NO670OUGU8aK9ueYFGfZK1BMif23kOB8JU4WZSTVSMV2XQdQnhTZUabU0fDqdtMMZwjVh7kakjaruCdJdBs0x"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-container border-2 border-surface" />
          </button>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-[28px] font-extrabold text-on-surface tracking-tight leading-tight">
            Hi, {userName}!
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Small steps. A more inclusive world.
          </p>
        </div>

        {/* Streak Card */}
        <div className="rounded-2xl bg-surface-container-low border border-white/5 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-orange-400 text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-orange-400">
              {streakDays} day streak
            </span>
            <span className="text-xs text-on-surface-variant">
              {streakDays === 0 ? 'Keep practicing!' : 'Keep it up!'}
            </span>
          </div>
        </div>

        {/* Level + XP bar */}
        <div className="rounded-2xl bg-surface-container-low border border-white/5 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-on-surface">
              Level {level} · {levelTitle}
            </span>
            <span className="text-primary-container font-extrabold font-mono">
              {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f5a0] to-[#00e293] rounded-full transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* Continue CTA */}
        <button
          onClick={() => openSign(continueName)}
          className="w-full rounded-2xl bg-primary-container text-on-primary-fixed py-4 px-5 flex flex-col items-start gap-1 cursor-pointer shadow-[0_0_24px_rgba(0,245,160,0.35)] active:scale-[0.98] transition-transform"
        >
          <span className="font-extrabold text-lg tracking-tight">
            Continue: {continueName} →
          </span>
          <span className="text-xs font-medium opacity-80">Watch · Practice · Improve</span>
        </button>

        {/* Recommended For You */}
        <div>
          <span className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">
            Recommended For You
          </span>
          <button
            onClick={() => openSign(rec.signName)}
            className="mt-2 w-full rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
          >
            <div className="relative aspect-[16/7] bg-surface-container-highest w-full overflow-hidden">
              <video
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                src={`/videos/clips/${rec.signName.replace(/ /g, '_')}.mp4`}
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
              <div className="absolute bottom-3 left-3 flex flex-col">
                <span className="font-extrabold text-base text-on-surface">{rec.signName}</span>
                <span className="text-xs text-on-surface-variant">
                  {lessons.find((l) => l.signName === rec.signName)?.meaning || 'Practice this sign'}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-primary-container/90 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </div>
            </div>
            <div className="px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-sm">location_on</span>
              <span className="text-xs text-on-surface-variant">
                First lesson · {lessons.find((l) => l.signName === rec.signName)?.phonetic || ''}
              </span>
            </div>
          </button>
        </div>

        {/* 6-Sign Journey Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">
              Your 6-Sign Journey
            </span>
            <span className="text-xs text-primary-container font-bold">
              {cleared} / 6 completed
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SIGN_ORDER.map((name) => {
              const lesson = lessons.find((l) => l.signName === name);
              const isLocked = lesson?.status === 'locked';
              const isCompleted = lesson?.status === 'completed' || lesson?.status === 'perfect';
              const isAvailable = lesson?.status === 'available' || lesson?.status === 'in_progress';
              return (
                <button
                  key={name}
                  disabled={isLocked}
                  onClick={() => openSign(name)}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border transition-all cursor-pointer disabled:cursor-default ${
                    isCompleted
                      ? 'bg-primary-container/20 border-primary-container/40'
                      : isAvailable
                      ? 'bg-surface-container-high border-primary-container/30 shadow-[0_0_16px_rgba(0,245,160,0.2)]'
                      : 'bg-surface-container-low border-white/5 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary-container/30'
                        : isAvailable
                        ? 'bg-primary-container/20 shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                        : 'bg-surface-container-highest'
                    }`}
                  >
                    {isLocked ? (
                      <span className="material-symbols-outlined text-on-surface-variant text-xl">
                        lock
                      </span>
                    ) : (
                      <span
                        className={`material-symbols-outlined text-xl ${
                          isCompleted
                            ? 'text-primary-container'
                            : isAvailable
                            ? 'text-primary-container'
                            : 'text-on-surface-variant'
                        }`}
                        style={{ fontVariationSettings: isCompleted || isAvailable ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {SIGN_ICONS[name] || 'waving_hand'}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold text-center leading-tight ${
                    isLocked ? 'text-on-surface-variant' : isAvailable ? 'text-primary' : 'text-on-surface'
                  }`}>
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="rounded-2xl bg-surface-container-low border border-white/5 p-4 flex items-start gap-3">
          <span className="text-2xl text-primary-container/80 font-serif leading-none">"</span>
          <p className="text-sm text-on-surface-variant italic">
            Different hands. Same human stories.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP LAYOUT (xl+) — PRESERVED EXACTLY AS BEFORE
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden xl:block w-full px-margin-desktop py-unit-xl max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-unit-2xl">
          {/* Hero Section */}
          <section className="relative w-full rounded-2xl bg-surface-container-low overflow-hidden shadow-2xl border border-white/5">
            <div className="relative z-10 p-unit-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-unit-xl">
              <div className="flex flex-col gap-unit-sm max-w-2xl">
                <div className="flex flex-wrap items-center gap-unit-xs">
                  <div className="flex items-center gap-unit-2xs px-unit-sm py-1 rounded-full bg-surface-container-highest/60 text-primary-container font-label-telemetry border border-primary-container/20">
                    <span>🔥 {streakDays} day streak</span>
                  </div>
                  <div className="px-unit-sm py-1 rounded-full bg-secondary-container/30 text-secondary font-label-telemetry border border-secondary/20">
                    Level {level} · {levelTitle}
                  </div>
                  <span className="text-on-surface-variant font-label-code-metric">
                    {signDNA.synapseRuns === 0
                      ? 'No attempts yet'
                      : `Avg overall ${signDNA.globalPrecision}% · ${signDNA.synapseRuns} attempt${signDNA.synapseRuns === 1 ? '' : 's'}`}
                  </span>
                </div>
                <h1 className="font-display-hero text-on-surface tracking-tight font-extrabold">
                  Hi, <span className="text-primary-container">{userName}</span>.
                </h1>
                <p className="font-body-lg text-on-surface-variant">
                  {signDNA.synapseRuns === 0
                    ? 'Watch a lesson, then try it on camera. Home, SignDNA, and XP all use the same attempt history.'
                    : `Current SignDNA focus: ${signDNA.currentFocus}. Strongest: ${signDNA.biggestStrength}.`}
                </p>
                <div className="flex flex-col gap-unit-2xs w-full max-w-md mt-unit-xs">
                  <div className="flex justify-between font-label-code-metric">
                    <span className="text-on-surface-variant uppercase">Level {level} XP</span>
                    <span className="text-primary-container font-semibold">
                      {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-tertiary-fixed-dim to-primary-container rounded-full"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col gap-unit-md">
                <button
                  onClick={() => openSign(next?.signName || rec.signName)}
                  className="px-unit-xl py-unit-lg rounded-xl bg-primary-container text-on-primary-fixed font-headline-sm shadow-[0_0_32px_-4px_rgba(0,245,160,0.4)] cursor-pointer"
                >
                  Continue · {next?.signName || rec.signName}
                </button>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-unit-md py-1.5 rounded-full border border-white/5">
                  <span className="font-label-code-metric text-[10px] text-tertiary-fixed-dim font-bold mr-1">WEEK</span>
                  {weekDays.map((day, idx) => {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + idx);
                    const key = d.toISOString().slice(0, 10);
                    const on = attemptDays.has(key);
                    return (
                      <div
                        key={key}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          on ? 'bg-primary-container text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setActiveTab('signdna')}
                  className="text-sm text-secondary font-bold cursor-pointer underline"
                >
                  Open SignDNA profile
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-lg">
            <section className="lg:col-span-5 flex flex-col gap-unit-lg">
              <div className="glass-panel rounded-2xl p-unit-lg flex flex-col gap-unit-md border border-white/10">
                <span className="font-label-telemetry text-primary uppercase font-bold">Recommended for You</span>
                <h2 className="font-headline-sm text-on-surface font-bold m-0">{rec.signName}</h2>
                <p className="text-sm text-on-surface-variant">{rec.reason}</p>
                <button
                  onClick={() => openSign(rec.signName)}
                  className="w-full py-unit-sm rounded-xl bg-surface-container-high text-primary font-semibold cursor-pointer border border-primary/20"
                >
                  Start recommended practice
                </button>
              </div>

              <div className="rounded-2xl bg-surface-container-low p-unit-lg flex flex-col gap-unit-md border border-white/10">
                <span className="font-label-telemetry text-primary-container uppercase font-bold">Beat Your Past Self</span>
                {latest ? (
                  <>
                    <h3 className="font-headline-sm m-0">{latest.signId}</h3>
                    <p className="text-sm text-on-surface-variant">
                      Latest overall {latest.overallScore}%. Best for this sign{' '}
                      {latestBest === null ? '—' : `${latestBest}%`}
                      {prior !== null && prior !== latest.overallScore ? ` · previous logged ${prior}%` : attemptsHistory.filter((a) => a.signId === latest.signId).length < 2 ? ' · only one attempt so far' : ''}.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant">Complete an attempt to see a real before/after here.</p>
                )}
              </div>
            </section>

            <section className="lg:col-span-7 flex flex-col gap-unit-lg">
              <div className="rounded-2xl bg-surface-container-low p-unit-lg flex flex-col gap-unit-md border border-white/10">
                <div className="flex justify-between">
                  <h3 className="font-headline-sm m-0">Lesson progress</h3>
                  <span className="font-label-code-metric text-primary-container font-bold">
                    {cleared} / {lessons.length} cleared (≥70%)
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Same completion flags as Journey (`completeLesson`). No separate mission score.
                </p>
                {SIGN_ORDER.map((name) => {
                  const lesson = lessons.find((l) => l.signName === name);
                  if (!lesson) return null;
                  const best = bestScoreForSign(attemptsHistory, name);
                  return (
                    <div key={name} className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                      <span>
                        {name}{' '}
                        <span className="text-on-surface-variant">
                          ({lesson.status}{best !== null ? ` · best ${best}%` : ''})
                        </span>
                      </span>
                      <button
                        disabled={lesson.status === 'locked'}
                        onClick={() => openSign(name)}
                        className="text-primary font-bold disabled:text-on-surface-variant cursor-pointer"
                      >
                        {lesson.status === 'locked' ? 'Locked' : 'Open'}
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => setActiveTab('journey')} className="text-primary font-bold cursor-pointer text-sm">
                  Open full Journey map
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
