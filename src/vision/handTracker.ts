import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { LandmarkFrame } from './types';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export async function createHandLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM);
  try {
    return await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  } catch {
    return HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }
}

export function landmarksFromResult(result: {
  landmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  handLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
}): LandmarkFrame | null {
  const hand = result.landmarks?.[0] || result.handLandmarks?.[0];
  if (!hand || hand.length < 21) return null;
  return hand.map((p) => ({ x: p.x, y: p.y, z: p.z }));
}
