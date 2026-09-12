export type NavigationTab = 'home' | 'journey' | 'practice' | 'missions' | 'signdna' | 'profile';

export interface SignDNAProfile {
  handShape: number; // 0-100
  position: number;
  orientation: number;
  trajectory: number;
  timing: number;
  globalPrecision: number;
  synapseRuns: number;
  biggestStrength: string;
  currentFocus: string;
}

export interface PracticeAttempt {
  id: string;
  signId: string;
  timestamp: string;
  handShapeScore: number;
  positionScore: number;
  orientationScore: number;
  trajectoryScore: number;
  timingScore: number;
  overallScore: number;
  xpEarned: number;
  primaryDivergencePointSeconds: number;
  aiCoachAdvice: string;
}

export interface LessonNode {
  id: string;
  signName: string;
  phonetic?: string;
  meaning: string;
  instructions: string;
  world: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'perfect';
  stars: number; // 0-3
  accuracyPercent: number;
  icon: string;
  isBoss?: boolean;
}

export interface ScenarioStep {
  id: string;
  sign: string;
  label: string;
  dialogueTarget: string;
  completed: boolean;
  score?: number;
}

export interface ScenarioMission {
  id: string;
  title: string;
  world: number;
  type: 'scenario' | 'boss';
  description: string;
  scenarioTheme: string;
  steps: ScenarioStep[];
  rewardXp: number;
  completed: boolean;
  stars: number;
}
