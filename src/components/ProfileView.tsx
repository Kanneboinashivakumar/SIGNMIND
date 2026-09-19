import React, { useState } from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import { soundManager } from '../utils/audio';

interface TrailOption {
  id: 'mint' | 'violet' | 'medic' | 'solar';
  name: string;
  subtitle: string;
  levelRequired: number;
  unlocked: boolean;
  themeColor: string;
  borderGlow: string;
  bgGradient: string;
  particleStyle: string;
  icon: string;
}

export const ProfileView: React.FC = () => {
  const {
    userName,
    userId,
    level,
    levelTitle,
    xp,
    nextLevelXp,
    streakDays,
    gems,
    activeAltitudeMeters,
    activeHandTrail,
    equipHandTrail,
    claimedAchievements,
    claimAchievementReward,
    audioEnabled,
    toggleAudio,
    ghostEnabled,
    toggleGhost,
    useSimulatedCamera,
    setUseSimulatedCamera,
    setActiveTab,
    setTargetSign,
    lessons,
    attemptsHistory
  } = useSignMindStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'mountain' | 'trails' | 'settings'>('overview');

  const cosmeticTrails: TrailOption[] = [
    {
      id: 'mint',
      name: 'Neon Mint Cyber Trail',
      subtitle: 'Standard issue kinetic biometric trail with high-luminance mint glow.',
      levelRequired: 1,
      unlocked: true,
      themeColor: '#00f5a0',
      borderGlow: 'border-primary-container shadow-[0_0_20px_rgba(0,245,160,0.35)]',
      bgGradient: 'from-primary-container/20 to-transparent',
      particleStyle: 'bg-primary-container',
      icon: 'blur_on'
    },
    {
      id: 'medic',
      name: 'Medic Hand Trail',
      subtitle: 'Awarded for conquering World 2 Emergency Response Boss. Vivid dual pulse.',
      levelRequired: 8,
      unlocked: true, // Unlocked from World 2 Boss Victory!
      themeColor: '#f43f5e',
      borderGlow: 'border-error shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      bgGradient: 'from-error/20 to-tertiary-fixed-dim/10',
      particleStyle: 'bg-error',
      icon: 'medical_services'
    },
    {
      id: 'violet',
      name: 'Electric Violet AI Flow',
      subtitle: 'Deep neural vector trail visualizing calculated trajectory splines.',
      levelRequired: 10,
      unlocked: level >= 10,
      themeColor: '#8b5cf6',
      borderGlow: 'border-secondary shadow-[0_0_20px_rgba(139,92,246,0.35)]',
      bgGradient: 'from-secondary/20 to-transparent',
      particleStyle: 'bg-secondary',
      icon: 'auto_fix_high'
    },
    {
      id: 'solar',
      name: 'Solar Plasma Flame',
      subtitle: 'High-energy golden flare trail for users demonstrating 100% cadence consistency.',
      levelRequired: 20,
      unlocked: level >= 20,
      themeColor: '#f59e0b',
      borderGlow: 'border-tertiary-fixed-dim shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      bgGradient: 'from-tertiary-fixed-dim/20 to-transparent',
      particleStyle: 'bg-tertiary-fixed-dim',
      icon: 'local_fire_department'
    }
  ];

  const completedLessons = lessons.filter((l) => l.status === 'completed' || l.status === 'perfect');
  const hasFirstSignCleared = completedLessons.length >= 1;
  const totalCoreLessons = 6;
  const completedCoreCount = lessons.filter(
    (l) => l.world === 1 && l.id !== 'quest-restaurant' && l.signName !== 'RESTAURANT QUEST' && (l.status === 'completed' || l.status === 'perfect')
  ).length;

  const bestAccuracy = Math.max(
    0,
    ...lessons.map((l) => l.accuracyPercent || 0),
    ...(attemptsHistory || []).map((a) => a.overallScore || 0)
  );

  const highAccuracySigns = lessons.filter((l) => (l.accuracyPercent || 0) >= 85 || l.status === 'perfect').length;

  const isQuestCleared = lessons.some(
    (l) =>
      (l.id === 'quest-restaurant' || l.signName === 'RESTAURANT QUEST') &&
      (l.status === 'completed' || l.status === 'perfect' || (l.accuracyPercent || 0) >= 70)
  );

  const achievements = [
    {
      title: 'First Sign Cleared',
      desc: 'Completed your first sign lesson with ≥70% passing accuracy.',
      icon: 'workspace_premium',
      unlocked: hasFirstSignCleared,
      gemsReward: 30,
      xpReward: 300,
      color: hasFirstSignCleared ? 'text-[#00f5a0]' : 'text-on-surface-variant',
      bg: hasFirstSignCleared ? 'bg-[#00f5a0]/20' : 'bg-surface-container-highest',
      progress: hasFirstSignCleared ? 'Completed' : '0/1 Signs (Goal: ≥70%)'
    },
    {
      title: 'Kinematic Master',
      desc: 'Achieved ≥90% accuracy matching the video tutorial reference in Practice Studio.',
      icon: 'fingerprint',
      unlocked: bestAccuracy >= 90,
      gemsReward: 50,
      xpReward: 500,
      color: bestAccuracy >= 90 ? 'text-primary-container' : 'text-on-surface-variant',
      bg: bestAccuracy >= 90 ? 'bg-primary-container/20' : 'bg-surface-container-highest',
      progress: bestAccuracy >= 90 ? 'Mastered' : `Best: ${bestAccuracy}% (Goal: ≥90%)`
    },
    {
      title: 'Streak Keeper',
      desc: 'Maintained active daily sign language practice routines.',
      icon: 'local_fire_department',
      unlocked: streakDays >= 1 || (attemptsHistory && attemptsHistory.length > 0),
      gemsReward: 35,
      xpReward: 350,
      color: 'text-tertiary-fixed-dim',
      bg: 'bg-tertiary-container/20',
      progress: `${Math.max(1, streakDays)} Day Streak`
    },
    {
      title: 'Sign Explorer',
      desc: `Master all ${totalCoreLessons} conversational vocabulary signs in World 1.`,
      icon: 'explore',
      unlocked: completedCoreCount >= totalCoreLessons,
      gemsReward: 40,
      xpReward: 400,
      color: completedCoreCount >= totalCoreLessons ? 'text-secondary' : 'text-on-surface-variant',
      bg: completedCoreCount >= totalCoreLessons ? 'bg-secondary-container/20' : 'bg-surface-container-highest',
      progress: `${completedCoreCount}/${totalCoreLessons} Signs Cleared`
    },
    {
      title: 'Precision Master',
      desc: 'Reach ≥85% accuracy on 3 distinct sign lessons.',
      icon: 'verified',
      unlocked: highAccuracySigns >= 3,
      gemsReward: 60,
      xpReward: 600,
      color: highAccuracySigns >= 3 ? 'text-primary-container' : 'text-on-surface-variant',
      bg: highAccuracySigns >= 3 ? 'bg-primary-container/20' : 'bg-surface-container-highest',
      progress: `${Math.min(3, highAccuracySigns)}/3 Signs (≥85%)`
    },
    {
      title: 'Restaurant Quest Champion',
      desc: 'Conquer the dynamic multi-phrase Restaurant scenario dialogue challenge.',
      icon: 'military_tech',
      unlocked: isQuestCleared,
      gemsReward: 100,
      xpReward: 1000,
      color: isQuestCleared ? 'text-amber-400' : 'text-on-surface-variant',
      bg: isQuestCleared ? 'bg-amber-400/20' : 'bg-surface-container-highest',
      progress: isQuestCleared ? 'Scenario Mastered' : 'Scenario Incomplete'
    }
  ];

  const handleClaim = (ach: typeof achievements[0]) => {
    claimAchievementReward(ach.title, ach.gemsReward, ach.xpReward);
  };

  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-unit-xl flex flex-col gap-unit-2xl max-w-[1440px] mx-auto animate-in fade-in duration-300">
      {/* 1. PROFILE MASTHEAD HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-unit-lg md:p-unit-2xl shadow-xl border border-white/5">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-unit-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-unit-xl text-center sm:text-left">
            {/* Avatar with Glow Ring */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary-container via-secondary to-tertiary-fixed-dim shadow-[0_0_30px_rgba(0,245,160,0.35)]">
                <img
                  alt="Profile avatar"
                  className="w-full h-full rounded-full object-cover bg-surface-container-lowest"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOS74udIziJ5nrEC-rg31quiTrqcPUuYDBzHVNKVe0_rYCWcEj6YQUs6QeyyW1tFcATYx93uX0AlFf1YkewxYKzVDGbOiykfaekcpnpztAFJKHwTB8_r0whBS6IhsGMk6rJaHlb8ViAb_MrTClDwlhWLm3Nk_XS5NO670OUGU8aK9ueYFGfZK1BMif23kOB8JU4WZSTVSMV2XQdQnhTZUabU0fDqdtMMZwjVh7kakjaruCdJdBs0x"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold text-xs shadow-lg border-2 border-surface-container-low">
                ✓
              </span>
            </div>

            {/* Persona Details */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-unit-xs">
                <span className="px-unit-sm py-0.5 rounded-full bg-surface-container-highest text-primary font-label-code-metric text-xs uppercase font-bold">
                  {userId}
                </span>
                <span className="px-unit-sm py-0.5 rounded-full bg-tertiary-container/30 text-tertiary-fixed-dim font-label-telemetry text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-body-sm">local_fire_department</span>
                  {streakDays} DAY STREAK
                </span>
                <span className="px-unit-sm py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-code-metric text-xs uppercase font-bold">
                  OPTICAL 60 FPS
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg md:text-display-hero text-on-surface font-extrabold tracking-tight mt-1">
                {userName}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-unit-xs">
                <span className="font-headline-sm text-body-lg text-primary-container font-bold">
                  Level 0{level} · {levelTitle}
                </span>
                <span className="text-on-surface-variant">•</span>
                <span className="text-on-surface-variant font-label-telemetry text-xs uppercase">
                  Mastery Mountain Explorer
                </span>
              </div>

              {/* Currencies & Balances */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-unit-md mt-unit-sm">
                <div className="flex items-center gap-1.5 bg-surface-container px-unit-md py-1.5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    diamond
                  </span>
                  <span className="font-label-telemetry font-bold text-tertiary-fixed-dim">{gems} GEMS</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container px-unit-md py-1.5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-primary-container text-body-md">
                    military_tech
                  </span>
                  <span className="font-label-telemetry font-bold text-primary">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container px-unit-md py-1.5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-secondary text-body-md">
                    terrain
                  </span>
                  <span className="font-label-telemetry font-bold text-secondary">{activeAltitudeMeters.toLocaleString()}m ALTITUDE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-col gap-unit-xs w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                setTargetSign('THANK YOU');
                setActiveTab('practice');
              }}
              className="w-full sm:w-auto px-unit-xl py-unit-md rounded-full bg-primary-container hover:bg-primary-fixed text-on-primary-fixed font-headline-sm text-body-md font-bold transition-all shadow-[0_0_24px_rgba(0,245,160,0.35)] flex items-center justify-center gap-unit-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-body-lg">videocam</span>
              <span>ENTER PRACTICE STUDIO</span>
            </button>
            <button
              onClick={() => setActiveTab('signdna')}
              className="w-full sm:w-auto px-unit-xl py-unit-sm rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm transition-all flex items-center justify-center gap-unit-xs cursor-pointer border border-white/5"
            >
              <span className="material-symbols-outlined text-body-md">hub</span>
              <span>VIEW SIGNDNA BIOMETRICS</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION PILLS (Overview, Mastery Mountain, Cosmetic Trails, Sensor Controls) */}
      <div className="flex items-center gap-unit-xs overflow-x-auto pb-unit-2xs border-b border-white/5">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-unit-md py-2 rounded-xl font-label-telemetry text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-primary-container text-on-primary-fixed shadow-[0_0_16px_rgba(0,245,160,0.35)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-body-md">dashboard</span>
          <span>OVERVIEW &amp; TROPHIES</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mountain')}
          className={`px-unit-md py-2 rounded-xl font-label-telemetry text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'mountain'
              ? 'bg-primary-container text-on-primary-fixed shadow-[0_0_16px_rgba(0,245,160,0.35)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-body-md">terrain</span>
          <span>MASTERY MOUNTAIN ({activeAltitudeMeters}m)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trails')}
          className={`px-unit-md py-2 rounded-xl font-label-telemetry text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'trails'
              ? 'bg-primary-container text-on-primary-fixed shadow-[0_0_16px_rgba(0,245,160,0.35)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-body-md">auto_fix_high</span>
          <span>COSMETIC HAND TRAILS</span>
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-unit-md py-2 rounded-xl font-label-telemetry text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'settings'
              ? 'bg-primary-container text-on-primary-fixed shadow-[0_0_16px_rgba(0,245,160,0.35)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-body-md">tune</span>
          <span>SENSORS &amp; AUDIO CONTROLS</span>
        </button>
      </div>

      {/* 3. TAB VIEW: OVERVIEW & TROPHY CABINET */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-unit-xl animate-in fade-in duration-200">
          {/* Section: Achievements with Claiming */}
          <section className="flex flex-col gap-unit-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs">
              <div>
                <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-tertiary-fixed-dim uppercase font-bold">
                  <span className="material-symbols-outlined text-body-sm">trophy</span>
                  <span>Hall of Mastery</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
                  Achievements &amp; Milestone Trophies
                </h2>
              </div>
              <span className="font-label-telemetry text-label-telemetry text-primary-container font-bold">
                {achievements.filter((a) => a.unlocked).length} UNLOCKED · {claimedAchievements.length} REWARDS CLAIMED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-unit-md">
              {achievements.map((ach) => {
                const isClaimed = claimedAchievements.includes(ach.title);
                return (
                  <div
                    key={ach.title}
                    className={`rounded-2xl p-unit-lg flex flex-col justify-between transition-all border ${
                      ach.unlocked
                        ? 'bg-surface-container-low hover:bg-surface-container border-white/10 shadow-lg relative overflow-hidden'
                        : 'bg-surface-container-lowest/60 border-white/5 opacity-60'
                    }`}
                  >
                    {ach.unlocked && (
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-unit-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ach.bg} ${ach.color}`}>
                          <span className="material-symbols-outlined text-headline-sm" style={{ fontVariationSettings: ach.unlocked ? "'FILL' 1" : "'FILL' 0" }}>
                            {ach.icon}
                          </span>
                        </div>

                        {ach.unlocked ? (
                          <span className="inline-flex items-center gap-1 text-primary-container font-label-code-metric text-xs uppercase font-bold">
                            <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-code-metric text-xs uppercase font-semibold">
                            <span className="material-symbols-outlined text-body-sm">lock</span>
                            LOCKED
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline-sm text-body-lg text-on-surface font-bold">{ach.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{ach.desc}</p>
                    </div>

                    <div className="mt-unit-md pt-unit-sm border-t border-white/5 flex items-center justify-between gap-unit-xs">
                      <div className="flex items-center gap-unit-xs">
                        <span className="inline-flex items-center gap-1 px-unit-xs py-0.5 rounded-full bg-tertiary-container/20 text-tertiary-fixed-dim font-label-code-metric text-xs font-bold">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                          +{ach.gemsReward}
                        </span>
                        <span className="inline-flex items-center gap-1 px-unit-xs py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-code-metric text-xs font-bold">
                          +{ach.xpReward} XP
                        </span>
                      </div>

                      {ach.unlocked ? (
                        isClaimed ? (
                          <span className="text-on-surface-variant font-label-code-metric text-xs uppercase font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                            CLAIMED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaim(ach)}
                            className="px-unit-sm py-1 rounded-lg bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container font-label-telemetry text-xs font-extrabold transition-all shadow-[0_0_12px_rgba(255,185,95,0.4)] active:scale-95 cursor-pointer"
                          >
                            CLAIM REWARD
                          </button>
                        )
                      ) : (
                        <span className="text-on-surface-variant font-label-code-metric text-xs uppercase">
                          {ach.progress || 'IN PROGRESS'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Banner: Active Cosmetic Trail In Use */}
          <section className="bg-gradient-to-r from-surface-container to-surface-container-low rounded-2xl p-unit-lg border border-white/5 flex flex-col md:flex-row items-center justify-between gap-unit-md">
            <div className="flex items-center gap-unit-md">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest p-2 flex items-center justify-center relative shadow-lg">
                <span className="material-symbols-outlined text-[32px] text-primary-container animate-pulse">
                  auto_fix_high
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-code-metric text-xs text-primary-container uppercase font-bold">
                  Active Cosmetic HUD Particle
                </span>
                <h4 className="font-headline-sm text-body-lg text-on-surface font-bold">
                  {cosmeticTrails.find((t) => t.id === activeHandTrail)?.name || 'Neon Mint Cyber Trail'}
                </h4>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Radiates live from MediaPipe skeletal landmark vectors in Camera Studio &amp; Replay.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('trails')}
              className="px-unit-lg py-unit-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm transition-all flex items-center gap-unit-xs cursor-pointer text-xs font-bold"
            >
              <span>CHANGE TRAIL WARDROBE</span>
              <span className="material-symbols-outlined text-body-md">arrow_forward</span>
            </button>
          </section>
        </div>
      )}

      {/* 4. TAB VIEW: MASTERY MOUNTAIN (ELEVATION RIDGE 4,500m) */}
      {activeSubTab === 'mountain' && (
        <div className="flex flex-col gap-unit-xl animate-in fade-in duration-200">
          <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-unit-lg md:p-unit-xl border border-white/5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-unit-lg mb-unit-lg">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-unit-xs text-primary-container font-label-code-metric text-xs uppercase font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                  Topographical Kinematic Ascent
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                  Mastery Mountain Elevation Ridge
                </h2>
                <p className="font-body-md text-on-surface-variant max-w-2xl">
                  Every sign practice attempt, DTW alignment accuracy, and boss sequence clearance elevates your altitude from the Valley of Foundations toward the Sign Master Summit (4,500m).
                </p>
              </div>

              <div className="bg-surface-container p-unit-md rounded-xl border border-white/5 flex flex-col gap-1 text-right">
                <span className="font-label-code-metric text-xs text-on-surface-variant uppercase">Current Altitude</span>
                <span className="font-display-hero text-headline-lg text-primary-container font-extrabold leading-none">
                  {activeAltitudeMeters.toLocaleString()} <span className="text-body-sm text-on-surface font-mono">/ 4,500m</span>
                </span>
                <span className="text-xs text-secondary font-label-telemetry">
                  {Math.round((activeAltitudeMeters / 4500) * 100)}% of Peak Attained
                </span>
              </div>
            </div>

            {/* Visual Altitude Mountain Ridge Elevation Map */}
            <div className="relative w-full aspect-[21/9] min-h-[280px] bg-surface-container-lowest rounded-xl overflow-hidden border border-white/5 p-unit-md flex flex-col justify-between">
              {/* Background Mountain Contours SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 400">
                <defs>
                  <linearGradient id="mountGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f5a0" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#0f131c" stopOpacity="0.9"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0 380 Q 200 320 350 260 T 650 180 T 850 90 L 1000 40 L 1000 400 L 0 400 Z" fill="url(#mountGrad)"></path>
                <path d="M 0 380 L 250 310 L 480 240 L 720 150 L 920 60 L 1000 40" fill="none" stroke="#00f5a0" strokeDasharray="4 4" strokeWidth="2"></path>
              </svg>

              {/* Waypoints & Basecamps */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {/* Summit */}
                <div className="self-end flex items-center gap-unit-xs bg-surface-container-high/90 backdrop-blur-md px-unit-md py-1.5 rounded-xl border border-tertiary-fixed-dim/40 shadow-lg">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-headline-sm animate-pulse">flag</span>
                  <div className="flex flex-col">
                    <span className="font-label-telemetry text-xs text-tertiary-fixed-dim font-bold uppercase">SIGN MASTER SUMMIT (4,500m)</span>
                    <span className="text-[11px] text-on-surface-variant">World 3 Mastery Trial</span>
                  </div>
                </div>

                {/* Mid Ridge (Basecamp 3) */}
                <div className="self-center translate-x-12 flex items-center gap-unit-xs bg-surface-container-high/90 backdrop-blur-md px-unit-md py-1 rounded-xl border border-white/10 opacity-70">
                  <span className="material-symbols-outlined text-secondary text-body-lg">lock</span>
                  <div className="flex flex-col">
                    <span className="font-label-telemetry text-xs text-secondary font-bold uppercase">BASECAMP 3: KINEMATIC CREST (3,200m)</span>
                    <span className="text-[10px] text-on-surface-variant">Unlocks at Level 10</span>
                  </div>
                </div>

                {/* Current Climber Position (Basecamp 2) */}
                <div className="self-start translate-y-2 flex items-center gap-unit-sm bg-surface-container-lowest/95 backdrop-blur-md px-unit-md py-2 rounded-2xl border-2 border-primary-container shadow-[0_0_24px_rgba(0,245,160,0.5)]">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold animate-bounce">
                    <span className="material-symbols-outlined text-body-md">person_pin</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-telemetry text-xs text-primary-container font-extrabold uppercase">
                      YOU ARE HERE: EXPLORER RIDGE ({activeAltitudeMeters}m)
                    </span>
                    <span className="text-[11px] text-on-surface font-semibold">
                      Zone 2 • 3 milestones remaining to Ridge Ascent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Elevation Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-sm mt-unit-md">
              <div className="p-unit-md rounded-xl bg-surface-container border border-primary-container/30 flex flex-col gap-1">
                <span className="font-label-code-metric text-xs text-primary-container uppercase font-bold">STAGE 01 · COMPLETED</span>
                <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Valley of Foundations</h5>
                <p className="font-body-sm text-xs text-on-surface-variant">0m - 500m • Alphabet, Greetings, Courtesy basics.</p>
              </div>

              <div className="p-unit-md rounded-xl bg-surface-container-high border-2 border-primary-container shadow-[0_0_16px_rgba(0,245,160,0.25)] flex flex-col gap-1">
                <span className="font-label-code-metric text-xs text-primary-container uppercase font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                  STAGE 02 · CURRENT RIDGE
                </span>
                <h5 className="font-headline-sm text-body-lg text-primary-container font-bold">Explorer Ridge</h5>
                <p className="font-body-sm text-xs text-on-surface">500m - 2,000m • Multi-sign conversational orders &amp; tempo.</p>
              </div>

              <div className="p-unit-md rounded-xl bg-surface-container border border-white/5 opacity-60 flex flex-col gap-1">
                <span className="font-label-code-metric text-xs text-on-surface-variant uppercase font-bold">STAGE 03 · LOCKED</span>
                <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Kinematic Crest</h5>
                <p className="font-body-sm text-xs text-on-surface-variant">2,000m - 3,500m • Rapid emergency dispatch sequence.</p>
              </div>

              <div className="p-unit-md rounded-xl bg-surface-container border border-white/5 opacity-60 flex flex-col gap-1">
                <span className="font-label-code-metric text-xs text-tertiary-fixed-dim uppercase font-bold">STAGE 04 · SUMMIT</span>
                <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Sign Master Peak</h5>
                <p className="font-body-sm text-xs text-on-surface-variant">4,500m • Full real-world fluent dialogue simulation.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 5. TAB VIEW: COSMETIC HAND TRAILS (WARDROBE) */}
      {activeSubTab === 'trails' && (
        <div className="flex flex-col gap-unit-xl animate-in fade-in duration-200">
          <section className="flex flex-col gap-unit-md">
            <div>
              <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-secondary uppercase font-bold">
                <span className="material-symbols-outlined text-body-sm">auto_fix_high</span>
                <span>Visual Cosmetics Vault</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
                Equip Dynamic Hand Particle Trails
              </h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl">
                Equipping a trail updates the optical skeletal joint highlights, laser bone connectors, and motion trajectory ribbons rendered across Camera Studio and Cinematic Replays.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-md">
              {cosmeticTrails.map((trail) => {
                const isEquipped = activeHandTrail === trail.id;
                return (
                  <div
                    key={trail.id}
                    className={`rounded-2xl p-unit-lg flex flex-col justify-between transition-all border relative overflow-hidden ${
                      isEquipped
                        ? `${trail.borderGlow} bg-surface-container`
                        : trail.unlocked
                        ? 'bg-surface-container-low hover:bg-surface-container border-white/10'
                        : 'bg-surface-container-lowest/50 border-white/5 opacity-50'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${trail.bgGradient} blur-2xl pointer-events-none`}></div>

                    <div>
                      <div className="flex items-center justify-between mb-unit-sm">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-on-surface shadow-md"
                          style={{ backgroundColor: `${trail.themeColor}33`, color: trail.themeColor }}
                        >
                          <span className="material-symbols-outlined text-headline-sm">{trail.icon}</span>
                        </div>

                        {isEquipped ? (
                          <span
                            className="px-unit-sm py-0.5 rounded-full text-xs font-label-code-metric uppercase font-extrabold shadow-sm"
                            style={{ backgroundColor: `${trail.themeColor}33`, color: trail.themeColor }}
                          >
                            EQUIPPED
                          </span>
                        ) : trail.unlocked ? (
                          <span className="text-on-surface-variant font-label-code-metric text-xs uppercase font-semibold">
                            READY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-code-metric text-xs uppercase">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            LVL {trail.levelRequired}
                          </span>
                        )}
                      </div>

                      <h4 className="font-headline-sm text-body-lg text-on-surface font-bold">{trail.name}</h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">{trail.subtitle}</p>

                      {/* Visual Color Swatch Ribbon */}
                      <div className="mt-unit-md flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest/70 border border-white/5">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: trail.themeColor }}></div>
                        <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-surface-container-highest">
                          <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: trail.themeColor }}></div>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant">{trail.themeColor}</span>
                      </div>
                    </div>

                    <div className="mt-unit-md pt-unit-sm border-t border-white/5">
                      {isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl bg-surface-container-high text-on-surface-variant font-label-telemetry text-xs font-bold cursor-default flex items-center justify-center gap-1 opacity-80"
                        >
                          <span className="material-symbols-outlined text-body-sm">check</span>
                          <span>CURRENTLY EQUIPPED</span>
                        </button>
                      ) : trail.unlocked ? (
                        <button
                          onClick={() => equipHandTrail(trail.id)}
                          className="w-full py-2 rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary-fixed font-label-telemetry text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-body-sm">check_circle</span>
                          <span>EQUIP HUD TRAIL</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant/50 font-label-code-metric text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <span>REQUIRES LEVEL {trail.levelRequired}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* 6. TAB VIEW: SENSORS & AUDIO CONTROLS */}
      {activeSubTab === 'settings' && (
        <div className="flex flex-col gap-unit-xl animate-in fade-in duration-200">
          <section className="bg-surface-container-low rounded-2xl p-unit-lg md:p-unit-xl border border-white/5 flex flex-col gap-unit-lg">
            <div>
              <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-primary-container uppercase font-bold">
                <span className="material-symbols-outlined text-body-sm">settings_suggest</span>
                <span>Hardware &amp; Feedback Calibration</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
                Diagnostics, Audio &amp; Camera Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-md">
              {/* Web Audio API Synthesizer Toggle */}
              <div className="bg-surface-container p-unit-md rounded-xl border border-white/5 flex items-center justify-between gap-unit-md">
                <div className="flex items-center gap-unit-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-headline-sm">{audioEnabled ? 'volume_up' : 'volume_off'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-body-md text-on-surface font-bold">Web Audio API Synth</span>
                    <span className="font-body-sm text-xs text-on-surface-variant">Real-time chord feedback on successful signs, errors, &amp; level ups.</span>
                  </div>
                </div>

                <button
                  onClick={toggleAudio}
                  className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                    audioEnabled ? 'bg-primary-container justify-end' : 'bg-surface-container-highest justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-md"></div>
                </button>
              </div>

              {/* Ghost Guide Overlay Default */}
              <div className="bg-surface-container p-unit-md rounded-xl border border-white/5 flex items-center justify-between gap-unit-md">
                <div className="flex items-center gap-unit-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-headline-sm">front_hand</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-body-md text-on-surface font-bold">Hand Skeleton Guide</span>
                    <span className="font-body-sm text-xs text-on-surface-variant">Live neon hand landmark tracking overlay on webcam.</span>
                  </div>
                </div>

                <button
                  onClick={toggleGhost}
                  className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${
                    ghostEnabled ? 'bg-primary-container justify-end' : 'bg-surface-container-highest justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest shadow-md"></div>
                </button>
              </div>

              {/* Camera Mode: Live Webcam vs Synthetic Demo Stream */}
              <div className="bg-surface-container p-unit-md rounded-xl border border-white/5 flex items-center justify-between gap-unit-md">
                <div className="flex items-center gap-unit-md">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary-fixed-dim flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-headline-sm">smart_display</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-body-md text-on-surface font-bold">Camera Source Mode</span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      {useSimulatedCamera ? 'Synthetic Demo Landmarks (No Webcam required)' : 'Live User Webcam (MediaPipe 21 Landmarks)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playTick();
                    setUseSimulatedCamera(!useSimulatedCamera);
                  }}
                  className={`px-unit-md py-1.5 rounded-xl font-label-telemetry text-xs font-bold transition-all cursor-pointer ${
                    useSimulatedCamera
                      ? 'bg-tertiary-container text-on-tertiary-container'
                      : 'bg-primary-container text-on-primary-fixed'
                  }`}
                >
                  {useSimulatedCamera ? 'SYNTHETIC' : 'LIVE WEBCAM'}
                </button>
              </div>

              {/* PWA & Offline Readiness Indicator */}
              <div className="bg-surface-container p-unit-md rounded-xl border border-white/5 flex items-center justify-between gap-unit-md">
                <div className="flex items-center gap-unit-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-headline-sm">install_mobile</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-body-md text-on-surface font-bold">PWA Offline Readiness</span>
                    <span className="font-body-sm text-xs text-on-surface-variant">Service worker caching enabled for standalone desktop &amp; mobile install.</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-unit-sm py-1 rounded-full bg-primary-container/20 text-primary-container font-label-code-metric text-xs uppercase font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                  READY
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
