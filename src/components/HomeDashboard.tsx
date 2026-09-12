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

  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-unit-xl flex flex-col gap-unit-2xl max-w-[1440px] mx-auto">
      <section className="relative w-full rounded-2xl bg-surface-container-low overflow-hidden shadow-2xl border border-white/5">
        <div className="relative z-10 p-unit-lg md:p-unit-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-unit-xl">
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
            <h1 className="font-headline-lg md:font-display-hero text-on-surface tracking-tight font-extrabold">
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
  );
};
