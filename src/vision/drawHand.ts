import { HAND_CONNECTIONS } from './types';
import { lerpFrame } from './geometry';
import type { LandmarkFrame, TimedFrame } from './types';

export function ghostAtTime(frames: TimedFrame[], tMs: number): LandmarkFrame {
  if (frames.length === 0) return [];
  if (tMs <= frames[0].t) return frames[0].landmarks;
  if (tMs >= frames[frames.length - 1].t) return frames[frames.length - 1].landmarks;
  let i = 1;
  while (i < frames.length && frames[i].t < tMs) i++;
  const a = frames[i - 1];
  const b = frames[i];
  const u = (tMs - a.t) / Math.max(1, b.t - a.t);
  return lerpFrame(a.landmarks, b.landmarks, u);
}

function toCanvas(lm: LandmarkFrame, w: number, h: number, mirror: boolean) {
  return lm.map((p) => ({
    x: (mirror ? 1 - p.x : p.x) * w,
    y: p.y * h
  }));
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkFrame,
  w: number,
  h: number,
  color: string,
  alpha: number,
  mirror: boolean
) {
  if (landmarks.length < 21) return;
  const pts = toCanvas(landmarks, w, h, mirror);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  HAND_CONNECTIONS.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
  });
  ctx.fillStyle = color;
  pts.forEach((p, idx) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, idx === 0 ? 5 : 3.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function canvasWrist(lm: LandmarkFrame, w: number, h: number, mirror: boolean) {
  const p = lm[0];
  return { x: (mirror ? 1 - p.x : p.x) * w, y: p.y * h };
}

/** Direction trail + start/end markers. Does not change drawSkeleton. */
export function drawMotionCues(
  ctx: CanvasRenderingContext2D,
  frames: TimedFrame[],
  tMs: number,
  w: number,
  h: number,
  mirror: boolean
) {
  if (frames.length < 2) return;
  const start = canvasWrist(frames[0].landmarks, w, h, mirror);
  const end = canvasWrist(frames[frames.length - 1].landmarks, w, h, mirror);
  const now = canvasWrist(ghostAtTime(frames, tMs), w, h, mirror);
  const ahead = canvasWrist(ghostAtTime(frames, Math.min(frames[frames.length - 1].t, tMs + 120)), w, h, mirror);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 245, 160, 0.85)';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('START', start.x + 12, start.y - 8);

  ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('END', end.x + 12, end.y - 8);

  ctx.strokeStyle = 'rgba(208, 188, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  const samples = 12;
  for (let i = 1; i <= samples; i++) {
    const u = (i / samples) * frames[frames.length - 1].t;
    const p = canvasWrist(ghostAtTime(frames, u), w, h, mirror);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const dx = ahead.x - now.x;
  const dy = ahead.y - now.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 2) {
    const ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(now.x, now.y);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(208, 188, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(8, 10);
    ctx.lineTo(8, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-18, -3, 28, 6);
    ctx.restore();
  }
  ctx.restore();
}

export function drawEnhancedGhost(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkFrame,
  w: number,
  h: number,
  _color: string,
  alpha: number,
  mirror: boolean,
  _phaseProgress?: number
): void {
  if (landmarks.length < 21) return;
  const pts = toCanvas(landmarks, w, h, mirror);
  ctx.save();
  ctx.globalAlpha = alpha;
  
  // 5. Forearm Stub
  const wrist = pts[0];
  const midMCP = pts[9];
  const dxForearm = wrist.x - midMCP.x;
  const dyForearm = wrist.y - midMCP.y;
  const dist = Math.hypot(dxForearm, dyForearm);
  if (dist > 0) {
    const dirX = dxForearm / dist;
    const dirY = dyForearm / dist;
    const length = 50;
    const stubEnd = { x: wrist.x + dirX * length, y: wrist.y + dirY * length };
    
    const perpX = -dirY;
    const perpY = dirX;
    
    ctx.beginPath();
    ctx.moveTo(wrist.x + perpX * 12, wrist.y + perpY * 12);
    ctx.lineTo(stubEnd.x + perpX * 15, stubEnd.y + perpY * 15);
    ctx.lineTo(stubEnd.x - perpX * 15, stubEnd.y - perpY * 15);
    ctx.lineTo(wrist.x - perpX * 12, wrist.y - perpY * 12);
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.fill();
  }

  // 1. Filled Palm Polygon: 0, 1, 2, 5, 9, 13, 17
  const palmIndices = [0, 1, 2, 5, 9, 13, 17];
  ctx.beginPath();
  palmIndices.forEach((idx, i) => {
    if (i === 0) ctx.moveTo(pts[idx].x, pts[idx].y);
    else ctx.lineTo(pts[idx].x, pts[idx].y);
  });
  ctx.closePath();
  
  const palmNodes = [0, 5, 9, 13, 17];
  let cx = 0, cy = 0;
  palmNodes.forEach(idx => {
    cx += pts[idx].x;
    cy += pts[idx].y;
  });
  cx /= palmNodes.length;
  cy /= palmNodes.length;
  
  const pRad = Math.hypot(pts[0].x - cx, pts[0].y - cy) * 1.5;
  const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pRad);
  radGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
  radGrad.addColorStop(1, 'rgba(139, 92, 246, 0.12)');
  ctx.fillStyle = radGrad;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(139, 92, 246, 1)';
  ctx.stroke();

  // 2. Thick Capsule Bone Segments
  ctx.lineCap = 'round';
  HAND_CONNECTIONS.forEach(([i, j]) => {
    const p1 = pts[i];
    const p2 = pts[j];
    
    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
    grad.addColorStop(1, 'rgba(167, 139, 250, 0.4)');
    
    const bdx = p2.x - p1.x;
    const bdy = p2.y - p1.y;
    const blen = Math.hypot(bdx, bdy);
    if (blen > 0) {
      const bdirX = bdx / blen;
      const bdirY = bdy / blen;
      const r1 = 6;
      const r2 = 4;
      
      ctx.beginPath();
      const angBase = Math.atan2(bdirY, bdirX);
      ctx.arc(p1.x, p1.y, r1, angBase + Math.PI/2, angBase - Math.PI/2);
      ctx.arc(p2.x, p2.y, r2, angBase - Math.PI/2, angBase + Math.PI/2);
      ctx.closePath();
      
      ctx.fillStyle = grad;
      ctx.fill();
    }
  });

  // 3. Glowing Joint Nodes
  pts.forEach((p, idx) => {
    const r = idx === 0 ? 8 : 5;
    const glowR = r * 2.5;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#a78bfa';
    ctx.fill();
  });
  
  // 4. Palm Normal Arrow
  let nx = 0, ny = -1;
  if (landmarks[5] && landmarks[17] && landmarks[0] && landmarks[5].z !== undefined) {
    const u = {
      x: pts[5].x - pts[0].x,
      y: pts[5].y - pts[0].y,
      z: (landmarks[5].z - landmarks[0].z) * w
    };
    const v = {
      x: pts[17].x - pts[0].x,
      y: pts[17].y - pts[0].y,
      z: (landmarks[17].z - landmarks[0].z) * w
    };
    
    let normX = u.y * v.z - u.z * v.y;
    let normY = u.z * v.x - u.x * v.z;
    const mag = Math.hypot(normX, normY);
    if (mag > 0.001) {
      nx = (normX / mag) * (mirror ? -1 : 1);
      ny = normY / mag;
    }
  }
  
  const arrowLen = 30;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + nx * arrowLen, cy + ny * arrowLen);
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(cx + nx * arrowLen, cy + ny * arrowLen, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
  ctx.fill();

  ctx.restore();
}
