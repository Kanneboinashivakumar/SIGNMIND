/**
 * FixMySignCard — Feature 1
 *
 * Dynamically identifies the weakest scoring dimension from a real attempt's
 * MetricScores and presents a targeted coaching message + retry button.
 *
 * Data sources:
 *  - `scores`: actual MetricScores from scoreAttempt() — never mocked
 *  - `coach`: actual coachSentence() output from the coach module
 *  - `onRetry`: calls the existing startAttempt() flow — same sign, new attempt
 *
 * DOES NOT:
 *  - Invent scores
 *  - Hardcode any dimension
 *  - Call LLMs
 *  - Create fake data
 */

import React from 'react';
import type { MetricKey, MetricScores } from '../vision/types';
import { WORTH_MENTIONING } from '../vision/types';
import { metricLabel } from '../vision/diagnosis';

interface Props {
  scores: MetricScores;
  coach: string;
  signName: string;
  onRetry: () => void;
}

const METRIC_ICON: Record<MetricKey, string> = {
  handShape: 'pan_tool',
  position: 'open_with',
  orientation: 'rotate_90_degrees_ccw',
  trajectory: 'route',
  timing: 'timer'
};

const METRIC_DESCRIPTION: Record<MetricKey, string> = {
  handShape: 'The shape and curl of your fingers was the main area to improve.',
  position: 'Where your hand sits in the frame was the main area to improve.',
  orientation: 'Your palm orientation angle was the main area to improve.',
  trajectory: 'The motion path of your hand was the main area to improve.',
  timing: 'The speed and timing of your sign was the main area to improve.'
};

const ALL_METRIC_KEYS: MetricKey[] = [
  'handShape',
  'position',
  'orientation',
  'trajectory',
  'timing'
];

/** Returns the MetricKey with the lowest score. Deterministic — no randomness. */
function weakestMetric(scores: MetricScores): MetricKey {
  return ALL_METRIC_KEYS.reduce((lowest, key) =>
    scores[key] < scores[lowest] ? key : lowest
  );
}

export const FixMySignCard: React.FC<Props> = ({ scores, coach, signName: _signName, onRetry }) => {
  const weakKey = weakestMetric(scores);
  const weakScore = scores[weakKey];
  const label = metricLabel(weakKey);
  const icon = METRIC_ICON[weakKey];
  const description = METRIC_DESCRIPTION[weakKey];

  const isExcellent = weakScore >= WORTH_MENTIONING; // >= 82

  if (isExcellent) {
    // Case B — weakest metric >= 82: Do NOT call it a weakness
    return (
      <div className="rounded-2xl border border-[#00f5a0]/40 bg-[#00f5a0]/10 p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#00f5a0]">emoji_events</span>
          <span className="text-xs font-bold text-[#00f5a0] uppercase tracking-wider">
            Excellent Performance
          </span>
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#00f5a0]/20 border border-[#00f5a0]/30 shrink-0">
            <span className="material-symbols-outlined text-2xl text-[#00f5a0]">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-on-surface">
              All five movement dimensions are strong.
            </span>
            <span className="text-xs text-[#00f5a0] font-medium">
              Lowest metric is {label} at {weakScore}%.
            </span>
          </div>
        </div>

        {/* Coach / Prompt advice */}
        <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/8 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
            Want to improve further?
          </span>
          <p className="text-[11px] text-on-surface leading-snug">{coach}</p>
        </div>

        {/* Retry CTA */}
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold text-sm cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(0,245,160,0.25)] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">replay</span>
          Practice Again
        </button>
      </div>
    );
  }

  // Case A — weakest metric < 82
  const isVeryWeak = weakScore < 55;
  const accentColor = isVeryWeak ? 'text-red-400' : 'text-amber-400';
  const borderColor = isVeryWeak ? 'border-red-500/30' : 'border-amber-400/30';
  const bgColor = isVeryWeak ? 'bg-red-950/40' : 'bg-amber-950/30';
  const iconColor = isVeryWeak ? 'text-red-400' : 'text-amber-400';
  const barColor = isVeryWeak ? 'bg-red-400' : 'bg-amber-400';

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-primary">target</span>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Focus Area
        </span>
      </div>

      {/* Weakest dimension spotlight */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} border ${borderColor} shrink-0`}>
          <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-lg font-extrabold tracking-tight ${accentColor}`}>
            {label} — {weakScore}%
          </span>
          <span className="text-xs text-on-surface-variant leading-tight mt-0.5">{description}</span>
        </div>
      </div>

      {/* Score bar for the weak metric */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
          <span>{label} score</span>
          <span>{weakScore}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${weakScore}%` }}
          />
        </div>
      </div>

      {/* Coach advice from existing coach module — never invented */}
      <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/8">
        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">
          Coach advice
        </span>
        <p className="text-[11px] text-on-surface leading-snug">{coach}</p>
      </div>

      {/* Retry CTA */}
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold text-sm cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(0,245,160,0.25)] flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-base">replay</span>
        Practice Again
      </button>
    </div>
  );
};

