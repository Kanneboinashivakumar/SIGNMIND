import { dtw } from './dtw';
import {
  dist,
  dot,
  fingerJointAngles,
  meanLandmarkDistance,
  normalize,
  palmNormal,
  scoreFromError
} from './geometry';
import type { LandmarkFrame, MetricScores, TimedFrame, Vec3 } from './types';

function frameDist(a: LandmarkFrame, b: LandmarkFrame): number {
  // Compare landmark configurations invariant to horizontal mirror inversion
  const direct = meanLandmarkDistance(a, b);
  const mirroredB: LandmarkFrame = b.map((pt) => ({ x: 1 - pt.x, y: pt.y, z: pt.z }));
  const mirr = meanLandmarkDistance(a, mirroredB);
  return Math.min(direct, mirr);
}

export function liveSyncScore(user: LandmarkFrame | null, ghost: LandmarkFrame | null): number {
  if (!user || !ghost || user.length < 21 || ghost.length < 21) return 0;
  const direct = meanLandmarkDistance(user, ghost);
  const mirroredGhost: LandmarkFrame = ghost.map((pt) => ({ x: 1 - pt.x, y: pt.y, z: pt.z }));
  const mirr = meanLandmarkDistance(user, mirroredGhost);
  return scoreFromError(Math.min(direct, mirr), 0.42);
}

export function trackingQuality(user: LandmarkFrame | null, recent: LandmarkFrame[]): number {
  if (!user || user.length < 21) return 0;
  if (recent.length < 2) return 70;
  let jitter = 0;
  for (let i = 1; i < recent.length; i++) {
    jitter += dist(recent[i][0], recent[i - 1][0]);
  }
  jitter /= recent.length - 1;
  const stable = scoreFromError(jitter, 0.08);
  return Math.round(0.5 * 100 + 0.5 * stable);
}

function robustDist(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z - b.z) * 0.35;
  return Math.hypot(dx, dy, dz);
}

export function scoreAttempt(userFrames: TimedFrame[], reference: TimedFrame[]): MetricScores {
  const user = userFrames.filter((f) => f.landmarks.length >= 21);
  const ref = reference.filter((f) => f.landmarks.length >= 21);
  if (user.length < 4 || ref.length < 4) {
    return {
      handShape: 0,
      position: 0,
      orientation: 0,
      trajectory: 0,
      timing: 0,
      overall: 0
    };
  }

  const aligned = dtw(user, ref, (a, b) => frameDist(a.landmarks, b.landmarks));

  let shapeErr = 0;
  let posErr = 0;
  let orientErr = 0;
  for (const [ui, ri] of aligned.path) {
    const uLm = user[ui].landmarks;
    const rLm = ref[ri].landmarks;

    // Hand shape error via joint angles
    const ua = fingerJointAngles(uLm);
    const ra = fingerJointAngles(rLm);
    let ae = 0;
    const k = Math.min(ua.length, ra.length);
    for (let i = 0; i < k; i++) ae += Math.abs(ua[i] - ra[i]);
    shapeErr += k ? ae / k : 1;

    // Position error: check both direct and horizontally mirrored reference with scaled monocular depth
    const uWrist = uLm[0];
    const rWrist = rLm[0];
    const rWristMirrored = { x: 1 - rWrist.x, y: rWrist.y, z: rWrist.z };
    const dDirect = robustDist(uWrist, rWrist);
    const dMirr = robustDist(uWrist, rWristMirrored);
    posErr += Math.min(dDirect, dMirr);

    // Orientation error: plane-aligned normal dot product (invariant to 180° front/back flips on edge-on hand)
    const un = palmNormal(uLm);
    const rn = palmNormal(rLm);
    const rnMirr = { x: -rn.x, y: rn.y, z: rn.z };
    const unNorm = normalize(un);
    const rnNorm = normalize(rn);
    const rnMirrNorm = normalize(rnMirr);
    const errDirect = Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(unNorm, rnNorm)))));
    const errMirr = Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(unNorm, rnMirrNorm)))));
    orientErr += Math.min(errDirect, errMirr);
  }
  const n = aligned.path.length || 1;
  const handShape = scoreFromError(shapeErr / n, 1.15);
  // Realistic threshold for position allowance
  const position = scoreFromError(posErr / n, 0.55);
  const orientation = scoreFromError(orientErr / n, Math.PI * 0.5);

  // Trajectory: Relative displacement arc (delta from first frame) to reward natural gesture motion
  const userStart = user[0].landmarks[0];
  const refStart = ref[0].landmarks[0];
  const deltaUser = user.map((f) => ({
    x: f.landmarks[0].x - userStart.x,
    y: f.landmarks[0].y - userStart.y,
    z: f.landmarks[0].z - userStart.z
  }));
  const deltaRefDirect = ref.map((f) => ({
    x: f.landmarks[0].x - refStart.x,
    y: f.landmarks[0].y - refStart.y,
    z: f.landmarks[0].z - refStart.z
  }));
  const deltaRefMirr = ref.map((f) => ({
    x: -(f.landmarks[0].x - refStart.x),
    y: f.landmarks[0].y - refStart.y,
    z: f.landmarks[0].z - refStart.z
  }));

  const dtwDirect = dtw(deltaUser, deltaRefDirect, robustDist);
  const dtwMirr = dtw(deltaUser, deltaRefMirr, robustDist);
  const bestDtw = Math.min(dtwDirect.cost, dtwMirr.cost);
  const pathNorm = bestDtw / Math.max(deltaUser.length, deltaRefDirect.length);
  const trajectory = scoreFromError(pathNorm, 0.38);

  let warp = 0;
  for (const [ui, ri] of aligned.path) {
    warp += Math.abs(ui / (user.length - 1) - ri / (ref.length - 1));
  }
  const timing = scoreFromError(warp / n, 0.6);

  const overall = Math.round(
    handShape * 0.25 + position * 0.2 + orientation * 0.25 + trajectory * 0.18 + timing * 0.12
  );

  return { handShape, position, orientation, trajectory, timing, overall };
}
