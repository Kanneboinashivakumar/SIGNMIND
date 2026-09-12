import type { LessonNode, PracticeAttempt, SignDNAProfile } from '../types';
import { SIGN_ORDER } from '../data/signCatalog';

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Consecutive calendar days with ≥1 attempt, ending today or yesterday. */
export function streakFromAttempts(attempts: PracticeAttempt[]): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => dayKey(a.timestamp)));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function isLessonCleared(lesson: LessonNode): boolean {
  return lesson.status === 'completed' || lesson.status === 'perfect';
}

export function nextPracticeLesson(lessons: LessonNode[]): LessonNode | undefined {
  const ordered = SIGN_ORDER.map((name) => lessons.find((l) => l.signName === name)).filter(
    Boolean
  ) as LessonNode[];
  return ordered.find((l) => l.status === 'available') || ordered.find((l) => isLessonCleared(l));
}

export function recommendFromDna(
  lessons: LessonNode[],
  dna: SignDNAProfile,
  attempts: PracticeAttempt[]
): { signName: string; reason: string } {
  const next = nextPracticeLesson(lessons);
  if (attempts.length === 0) {
    return {
      signName: next?.signName || 'HELLO',
      reason: 'No attempts yet — start with Hello and watch the lesson first.'
    };
  }
  const focus = dna.currentFocus;
  const weakestSign = [...attempts].sort((a, b) => a.overallScore - b.overallScore)[0];
  return {
    signName: next?.signName || weakestSign.signId,
    reason: `SignDNA weakest metric is ${focus} (avg ${
      focus === 'Hand Shape'
        ? dna.handShape
        : focus === 'Position'
          ? dna.position
          : focus === 'Orientation'
            ? dna.orientation
            : focus === 'Trajectory'
              ? dna.trajectory
              : dna.timing
    }% across ${dna.synapseRuns} attempt${dna.synapseRuns === 1 ? '' : 's'}).`
  };
}

export function bestScoreForSign(attempts: PracticeAttempt[], signName: string): number | null {
  const mine = attempts.filter((a) => a.signId === signName);
  if (mine.length === 0) return null;
  return Math.max(...mine.map((a) => a.overallScore));
}

export function previousBestForSign(attempts: PracticeAttempt[], signName: string): number | null {
  const mine = attempts.filter((a) => a.signId === signName);
  if (mine.length < 2) return mine[0]?.overallScore ?? null;
  const scores = mine.map((a) => a.overallScore).sort((a, b) => b - a);
  return scores[1];
}
