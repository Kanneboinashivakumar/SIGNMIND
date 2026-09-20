import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';
import { bestScoreForSign, isLessonCleared } from '../store/progress';
import { SIGN_ORDER } from '../data/signCatalog';
import { PASS_THRESHOLD } from '../vision/types';

export const MissionsView: React.FC = () => {
  const { lessons, attemptsHistory, signDNA, xp, level, setActiveTab, setTargetSign } = useSignMindStore();
  const coreLessons = SIGN_ORDER.map((name) => lessons.find((l) => l.signName === name)).filter(
    (l): l is NonNullable<typeof l> => Boolean(l)
  );
  const cleared = coreLessons.filter(isLessonCleared).length;
  const goal = SIGN_ORDER.length;

  // Real live telemetry for Restaurant Quest
  const questAttempts = attemptsHistory.filter(
    (a) => a.signId === 'RESTAURANT QUEST' || a.signId === 'FOOD'
  );
  const questBest =
    questAttempts.length > 0
      ? questAttempts.reduce((m, a) => Math.max(m, a.overallScore), 0)
      : null;
  const isQuestCleared = questBest !== null && questBest >= PASS_THRESHOLD;

  return (
    <div className="w-full px-4 md:px-margin-tablet xl:px-margin-desktop py-4 md:py-unit-xl max-w-[960px] mx-auto flex flex-col gap-unit-lg">
      <div>
        <h1 className="font-headline-lg font-extrabold m-0">Missions</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Complete the 6 core conversational signs to master everyday American Sign Language dialogue, or take on the 6-phase Restaurant Quest scenario for bonus XP.
        </p>
      </div>

      {/* 6 Core Signs Progress Section */}
      <div className="rounded-2xl bg-surface-container-low p-unit-lg border border-white/10">
        <div className="flex justify-between mb-2">
          <span className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">checklist</span>
            Clear all 6 conversational signs
          </span>
          <span className="text-primary-container font-extrabold font-mono">
            {cleared} / {goal} CORE SIGNS
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-primary-container transition-all duration-500"
            style={{ width: `${goal ? (cleared / goal) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          A sign counts when overall ≥ {PASS_THRESHOLD}% on a real camera attempt.
        </p>
      </div>

      {/* 6 Core Signs Checklist */}
      <div className="flex flex-col gap-2">
        {SIGN_ORDER.map((name) => {
          const lesson = lessons.find((l) => l.signName === name);
          if (!lesson) return null;
          const best = bestScoreForSign(attemptsHistory, name);
          const isCleared = isLessonCleared(lesson);
          return (
            <button
              key={name}
              disabled={lesson.status === 'locked'}
              onClick={() => {
                setTargetSign(name);
                setActiveTab('practice');
              }}
              className={`text-left p-unit-md rounded-xl border transition-all cursor-pointer ${
                isCleared
                  ? 'bg-surface-container border-emerald-500/20 hover:border-emerald-500/40'
                  : 'bg-surface-container border-white/5 hover:border-white/20'
              } disabled:opacity-50`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-base ${
                      isCleared ? 'text-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {isCleared ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="font-bold">{name}</span>
                </div>
                <span className="text-sm text-on-surface-variant font-mono">
                  {lesson.status}
                  {best !== null ? ` · best ${best}%` : ' · no attempt'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Separator */}
      <div className="flex items-center gap-4 my-1">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30">
          <span className="material-symbols-outlined text-sm">stars</span> BONUS QUEST
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Large Visually Distinct Restaurant Quest Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1d2d] via-surface-container to-[#151923] p-unit-lg border-2 border-amber-500/30 shadow-2xl hover:border-amber-500/50 transition-all flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-3 flex-1 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs tracking-wider uppercase border border-amber-500/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">restaurant</span>
              BONUS CHALLENGE
            </span>
            <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary-container font-extrabold text-xs tracking-wider uppercase border border-primary-container/30">
              +150 BONUS XP
            </span>
            {isQuestCleared && (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 font-bold text-xs border border-emerald-500/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                COMPLETED
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-on-surface m-0 flex items-center gap-2">
              <span>🍽️</span> RESTAURANT QUEST
            </h2>
            <div className="text-sm font-bold text-amber-400 mt-0.5">
              Order at a restaurant · 6-Phase Dining Conversation Scenario
            </div>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Perform a complete conversational dining interaction: greet the server (<em className="text-on-surface not-italic font-semibold">&ldquo;HELLO&rdquo;</em>), ask politely (<em className="text-on-surface not-italic font-semibold">&ldquo;PLEASE&rdquo;</em>), inquire about recommendations (<em className="text-on-surface not-italic font-semibold">&ldquo;WHAT&rdquo;</em>), reference your meal (<em className="text-on-surface not-italic font-semibold">&ldquo;FOOD&rdquo;</em>), express courtesy (<em className="text-on-surface not-italic font-semibold">&ldquo;THANK YOU&rdquo;</em>), and confirm your satisfaction (<em className="text-on-surface not-italic font-semibold">&ldquo;GOOD!&rdquo;</em>).
            </p>
          </div>

          {/* Sequence Steps Breakdown */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-on-surface-variant pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">1</span> Greet: Wave (HELLO)
            </span>
            <span className="text-on-surface-variant/40 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">2</span> Polite: Circle (PLEASE)
            </span>
            <span className="text-on-surface-variant/40 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">3</span> Ask: Palms Up (WHAT)
            </span>
            <span className="text-on-surface-variant/40 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">4</span> Meal: Tap Lips (FOOD)
            </span>
            <span className="text-on-surface-variant/40 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">5</span> Thanks: Chin Outward
            </span>
            <span className="text-on-surface-variant/40 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/5 flex items-center gap-1.5">
              <span className="text-primary font-black">6</span> Enjoy: Thumbs Up (GOOD)
            </span>
          </div>

          {/* Real Live Attempt Score */}
          <div className="text-xs text-on-surface-variant flex items-center gap-2 pt-1 font-mono">
            <span className="material-symbols-outlined text-sm text-secondary">insights</span>
            <span>
              {questBest !== null ? (
                <>
                  Best Attempt: <strong className={isQuestCleared ? 'text-primary-container' : 'text-amber-400'}>{questBest}%</strong>
                  {isQuestCleared ? ' · Passed! Bonus XP Claimed' : ` · Needs ≥${PASS_THRESHOLD}% on camera attempt`}
                </>
              ) : (
                'No recorded attempts yet · Complete live camera attempt to earn +150 XP'
              )}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center sm:items-end justify-center gap-2 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => {
              setTargetSign('RESTAURANT QUEST');
              setActiveTab('practice');
            }}
            className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-primary-container hover:bg-primary-container/90 text-on-primary-fixed font-black text-sm uppercase tracking-wider cursor-pointer shadow-[0_0_24px_rgba(0,245,160,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <span>{isQuestCleared ? 'Practice Again' : 'Start Quest'}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono">
            Scored live with MediaPipe DTW
          </span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="text-sm text-on-surface-variant">
        Level {level} · {xp} XP · SignDNA attempts {signDNA.synapseRuns}
        {' · '}
        <button className="text-secondary font-bold cursor-pointer hover:underline" onClick={() => setActiveTab('signdna')}>
          Open SignDNA
        </button>
      </div>
    </div>
  );
};
