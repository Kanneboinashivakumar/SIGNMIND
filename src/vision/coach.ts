import { metricLabel, type Diagnosis } from './diagnosis';
import type { MetricKey } from './types';

const ISSUE_HINT: Record<MetricKey, string> = {
  handShape: 'keep your finger shapes closer to the tutorial reference',
  position: 'match the target hand height and placement in the frame',
  orientation: 'turn your palm to match the tutorial angle earlier',
  trajectory: 'follow the motion path more closely through the sign',
  timing: 'match the tutorial pace — steady and neither too fast nor too slow'
};

/**
 * Template coach — no LLM. Receives only Diagnosis structured output.
 */
export function coachSentence(d: Diagnosis, signName: string): string {
  const s = d.allScores;
  if (s.overall === 0) {
    return `No usable hand sequence was captured for ${signName}. Keep your hand in clear camera view for the full motion, then try again.`;
  }
  if (!d.priorityIssue) {
    const delta =
      d.improvementFromLastAttempt !== null && d.improvementFromLastAttempt > 0
        ? ` That's +${d.improvementFromLastAttempt} from last time.`
        : '';
    return `Strong ${signName} — all five metrics are solid (${s.overall}%). Keep that consistency.${delta}`;
  }
  const issue = metricLabel(d.priorityIssue);
  const issueScore = s[d.priorityIssue];
  const best = (['handShape', 'position', 'orientation', 'trajectory', 'timing'] as MetricKey[]).reduce(
    (a, b) => (s[a] >= s[b] ? a : b)
  );
  return `Great ${metricLabel(best).toLowerCase()} (${s[best]}%). ${issue} was the weak point at ${issueScore}% — ${ISSUE_HINT[d.priorityIssue]}.`;
}

export type XpTier = 'Miss' | 'Correct' | 'Great' | 'Perfect' | 'Personal Best';

export function xpForAttempt(overall: number, isPersonalBest: boolean): { xp: number; tier: XpTier } {
  if (overall < 70) return { xp: 0, tier: 'Miss' };
  let xp = 50;
  let tier: XpTier = 'Correct';
  if (overall >= 90) {
    xp = 150;
    tier = 'Perfect';
  } else if (overall >= 80) {
    xp = 100;
    tier = 'Great';
  }
  if (isPersonalBest && overall >= 70) {
    return { xp: xp + 25, tier: 'Personal Best' };
  }
  return { xp, tier };
}
