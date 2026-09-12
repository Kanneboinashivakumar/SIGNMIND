import { add, cross, normalize, rotateAround, scale, v } from './geometry';
import type { LandmarkFrame, Vec3 } from './types';

export type FingerCurls = [number, number, number, number, number];

function bone(from: Vec3, dir: Vec3, length: number): Vec3 {
  return add(from, scale(normalize(dir), length));
}

/** curl: 0 = extended, 1 = fist. */
export function buildHand(opts: {
  wrist: Vec3;
  towardFingers: Vec3;
  palmNormal: Vec3;
  curls: FingerCurls;
  size?: number;
}): LandmarkFrame {
  const s = opts.size ?? 0.22;
  const forward = normalize(opts.towardFingers);
  const normal = normalize(opts.palmNormal);
  let right = normalize(cross(forward, normal));
  if (Math.hypot(right.x, right.y, right.z) < 0.1) right = v(1, 0, 0);
  const up = normalize(cross(right, forward));
  const wrist = opts.wrist;
  const lm: LandmarkFrame = new Array(21);
  lm[0] = wrist;

  const mcpSpread = [-0.42, -0.14, 0.08, 0.3, 0.5];
  const mcpAlong = [0.18, 0.38, 0.4, 0.38, 0.34];
  const lengths = [
    [0.12, 0.08, 0.07],
    [0.16, 0.1, 0.08],
    [0.17, 0.11, 0.08],
    [0.15, 0.1, 0.08],
    [0.12, 0.08, 0.07]
  ];

  for (let f = 0; f < 5; f++) {
    const curl = Math.max(0, Math.min(1, opts.curls[f]));
    const mcp = add(
      add(wrist, scale(forward, mcpAlong[f] * s)),
      scale(right, mcpSpread[f] * s)
    );
    const baseIdx = f === 0 ? 1 : 5 + (f - 1) * 4;
    const bend = normalize(cross(forward, right));
    let dir = add(forward, scale(up, f === 0 ? 0.35 : 0.05));
    dir = normalize(add(dir, scale(right, mcpSpread[f] * 0.25)));
    const segs = lengths[f];
    const curlRads = [curl * 0.7, curl * 1.15, curl * 1.05];

    if (f === 0) {
      lm[1] = add(wrist, add(scale(right, -0.22 * s), scale(forward, 0.08 * s)));
      let pos = lm[1];
      for (let j = 0; j < 3; j++) {
        dir = rotateAround(dir, bend, curlRads[j]);
        pos = bone(pos, dir, segs[j] * s * 1.15);
        lm[2 + j] = pos;
      }
      continue;
    }

    lm[baseIdx] = mcp;
    let pos = mcp;
    for (let j = 0; j < 3; j++) {
      dir = rotateAround(dir, bend, curlRads[j]);
      pos = bone(pos, dir, segs[j] * s * 1.15);
      lm[baseIdx + 1 + j] = pos;
    }
  }
  return lm;
}
