import React, { useState } from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import type { LessonNode } from '../types';

export const JourneyMap: React.FC = () => {
  const { lessons, setActiveTab, setTargetSign } = useSignMindStore();
  const [selectedWorld, setSelectedWorld] = useState<number>(1);

  // Filter lessons for selected world
  const currentWorldLessons = lessons.filter((l) => l.world === selectedWorld);

  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(
    currentWorldLessons.find((l) => l.status === 'available' || l.status === 'completed' || l.status === 'perfect') ||
      currentWorldLessons[0] ||
      lessons[0]
  );
  const [modalNode, setModalNode] = useState<LessonNode | null>(null);

  const handleSelectNode = (lesson: LessonNode) => {
    setSelectedNode(lesson);
    if (window.innerWidth < 1024) {
      setModalNode(lesson);
    }
  };

  const handleStartPractice = (lesson: LessonNode) => {
    setModalNode(null);
    if (lesson.status === 'locked') return;
    if (lesson.isBoss) {
      setActiveTab('missions');
    } else {
      setTargetSign(lesson.signName);
      setActiveTab('practice');
    }
  };

  const coreLessons = lessons.filter((l) => l.signName !== 'RESTAURANT QUEST' && l.id !== 'quest-restaurant');
  const questLesson = lessons.find((l) => l.signName === 'RESTAURANT QUEST' || l.id === 'quest-restaurant');
  const clearedCore = coreLessons.filter((l) => l.status === 'completed' || l.status === 'perfect').length;

  return (
    <div className="flex flex-col w-full">

      {/* ════ MOBILE VERTICAL PATH (< xl) ════ */}
      <div className="xl:hidden w-full px-4 pt-4 pb-6 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>terrain</span>
            <span className="font-extrabold text-lg text-on-surface uppercase tracking-tight">MASTERY MOUNTAIN</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">6 signs · Real progress · A more inclusive you.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">{clearedCore} / 6 lessons completed</span>
            <span className="text-primary-container font-bold">{Math.round((clearedCore / 6) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00f5a0] to-[#00e293] rounded-full" style={{ width: `${(clearedCore / 6) * 100}%` }} />
          </div>
        </div>
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-surface-container-highest z-0" />
          {coreLessons.slice(0, 6).map((lesson, idx) => {
            const isCompleted = lesson.status === 'completed' || lesson.status === 'perfect';
            const isAvail = lesson.status === 'available' || lesson.status === 'in_progress';
            const isLocked = lesson.status === 'locked';
            return (
              <div key={lesson.id} className="relative z-10 flex items-center gap-4 py-3">
                <button
                  disabled={isLocked}
                  onClick={() => { if (!isLocked) handleStartPractice(lesson); }}
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-extrabold border-2 transition-all cursor-pointer disabled:cursor-default ${
                    isCompleted ? 'bg-primary-container border-primary-container text-on-primary-fixed shadow-[0_0_16px_rgba(0,245,160,0.4)]'
                    : isAvail ? 'bg-surface-container-high border-primary-container text-primary-container shadow-[0_0_20px_rgba(0,245,160,0.3)]'
                    : 'bg-surface-container border-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {isLocked ? <span className="material-symbols-outlined text-lg">lock</span>
                   : isCompleted ? <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                   : <span className="text-sm font-bold">{idx + 1}</span>}
                </button>
                <div className="flex flex-col flex-1">
                  <span className={`font-bold text-base ${isLocked ? 'text-on-surface-variant' : 'text-on-surface'}`}>{lesson.signName}</span>
                  <span className={`text-xs ${isAvail ? 'text-primary-container' : isCompleted ? 'text-[#00f5a0]' : 'text-on-surface-variant'}`}>
                    {isCompleted ? `Cleared · ${lesson.accuracyPercent}%` : isAvail ? 'Ready to practice' : 'Locked'}
                  </span>
                </div>
                {(isAvail || isCompleted) && (
                  <button onClick={() => handleStartPractice(lesson)} className="shrink-0 w-9 h-9 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {questLesson && (
          <button onClick={() => setActiveTab('missions')} className="w-full rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3 cursor-pointer active:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="flex flex-col text-left flex-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Bonus Quest</span>
              <span className="font-bold text-base text-on-surface">Restaurant Scenario</span>
              <span className="text-xs text-on-surface-variant">Put your skills together in a real 6-phase conversation!</span>
            </div>
            <span className="material-symbols-outlined text-amber-400">arrow_forward</span>
          </button>
        )}
      </div>

      {/* ════ DESKTOP (xl+) — UNCHANGED ════ */}
      <div className="hidden xl:flex xl:flex-col xl:w-full">

      {/* Top Mastery Mountain Navigator Bar */}
      <section className="w-full px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-unit-md bg-surface-container-low/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col gap-unit-md">
          {/* Top Tier: Telemetry breadcrumb & Worlds Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-unit-sm">
            <div className="flex items-center gap-unit-xs">
              <span className="inline-flex p-unit-2xs rounded bg-surface-container-high text-primary-container shadow-sm">
                <span className="material-symbols-outlined text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                  terrain
                </span>
              </span>
              <div className="flex items-baseline gap-unit-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight font-extrabold">
                  Mastery Mountain
                </span>
                <span className="font-label-telemetry text-label-telemetry text-primary-fixed-dim">
                  BIOMETRIC ASCENT MAP
                </span>
              </div>
            </div>

            {/* World Selector Segmented Switcher */}
            <div className="flex items-center gap-unit-2xs bg-surface-container-lowest p-1 rounded-full overflow-x-auto shadow-inner border border-white/5">
              <button
                onClick={() => {
                  setSelectedWorld(1);
                  const w1 = lessons.filter((l) => l.world === 1);
                  setSelectedNode(w1.find((l) => l.signName === 'HELLO') || w1[0]);
                }}
                className={`flex items-center gap-unit-xs px-unit-md py-unit-2xs rounded-full transition-all cursor-pointer ${
                  selectedWorld === 1
                    ? 'bg-surface-container-highest text-primary font-headline-sm text-body-sm shadow-[0_0_16px_rgba(0,245,160,0.2)] font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="whitespace-nowrap">W1: First Connections</span>
              </button>

              <button
                onClick={() => {
                  setSelectedWorld(2);
                  const w2 = lessons.filter((l) => l.world === 2);
                  setSelectedNode(w2[0]);
                }}
                className={`flex items-center gap-unit-xs px-unit-md py-unit-2xs rounded-full transition-all cursor-pointer ${
                  selectedWorld === 2
                    ? 'bg-surface-container-highest text-secondary font-headline-sm text-body-sm shadow-[0_0_16px_rgba(139,92,246,0.2)] font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm'
                }`}
              >
                <span className="material-symbols-outlined text-label-telemetry text-secondary">
                  lock_open
                </span>
                <span className="whitespace-nowrap">W2: Everyday Needs</span>
                <span className="font-label-code-metric text-label-code-metric px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
                  QUEST
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedWorld(3);
                  const w3 = lessons.filter((l) => l.world === 3);
                  setSelectedNode(w3[0]);
                }}
                className={`flex items-center gap-unit-xs px-unit-md py-unit-2xs rounded-full transition-all cursor-pointer ${
                  selectedWorld === 3
                    ? 'bg-surface-container-highest text-error font-headline-sm text-body-sm shadow-[0_0_16px_rgba(244,63,94,0.3)] font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm'
                }`}
              >
                <span className="material-symbols-outlined text-label-telemetry text-error">
                  emergency
                </span>
                <span className="whitespace-nowrap">W3: Vital Situations</span>
              </button>
            </div>
          </div>

          {/* Mountain Stage Progression Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-unit-xs pt-unit-xs">
            <div className="flex flex-col gap-1 p-unit-xs rounded-lg bg-surface-container-high/40 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-label-code-metric text-label-code-metric text-on-surface-variant">01 / STAGE</span>
                <span className="material-symbols-outlined text-label-telemetry text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <span className="font-headline-sm text-body-sm text-on-surface font-bold">Base Camp</span>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-full"></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-unit-xs rounded-lg bg-surface-container-highest/90 shadow-[0_0_20px_rgba(0,245,160,0.15)] relative border border-primary-container/30">
              <div className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary-fixed font-label-code-metric text-[10px] font-extrabold shadow-sm">
                CURRENT
              </div>
              <div className="flex items-center justify-between">
                <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim font-bold">02 / STAGE</span>
                <span className="material-symbols-outlined text-label-telemetry text-primary-container">explore</span>
              </div>
              <span className="font-headline-sm text-body-sm text-primary font-bold">Explorer Zone</span>
              <div className="w-full h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container to-primary-fixed-dim w-3/4 animate-pulse"></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-unit-xs rounded-lg bg-surface-container-high/30 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-label-code-metric text-label-code-metric text-on-surface-variant">03 / STAGE</span>
                <span className="material-symbols-outlined text-label-telemetry text-on-surface-variant">lock</span>
              </div>
              <span className="font-headline-sm text-body-sm text-on-surface-variant">Movement Ridge</span>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-surface-container-highest w-0"></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-unit-xs rounded-lg bg-surface-container-high/30 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-label-code-metric text-label-code-metric text-on-surface-variant">04 / STAGE</span>
                <span className="material-symbols-outlined text-label-telemetry text-on-surface-variant">lock</span>
              </div>
              <span className="font-headline-sm text-body-sm text-on-surface-variant">Precision Summit</span>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-surface-container-highest w-0"></div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-unit-xs rounded-lg bg-surface-container-high/30 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-label-code-metric text-label-code-metric text-secondary">05 / PINNACLE</span>
                <span className="material-symbols-outlined text-label-telemetry text-secondary">military_tech</span>
              </div>
              <span className="font-headline-sm text-body-sm text-on-surface-variant">Sign Master Peak</span>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-surface-container-highest w-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Journey Stage: Interactive Path & Exact Stitch Side Drawer */}
      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-unit-lg grid grid-cols-1 lg:grid-cols-12 gap-unit-lg items-start">
        {/* Left / Center Column: Gamified Winding Pathway */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center relative w-full bg-surface-container-lowest/60 rounded-3xl p-unit-md md:p-unit-xl overflow-hidden shadow-2xl border border-white/5">
          {/* Visual HUD Header for Lesson Path */}
          <div className="w-full flex items-center justify-between pb-unit-md border-b border-white/5">
            <div className="flex items-center gap-unit-xs">
              <span className="w-3 h-3 rounded-full bg-primary-container shadow-[0_0_10px_#00f5a0]"></span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-wider uppercase font-bold">
                Kinetic Node Grid: World 0{selectedWorld}
              </span>
            </div>
            <div className="flex items-center gap-unit-md text-label-code-metric font-label-code-metric">
              <span className="flex items-center gap-1 text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  diamond
                </span>
                140 GEMS
              </span>
              <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                {currentWorldLessons.filter((l) => l.status === 'completed' || l.status === 'perfect').length}/
                {currentWorldLessons.length} NODES
              </span>
            </div>
          </div>

          {/* S-Curved Vector Path Container */}
          <div className="relative w-full max-w-lg min-h-[920px] flex flex-col items-center justify-between py-unit-lg">
            {/* SVG Connecting Kinetic Rail */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 400 920"
            >
              <path
                d="M 200 60 C 290 140, 310 220, 200 300 C 90 380, 80 470, 200 550 C 310 630, 310 720, 200 800"
                stroke="rgba(0, 245, 160, 0.15)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="24"
              />
              <path
                d="M 200 60 C 290 140, 310 220, 200 300 C 90 380, 80 470, 200 550 C 310 630, 310 720, 200 800"
                stroke="#181c24"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
              <path
                d="M 200 60 C 290 140, 310 220, 200 300 C 140 340, 100 400, 110 470"
                stroke="#00f5a0"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeWidth="4"
              />
              <circle cx="200" cy="550" fill="rgba(0, 245, 160, 0.08)" r="32" />
            </svg>

            {/* Dynamic Rendering of Current World Lessons */}
            {currentWorldLessons.map((lesson, idx) => {
              const isSelected = selectedNode?.id === lesson.id;
              const isBoss = lesson.isBoss;
              const isCompleted = lesson.status === 'completed' || lesson.status === 'perfect';
              const isAvailable = lesson.status === 'available';

              const xOffsets = ['', 'translate-x-16 sm:translate-x-24', '-translate-x-16 sm:-translate-x-20', '', 'translate-x-12 sm:translate-x-18', ''];
              const offsetClass = xOffsets[idx % xOffsets.length];

              if (isBoss) {
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectNode(lesson)}
                    className={`relative z-20 flex flex-col items-center group cursor-pointer mt-unit-md transition-transform duration-300 hover:scale-105 ${offsetClass}`}
                  >
                    <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-surface-container-highest via-surface-container to-secondary-container/40 flex items-center justify-center p-2 shadow-[0_0_32px_rgba(255,185,95,0.2)] border border-tertiary-fixed-dim/40">
                      <div className="absolute -top-3 px-unit-sm py-0.5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-label-telemetry text-label-telemetry uppercase font-bold flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          trophy
                        </span>
                        WORLD {selectedWorld} CLIMAX
                      </div>
                      <div className="w-full h-full rounded-xl bg-surface-container-lowest/90 flex flex-col items-center justify-center text-center p-unit-xs">
                        <span className="material-symbols-outlined text-headline-lg text-tertiary-fixed-dim">
                          {lesson.icon}
                        </span>
                        <span className="material-symbols-outlined text-body-sm text-tertiary-fixed-dim -mt-1">
                          {lesson.status === 'locked' ? 'lock' : 'play_arrow'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mt-3 text-center">
                      <span className="font-headline-sm text-body-lg text-on-surface font-bold tracking-tight">
                        {lesson.signName}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant max-w-[260px] mt-0.5">
                        {lesson.meaning}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectNode(lesson)}
                  className={`relative z-20 flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-105 ${offsetClass}`}
                >
                  {isSelected && (
                    <div className="absolute -top-12 flex items-center gap-unit-xs px-unit-md py-1 rounded-full bg-primary-container text-on-primary-fixed font-label-telemetry text-label-telemetry shadow-[0_0_24px_rgba(0,245,160,0.5)] animate-bounce font-bold">
                      <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-ping"></span>
                      <span>ACTIVE LESSON</span>
                    </div>
                  )}

                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center p-1 border transition-all ${
                      isCompleted
                        ? 'bg-surface-container-high border-primary-container/40 shadow-[0_0_24px_rgba(0,245,160,0.35)]'
                        : isSelected
                        ? 'w-24 h-24 bg-primary-container/20 border-2 border-primary-container shadow-[0_0_36px_rgba(0,245,160,0.45)] animate-pulse'
                        : 'bg-surface-container-high/80 border-white/5'
                    }`}
                  >
                    <div
                      className={`w-full h-full rounded-full flex flex-col items-center justify-center ${
                        isCompleted
                          ? 'bg-primary-container text-on-primary-container'
                          : isSelected
                          ? 'bg-primary-container text-on-primary-container shadow-inner'
                          : 'bg-surface-container-highest text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {lesson.icon}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 mt-2 bg-surface-container-low/90 px-unit-xs py-0.5 rounded-full shadow-md border border-white/5">
                    {[1, 2, 3].map((starIdx) => (
                      <span
                        key={starIdx}
                        className={`material-symbols-outlined text-body-sm ${
                          starIdx <= lesson.stars ? 'text-tertiary-fixed-dim' : 'text-on-surface-variant/40'
                        }`}
                        style={{ fontVariationSettings: starIdx <= lesson.stars ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col items-center mt-1">
                    <span className="font-headline-sm text-body-md text-on-surface font-bold tracking-wide">
                      {lesson.signName}
                    </span>
                    <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim">
                      {isCompleted ? `SYNC ${lesson.accuracyPercent}%` : isAvailable ? 'READY FOR PRACTICE' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: EXACT STITCH BIOMETRIC MISSION CONTROL DRAWER */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-unit-md sticky top-24">
          <div className="w-full rounded-3xl bg-surface-container-low/85 backdrop-blur-2xl p-unit-lg shadow-2xl flex flex-col gap-unit-md relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full filter blur-3xl pointer-events-none"></div>

            {/* Header Tagging */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-unit-xs">
                <span className="px-unit-xs py-0.5 rounded-full bg-primary-container text-on-primary-fixed font-label-code-metric text-label-code-metric font-semibold uppercase">
                  NODE 04 / ACTIVE
                </span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface-variant">
                  ASL BASICS
                </span>
              </div>
              <span className="flex items-center gap-1 text-tertiary-fixed-dim font-label-code-metric text-label-code-metric">
                <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                +120 XP REWARD
              </span>
            </div>

            {/* Lesson Title & Sign Description */}
            <div className="flex flex-col gap-unit-xs">
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
                  {selectedNode?.signName || 'HELLO'}
                </h2>
                <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim">
                  MEDIA PIPE 21-PT
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {selectedNode?.meaning ||
                  'Friendly greeting acknowledging another person.'}
              </p>
            </div>

            {/* Exact Vector Kinematic Pose Preview Card from Stitch */}
            <div className="relative w-full h-48 rounded-2xl bg-surface-container-lowest overflow-hidden flex items-center justify-center group shadow-inner border border-white/5">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                alt="Close up biometric spatial camera rendering of hands executing ASL sign for thank you"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6Fzis1vg2nknfa8iQOCQREi9UEivVSnS6PXXZaTGdLH6i8zCBcNj7eRJ9Yt9bcW1mrYzh64892EGuynO6203NHmdMydMJ8nclGQXcDuj5jBsUCA5fdKz9zGdymCXImByjGKR-3eGGW52AOo1ixdaR2zrv9ztVCLej7rHIm9BZYJ0yKTqQWx8jHsqtZuoNcqwSSRaXzSN9idiYgtOAn1ZC0Brp3gB_x55umUOtn7Lg0vSGIP_IDBYF"
              />
              {/* Spatial Vector HUD Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-between p-unit-sm pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-highest/80 backdrop-blur-md text-primary font-label-code-metric text-label-code-metric font-semibold">
                    GHOST AVATAR READY
                  </span>
                  <button
                    onClick={() => setModalNode(selectedNode || currentWorldLessons[3] || lessons[3])}
                    className="p-1 rounded-full bg-surface-container-highest/80 backdrop-blur-md text-on-surface hover:text-primary pointer-events-auto cursor-pointer transition-all flex items-center justify-center"
                    title="Expand Kinematic Model"
                  >
                    <span className="material-symbols-outlined text-body-sm text-primary-container">
                      open_in_full
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-on-surface font-label-code-metric text-label-code-metric">
                  <span className="text-on-surface-variant">
                    TARGET TRAJECTORY: <strong className="text-on-surface font-bold">ARC 15° OUTWARD</strong>
                  </span>
                  <span className="text-primary-fixed-dim">STABILITY LOCK</span>
                </div>
              </div>
            </div>

            {/* SignDNA AI Movement Debugger Alert Card */}
            <div className="w-full rounded-xl bg-surface-container-high/60 p-unit-sm flex items-start gap-unit-xs shadow-md border border-tertiary-container/20">
              <div className="p-1 rounded-lg bg-tertiary-container/30 text-tertiary-fixed-dim shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-body-md">error_outline</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-telemetry text-label-telemetry text-tertiary-fixed-dim uppercase tracking-wider font-bold">
                  SignDNA Debugger Watch
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Common pitfall: <span className="text-primary font-medium">Excess wrist rotation</span> at the release point. Keep palm completely flat facing slightly upward.
                </p>
              </div>
            </div>

            {/* 3-Step Milestone Tracker */}
            <div className="flex flex-col gap-unit-xs">
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase tracking-wider font-semibold">
                Lesson Milestones
              </span>
              <div className="flex flex-col gap-unit-2xs">
                {/* Step 1: Completed */}
                <div className="flex items-center justify-between p-unit-xs rounded-xl bg-surface-container/60 border border-white/5">
                  <div className="flex items-center gap-unit-xs">
                    <span className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
                      <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    </span>
                    <span className="font-body-md text-body-sm text-on-surface">
                      1. Understand Spatial Geometry
                    </span>
                  </div>
                  <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim font-bold">
                    COMPLETED
                  </span>
                </div>
                {/* Step 2: Completed */}
                <div className="flex items-center justify-between p-unit-xs rounded-xl bg-surface-container/60 border border-white/5">
                  <div className="flex items-center gap-unit-xs">
                    <span className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
                      <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    </span>
                    <span className="font-body-md text-body-sm text-on-surface">
                      2. 3D Master Demonstration
                    </span>
                  </div>
                  <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim font-bold">
                    COMPLETED
                  </span>
                </div>
                {/* Step 3: Ready (Current) */}
                <div className="flex items-center justify-between p-unit-xs rounded-xl bg-surface-container-highest shadow-[0_0_16px_rgba(0,245,160,0.15)] border border-primary-container/30">
                  <div className="flex items-center gap-unit-xs">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary animate-pulse">
                      <span className="material-symbols-outlined text-body-sm">videocam</span>
                    </span>
                    <span className="font-headline-sm text-body-sm text-primary font-bold">
                      3. Camera Practice with Video Guide
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-fixed font-label-code-metric text-label-code-metric font-bold">
                    READY
                  </span>
                </div>
              </div>
            </div>

            {/* Big Launch CTA */}
            <div className="flex flex-col gap-unit-xs pt-unit-xs">
              <button
                onClick={() => handleStartPractice(selectedNode || lessons[0])}
                className="w-full py-unit-md rounded-2xl bg-primary-container text-on-primary-fixed font-headline-sm text-body-lg font-extrabold flex items-center justify-center gap-unit-xs shadow-[0_0_32px_-4px_rgba(0,245,160,0.5)] hover:bg-primary-fixed active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-headline-sm">camera</span>
                <span>ENTER CAMERA STUDIO</span>
              </button>
              {selectedNode?.status === 'locked' && (
                <p className="text-center text-xs text-error">Locked — clear the previous sign at 70%+ first.</p>
              )}
              <div className="flex items-center justify-center gap-unit-md text-on-surface-variant font-label-code-metric text-label-code-metric py-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-body-sm">speed</span>
                  EST. TIME: 4 MIN
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-body-sm">sensors</span>
                  60 FPS TRACKING
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Quick Telemetry Card */}
          <div className="w-full rounded-2xl bg-surface-container-lowest/80 p-unit-md shadow-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-unit-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-headline-sm">precision_manufacturing</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-body-sm text-on-surface font-semibold">
                  Sensor Calibration
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Camera: Ultra-HD Ready</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-surface-container-high text-primary font-label-code-metric text-label-code-metric font-bold">
              {lessons.filter((l) => l.status === 'completed' || l.status === 'perfect').length}/{lessons.length} lessons cleared
            </span>
          </div>
        </div>
      </div>

      {/* FULL MODAL PREVIEW FOR SELECTED NODE (THANK YOU / ACTIVE MODEL) */}
      {modalNode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/85 backdrop-blur-2xl animate-fade-in overflow-y-auto"
          onClick={() => setModalNode(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-surface-container-low p-unit-lg shadow-2xl flex flex-col gap-unit-md relative overflow-hidden border border-white/10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full filter blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-unit-xs">
                <span className="px-unit-xs py-0.5 rounded-full bg-primary-container text-on-primary-fixed font-label-code-metric text-label-code-metric font-semibold uppercase">
                  NODE 04 / ACTIVE
                </span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface-variant font-semibold">
                  ASL BASICS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-tertiary-fixed-dim font-label-code-metric text-label-code-metric font-bold">
                  <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  +120 XP REWARD
                </span>
                <button
                  onClick={() => setModalNode(null)}
                  className="p-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-body-lg">close</span>
                </button>
              </div>
            </div>

            {/* Lesson Title & Sign Description */}
            <div className="flex flex-col gap-unit-xs">
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
                  {modalNode.signName}
                </h2>
                <span className="font-label-code-metric text-label-code-metric text-primary-fixed-dim font-bold">
                  MEDIA PIPE 21-PT
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {modalNode.meaning ||
                  'Universal expression of courtesy and gratitude. Moves from the chin forward toward the interlocutor.'}
              </p>
            </div>

            {/* Exact Vector Kinematic Pose Preview Card from Stitch */}
            <div className="relative w-full h-56 rounded-2xl bg-surface-container-lowest overflow-hidden flex items-center justify-center group shadow-inner border border-white/10">
              <img
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                alt="Biometric spatial camera rendering of hands executing ASL sign for thank you"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6Fzis1vg2nknfa8iQOCQREi9UEivVSnS6PXXZaTGdLH6i8zCBcNj7eRJ9Yt9bcW1mrYzh64892EGuynO6203NHmdMydMJ8nclGQXcDuj5jBsUCA5fdKz9zGdymCXImByjGKR-3eGGW52AOo1ixdaR2zrv9ztVCLej7rHIm9BZYJ0yKTqQWx8jHsqtZuoNcqwSSRaXzSN9idiYgtOAn1ZC0Brp3gB_x55umUOtn7Lg0vSGIP_IDBYF"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent flex flex-col justify-between p-unit-sm pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-surface-container-highest/80 backdrop-blur-md text-primary font-label-code-metric text-label-code-metric font-semibold">
                    GHOST AVATAR READY
                  </span>
                  <span className="material-symbols-outlined text-body-sm text-primary-container">
                    view_in_ar
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface font-label-code-metric text-label-code-metric">
                  <span className="text-on-surface-variant">
                    TARGET TRAJECTORY: <strong className="text-on-surface font-bold">ARC 15° OUTWARD</strong>
                  </span>
                  <span className="text-primary-fixed-dim font-bold">STABILITY LOCK</span>
                </div>
              </div>
            </div>

            {/* SignDNA AI Movement Debugger Alert Card */}
            <div className="w-full rounded-xl bg-surface-container-high/60 p-unit-sm flex items-start gap-unit-xs shadow-md border border-tertiary-container/20">
              <div className="p-1 rounded-lg bg-tertiary-container/30 text-tertiary-fixed-dim shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-body-md">error_outline</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-telemetry text-label-telemetry text-tertiary-fixed-dim uppercase tracking-wider font-bold">
                  SignDNA Debugger Watch
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Common pitfall: <span className="text-primary font-medium">Excess wrist rotation</span> at the release point. Keep palm completely flat facing slightly upward.
                </p>
              </div>
            </div>

            {/* Big Launch CTA */}
            <button
              onClick={() => handleStartPractice(modalNode)}
              className="w-full py-unit-md rounded-2xl bg-primary-container text-on-primary-fixed font-headline-sm text-body-lg font-extrabold flex items-center justify-center gap-unit-xs shadow-[0_0_32px_-4px_rgba(0,245,160,0.5)] hover:bg-primary-fixed active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-headline-sm">camera</span>
              <span>ENTER CAMERA STUDIO</span>
            </button>
          </div>
        </div>
      )}
      </div>{/* end xl:flex desktop wrapper */}
    </div>
  );
};
