import { create } from 'zustand';
import type { NavigationTab, SignDNAProfile, PracticeAttempt, LessonNode, ScenarioMission } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { SIGN_CATALOG, SIGN_ORDER } from '../data/signCatalog';
import { PASS_THRESHOLD } from '../vision/types';
import { metricLabel } from '../vision/diagnosis';
import type { MetricKey } from '../vision/types';
import { streakFromAttempts } from './progress';

interface SignMindState {
  userName: string;
  userId: string;
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  gems: number;
  activeWorld: number;
  activeAltitudeMeters: number;
  activeHandTrail: 'mint' | 'violet' | 'medic' | 'solar';
  unlockedTrails: string[];
  equipHandTrail: (trail: 'mint' | 'violet' | 'medic' | 'solar') => void;
  claimedAchievements: string[];
  claimAchievementReward: (title: string, gems: number, xp: number) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  targetSign: string;
  setTargetSign: (sign: string) => void;
  audioEnabled: boolean;
  toggleAudio: () => void;
  ghostEnabled: boolean;
  toggleGhost: () => void;
  cameraActive: boolean;
  setCameraActive: (active: boolean) => void;
  useSimulatedCamera: boolean;
  setUseSimulatedCamera: (val: boolean) => void;
  signDNA: SignDNAProfile;
  attemptsHistory: PracticeAttempt[];
  recordAttempt: (attempt: Omit<PracticeAttempt, 'id' | 'timestamp'>) => void;
  lessons: LessonNode[];
  completeLesson: (id: string, overall: number) => void;
  missions: ScenarioMission[];
  completeScenarioStep: (missionId: string, stepId: string, score: number) => void;
  addXp: (amount: number, reason?: string) => void;
  resetProgress: () => void;
}

const EMPTY_DNA: SignDNAProfile = {
  handShape: 0,
  position: 0,
  orientation: 0,
  trajectory: 0,
  timing: 0,
  globalPrecision: 0,
  synapseRuns: 0,
  biggestStrength: 'No data yet',
  currentFocus: 'Complete your first attempt'
};

function dnaFromAttempts(attempts: PracticeAttempt[]): SignDNAProfile {
  if (attempts.length === 0) return { ...EMPTY_DNA };
  const n = attempts.length;
  const avg = (pick: (a: PracticeAttempt) => number) =>
    Math.round(attempts.reduce((s, a) => s + pick(a), 0) / n);
  const metrics: Record<MetricKey, number> = {
    handShape: avg((a) => a.handShapeScore),
    position: avg((a) => a.positionScore),
    orientation: avg((a) => a.orientationScore),
    trajectory: avg((a) => a.trajectoryScore),
    timing: avg((a) => a.timingScore)
  };
  const keys = Object.keys(metrics) as MetricKey[];
  const strongest = keys.reduce((a, b) => (metrics[a] >= metrics[b] ? a : b));
  const weakest = keys.reduce((a, b) => (metrics[a] <= metrics[b] ? a : b));
  return {
    ...metrics,
    globalPrecision: avg((a) => a.overallScore),
    synapseRuns: n,
    biggestStrength: metricLabel(strongest),
    currentFocus: metricLabel(weakest)
  };
}

function demoLessons(): LessonNode[] {
  const core: LessonNode[] = SIGN_ORDER.map((name, i) => {
    const s = SIGN_CATALOG[name];
    return {
      id: s.id,
      signName: s.name,
      phonetic: s.phonetic,
      meaning: s.meaning,
      instructions: s.instructions.join(' '),
      world: 1,
      status: i === 0 ? 'available' : 'locked',
      stars: 0,
      accuracyPercent: 0,
      icon: s.icon
    };
  });
  const quest = SIGN_CATALOG['RESTAURANT QUEST'];
  const bonusLesson: LessonNode = {
    id: quest.id,
    signName: quest.name,
    phonetic: quest.phonetic,
    meaning: quest.meaning,
    instructions: quest.instructions.join(' '),
    world: 1,
    status: 'available',
    stars: 0,
    accuracyPercent: 0,
    icon: quest.icon
  };
  return [...core, bonusLesson];
}

function initLessons(): LessonNode[] {
  if (!persisted?.lessons) return demoLessons();
  // Check if saved lessons match current SIGN_ORDER — if not, rebuild
  const savedNames = new Set(persisted.lessons.map((l) => l.signName));
  const currentNames = SIGN_ORDER.map((n) => SIGN_CATALOG[n]?.name);
  const allMatch = currentNames.every((n) => savedNames.has(n));
  if (!allMatch) return demoLessons();
  // Ensure restaurant quest exists
  const base = demoLessons();
  const quest = base.find((l) => l.signName === 'RESTAURANT QUEST');
  if (quest && !persisted.lessons.some((l) => l.signName === 'RESTAURANT QUEST')) {
    return [...persisted.lessons, quest];
  }
  return persisted.lessons;
}

const STORAGE_KEY = 'signmind-demo-pitch-v1';

function loadPersisted(): Partial<SignMindState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SignMindState>;
  } catch {
    return null;
  }
}

const persisted = typeof localStorage !== 'undefined' ? loadPersisted() : null;

export const useSignMindStore = create<SignMindState>((set, get) => ({
  userName: 'Learner',
  userId: 'SM-LOCAL',
  level: persisted?.level ?? 1,
  levelTitle: persisted?.levelTitle ?? 'Base Camp',
  xp: persisted?.xp ?? 0,
  nextLevelXp: persisted?.nextLevelXp ?? 300,
  streakDays: streakFromAttempts(persisted?.attemptsHistory ?? []),
  gems: persisted?.gems ?? 0,
  activeWorld: 1,
  activeAltitudeMeters: persisted?.activeAltitudeMeters ?? 0,
  activeHandTrail: 'mint',
  unlockedTrails: ['mint'],
  equipHandTrail: (trail) => {
    soundManager.playEquip();
    set({ activeHandTrail: trail });
  },
  claimedAchievements: persisted?.claimedAchievements ?? [],
  claimAchievementReward: (title, gemsReward, xpReward) => {
    const { claimedAchievements, gems } = get();
    if (claimedAchievements.includes(title)) return;
    soundManager.playGems();
    if (xpReward && xpReward > 0) {
      get().addXp(xpReward);
    }
    set({
      claimedAchievements: [...claimedAchievements, title],
      gems: gems + gemsReward
    });
    persist();
  },
  activeTab: persisted?.activeTab ?? 'practice',
  setActiveTab: (tab) => {
    soundManager.playTick();
    set({ activeTab: tab });
  },
  targetSign: persisted?.targetSign ?? 'HELLO',
  setTargetSign: (sign) => set({ targetSign: sign }),
  audioEnabled: true,
  toggleAudio: () => {
    const next = !get().audioEnabled;
    soundManager.enabled = next;
    if (next) soundManager.playTick();
    set({ audioEnabled: next });
  },
  ghostEnabled: false,
  toggleGhost: () => {
    soundManager.playTick();
    set((state) => ({ ghostEnabled: !state.ghostEnabled }));
  },
  cameraActive: true,
  setCameraActive: (active) => set({ cameraActive: active }),
  useSimulatedCamera: false,
  setUseSimulatedCamera: (val) => set({ useSimulatedCamera: val }),
  attemptsHistory: persisted?.attemptsHistory ?? [],
  signDNA: dnaFromAttempts(persisted?.attemptsHistory ?? []),
  lessons: initLessons(),
  recordAttempt: (attemptData) => {
    const id = `att-${Date.now()}`;
    const newAttempt: PracticeAttempt = {
      ...attemptData,
      id,
      timestamp: new Date().toISOString()
    };
    const attemptsHistory = [newAttempt, ...get().attemptsHistory];
    const signDNA = dnaFromAttempts(attemptsHistory);
    set({ attemptsHistory, signDNA, streakDays: streakFromAttempts(attemptsHistory) });
    persist();
    if (attemptData.xpEarned > 0) get().addXp(attemptData.xpEarned);
  },
  completeLesson: (id, overall) => {
    if (overall < PASS_THRESHOLD) {
      persist();
      return;
    }
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      /* ignore if canvas not supported */
    }
    const stars = overall >= 90 ? 3 : overall >= 80 ? 2 : 1;
    set((state) => {
      const lessons = state.lessons.map((lesson) => {
        if (lesson.id !== id && lesson.signName !== id) return lesson;
        return {
          ...lesson,
          status: overall >= 90 ? ('perfect' as const) : ('completed' as const),
          stars: Math.max(lesson.stars, stars),
          accuracyPercent: Math.max(lesson.accuracyPercent, overall)
        };
      });
      const idx = lessons.findIndex((l) => l.id === id || l.signName === id);
      if (idx >= 0 && idx < lessons.length - 1 && lessons[idx + 1].status === 'locked') {
        lessons[idx + 1] = { ...lessons[idx + 1], status: 'available' };
      }
      return { lessons };
    });
    persist();
  },
  missions: [],
  completeScenarioStep: () => {},
  addXp: (amount) => {
    const { xp, level, nextLevelXp } = get();
    const newXp = xp + amount;
    const newAltitude = Math.min(4500, Math.round(newXp * 0.6));
    if (newXp >= nextLevelXp) {
      soundManager.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5a0', '#8b5cf6', '#ffb95f']
      });
      set({
        xp: newXp,
        activeAltitudeMeters: newAltitude,
        level: level + 1,
        nextLevelXp: nextLevelXp + 400,
        levelTitle: level + 1 >= 3 ? 'Movement Explorer' : 'Base Camp'
      });
    } else {
      set({ xp: newXp, activeAltitudeMeters: newAltitude });
    }
    persist();
  },
  resetProgress: () => {
    try {
      localStorage.clear();
    } catch {
      /* drop */
    }
    soundManager.playSuccess();
    set({
      level: 1,
      levelTitle: 'Base Camp',
      xp: 0,
      nextLevelXp: 300,
      streakDays: 0,
      gems: 0,
      activeAltitudeMeters: 0,
      claimedAchievements: [],
      targetSign: 'HELLO',
      activeTab: 'practice',
      signDNA: EMPTY_DNA,
      attemptsHistory: [],
      lessons: demoLessons()
    });
    persist();
  }
}));

function persist() {
  const s = useSignMindStore.getState();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      xp: s.xp,
      level: s.level,
      levelTitle: s.levelTitle,
      nextLevelXp: s.nextLevelXp,
      gems: s.gems,
      activeAltitudeMeters: s.activeAltitudeMeters,
      targetSign: s.targetSign,
      attemptsHistory: s.attemptsHistory,
      lessons: s.lessons,
      claimedAchievements: s.claimedAchievements
    })
  );
}
