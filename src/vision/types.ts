export type Vec3 = { x: number; y: number; z: number };

export type LandmarkFrame = Vec3[];

export interface TimedFrame {
  t: number;
  landmarks: LandmarkFrame;
}

export interface TeachPhase {
  /** 0–1 along the reference duration */
  start: number;
  end: number;
  caption: string;
}

export interface SignReference {
  id: string;
  name: string;
  phonetic: string;
  meaning: string;
  instructions: string[];
  teachPhases: TeachPhase[];
  icon: string;
  durationMs: number;
  frames: TimedFrame[];
  /** Optional URL to a tutorial video (local /public path or external URL) */
  videoUrl?: string;
  videoStartTime?: number;
  videoEndTime?: number;
}

export type MetricKey = 'handShape' | 'position' | 'orientation' | 'trajectory' | 'timing';

export interface MetricScores {
  handShape: number;
  position: number;
  orientation: number;
  trajectory: number;
  timing: number;
  overall: number;
}

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];

export const PASS_THRESHOLD = 70;
export const WORTH_MENTIONING = 82;
