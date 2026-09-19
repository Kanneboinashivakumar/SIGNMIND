/**
 * AttemptComparison — Feature 2: Before vs After
 *
 * Reads the two most recent attempts for the SAME sign from Zustand
 * attemptsHistory and renders a real metric-by-metric comparison.
 *
 * Pairing rule: filter attemptsHistory by signId === currentSignId,
 * sorted newest-first (prepend order). The [0] entry is current, [1] is previous.
 *
 * If fewer than 2 same-sign attempts exist: renders a "complete another attempt" prompt.
 * Does NOT render any data if the previous attempt is for a different sign.
 * Does NOT invent or interpolate scores.
 *
 * Persists automatically — attemptsHistory is stored in localStorage by useSignMindStore.
 */

import React from 'react';
import type { PracticeAttempt } from '../types';
import { MetricComparisonRow } from './MetricComparisonRow';
import type { MetricKey } from '../vision/types';

interface Props {
  /** The sign name currently being practiced (matches signId in PracticeAttempt). */
  signId: string;
  /** Full attempts history from Zustand store — newest first. */
  attemptsHistory: PracticeAttempt[];
  /** MetricKey of the weakest dimension in the current attempt, for highlighting. */
  weakestKey: MetricKey;
}

const METRIC_ROWS: { key: keyof PracticeAttempt; label: string; metricKey: MetricKey }[] = [
  { key: 'handShapeScore', label: 'Hand Shape', metricKey: 'handShape' },
  { key: 'positionScore', label: 'Position', metricKey: 'position' },
  { key: 'orientationScore', label: 'Orientation', metricKey: 'orientation' },
  { key: 'trajectoryScore', label: 'Trajectory', metricKey: 'trajectory' },
  { key: 'timingScore', label: 'Timing', metricKey: 'timing' }
];

/** Dynamic recommendation message based on overall delta */
function recommendationMessage(delta: number): { text: string; icon: string; color: string } {
  if (delta > 0) {
    return {
      text: "You're improving! Keep practicing.",
      icon: 'trending_up',
      color: 'text-[#00f5a0]'
    };
  }
  if (delta < 0) {
    return {
      text: 'Your score decreased this attempt. Review the highlighted weakness and try again.',
      icon: 'trending_down',
      color: 'text-red-400'
    };
  }
  return {
    text: 'Your score stayed the same. Focus on the highlighted weakness and try again.',
    icon: 'trending_flat',
    color: 'text-amber-400'
  };
}

export const AttemptComparison: React.FC<Props> = ({ signId, attemptsHistory, weakestKey }) => {
  // Filter to same-sign attempts only. History is newest-first (prepended by recordAttempt).
  const sameSign = attemptsHistory.filter((a) => a.signId === signId);

  // Edge case: fewer than 2 same-sign attempts
  if (sameSign.length < 2) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-container-lowest/50 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-secondary">compare_arrows</span>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Before vs After
          </span>
        </div>
        <div className="flex items-center gap-2 py-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-2xl text-white/20">hourglass_empty</span>
          <p className="text-xs">
            Complete another <strong className="text-on-surface">{signId}</strong> attempt to see
            your improvement comparison.
          </p>
        </div>
      </div>
    );
  }

  // current = index 0 (newest), previous = index 1
  const current = sameSign[0];
  const previous = sameSign[1];

  const overallDelta = current.overallScore - previous.overallScore;
  const { text: recText, icon: recIcon, color: recColor } = recommendationMessage(overallDelta);

  // Format timestamps for display
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-container-lowest/60 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-secondary">compare_arrows</span>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Before vs After
          </span>
        </div>
        <span className="text-[10px] font-mono text-on-surface-variant">
          {signId}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
        <span>Metric</span>
        <span className="w-8 text-right">{formatTime(previous.timestamp)}</span>
        <span className="w-3" />
        <div className="flex gap-1 justify-end">
          <span className="w-8 text-right">{formatTime(current.timestamp)}</span>
          <span className="w-12 text-right">Change</span>
        </div>
      </div>

      {/* Metric rows */}
      <div className="flex flex-col gap-1">
        {METRIC_ROWS.map(({ key, label, metricKey }) => (
          <MetricComparisonRow
            key={key}
            label={label}
            before={previous[key] as number}
            after={current[key] as number}
            isWeakest={metricKey === weakestKey}
          />
        ))}

        {/* Overall separator */}
        <div className="border-t border-white/10 my-1" />
        <MetricComparisonRow
          label="Overall"
          before={previous.overallScore}
          after={current.overallScore}
          isWeakest={false}
        />
      </div>

      {/* Dynamic recommendation — based on real overall delta */}
      <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest/80 border border-white/8`}>
        <span className={`material-symbols-outlined text-xl ${recColor}`}>{recIcon}</span>
        <p className={`text-[11px] font-medium ${recColor}`}>{recText}</p>
      </div>
    </div>
  );
};
