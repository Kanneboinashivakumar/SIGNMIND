import type { MetricKey, MetricScores } from './types';
import { WORTH_MENTIONING } from './types';

export interface Diagnosis {
  priorityIssue: MetricKey | null;
  score: number;
  allScores: MetricScores;
  improvementFromLastAttempt: number | null;
}

const LABELS: Record<MetricKey, string> = {
  handShape: 'Hand Shape',
  position: 'Position',
  orientation: 'Orientation',
  trajectory: 'Trajectory',
  timing: 'Timing'
};

export function metricLabel(key: MetricKey): string {
  return LABELS[key];
}

export function diagnoseAttempt(
  scores: MetricScores,
  previousOverall: number | null
): Diagnosis {
  const keys: MetricKey[] = ['handShape', 'position', 'orientation', 'trajectory', 'timing'];
  let lowest: MetricKey = keys[0];
  for (const k of keys) {
    if (scores[k] < scores[lowest]) lowest = k;
  }

  const worthMentioning = scores[lowest] < WORTH_MENTIONING;
  const improvement =
    previousOverall === null ? null : scores.overall - previousOverall;

  return {
    priorityIssue: worthMentioning ? lowest : null,
    score: scores.overall,
    allScores: scores,
    improvementFromLastAttempt: improvement
  };
}
