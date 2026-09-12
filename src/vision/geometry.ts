import type { Vec3, LandmarkFrame } from './types';

export function v(x: number, y: number, z = 0): Vec3 {
  return { x, y, z };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
}

export function len(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

export function dist(a: Vec3, b: Vec3): number {
  return len(sub(a, b));
}

export function normalize(a: Vec3): Vec3 {
  const n = len(a);
  if (n < 1e-8) return { x: 0, y: 0, z: 0 };
  return scale(a, 1 / n);
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function rotateAround(vec: Vec3, axis: Vec3, angle: number): Vec3 {
  const k = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return add(
    add(scale(vec, c), scale(cross(k, vec), s)),
    scale(k, dot(k, vec) * (1 - c))
  );
}

export function lerpFrame(a: LandmarkFrame, b: LandmarkFrame, t: number): LandmarkFrame {
  const n = Math.min(a.length, b.length);
  const out: LandmarkFrame = [];
  for (let i = 0; i < n; i++) out.push(lerp(a[i], b[i], t));
  return out;
}

export function angleAt(a: Vec3, b: Vec3, c: Vec3): number {
  const ba = normalize(sub(a, b));
  const bc = normalize(sub(c, b));
  return Math.acos(Math.max(-1, Math.min(1, dot(ba, bc))));
}

/** 15 joint angles: 3 per finger (MCP, PIP, DIP) for index–pinky + thumb IP/MCP. */
export function fingerJointAngles(lm: LandmarkFrame): number[] {
  if (lm.length < 21) return [];
  const chains = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20]
  ];
  const angles: number[] = [];
  for (const [a, b, c, d] of chains) {
    angles.push(angleAt(lm[0], lm[a], lm[b]));
    angles.push(angleAt(lm[a], lm[b], lm[c]));
    angles.push(angleAt(lm[b], lm[c], lm[d]));
  }
  return angles;
}

/** Palm facing direction from wrist / index MCP / pinky MCP. */
export function palmNormal(lm: LandmarkFrame): Vec3 {
  if (lm.length < 21) return { x: 0, y: 0, z: 1 };
  return normalize(cross(sub(lm[5], lm[0]), sub(lm[17], lm[0])));
}

export function meanLandmarkDistance(a: LandmarkFrame, b: LandmarkFrame): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 1;
  let s = 0;
  for (let i = 0; i < n; i++) s += dist(a[i], b[i]);
  return s / n;
}

export function scoreFromError(error: number, failAt: number): number {
  return Math.round(100 * clamp01(1 - error / failAt));
}
