import { buildHand, type FingerCurls } from '../vision/handModel';
import { lerp, v } from '../vision/geometry';
import type { SignReference, TimedFrame, Vec3 } from '../vision/types';

/* ── Curl presets ────────────────────────────────────────────────────── */
const OPEN: FingerCurls = [0.15, 0.05, 0.05, 0.08, 0.12];
const POINT: FingerCurls = [0.55, 0.05, 0.95, 0.95, 0.95];
const H_SHAPE: FingerCurls = [0.55, 0.05, 0.05, 0.95, 0.95];
const FIVE: FingerCurls = [0.05, 0.05, 0.05, 0.05, 0.05];
const FLAT_O: FingerCurls = [0.45, 0.65, 0.65, 0.65, 0.65];
const THUMBS_UP: FingerCurls = [0.05, 0.95, 0.95, 0.95, 0.95];

function lerpCurls(a: FingerCurls, b: FingerCurls, t: number): FingerCurls {
  return a.map((v, i) => v + (b[i] - v) * t) as FingerCurls;
}

/* ── Sampling helper ────────────────────────────────────────────────── */
function sample(durationMs: number, fps: number, poseAt: (u: number) => ReturnType<typeof buildHand>): TimedFrame[] {
  const n = Math.max(24, Math.round((durationMs / 1000) * fps));
  const frames: TimedFrame[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    frames.push({ t: u * durationMs, landmarks: poseAt(u) });
  }
  return frames;
}

function pose(wrist: Vec3, fingers: Vec3, palm: Vec3, curls: FingerCurls) {
  return buildHand({ wrist, towardFingers: fingers, palmNormal: palm, curls });
}

/* ══════════════════════════════════════════════════════════════════════
   CANONICAL FK SEQUENCES — authored and frozen at module load
   ══════════════════════════════════════════════════════════════════════ */

/** HELLO — Open hand wave from temple outward */
function helloFrames(): TimedFrame[] {
  return sample(1600, 30, (u) => {
    const wave = Math.sin(u * Math.PI * 2) * 0.06;
    const wrist = v(0.58 + u * 0.16, 0.28 + wave * 0.15, 0);
    const fingers = v(0.15 + u * 0.4, -0.85 + wave, 0.1);
    return pose(wrist, fingers, v(0, 0.15, 1), OPEN);
  });
}

/** HOW ARE YOU — Point outward → curve hand toward self with questioning palm-up */
function howAreYouFrames(): TimedFrame[] {
  return sample(2000, 30, (u) => {
    if (u < 0.35) {
      // Phase 1: Point index finger forward
      const subU = u / 0.35;
      const wrist = lerp(v(0.52, 0.45, 0), v(0.60, 0.42, 0.08), subU);
      const fingers = lerp(v(0.1, -0.9, 0.3), v(0.3, -0.8, 0.4), subU);
      return pose(wrist, fingers, v(0, 0.1, 1), POINT);
    } else if (u < 0.7) {
      // Phase 2: Curve inward — sweep toward chest, opening to flat hand
      const subU = (u - 0.35) / 0.35;
      const wrist = lerp(v(0.60, 0.42, 0.08), v(0.50, 0.50, 0), subU);
      const fingers = lerp(v(0.3, -0.8, 0.4), v(0.05, -0.6, 0.3), subU);
      const palm = lerp(v(0, 0.1, 1), v(0, 0.5, 0.8), subU);
      const curls = lerpCurls(POINT, FIVE, subU);
      return pose(wrist, fingers, palm, curls);
    } else {
      // Phase 3: Finish near chest, palm up (questioning)
      const subU = (u - 0.7) / 0.3;
      const wrist = lerp(v(0.50, 0.50, 0), v(0.52, 0.52, 0), subU);
      const bounce = Math.sin(subU * Math.PI) * 0.02;
      const fingers = v(0.05, -0.5 + bounce, 0.3);
      return pose(wrist, fingers, v(0, 0.7, 0.6), FIVE);
    }
  });
}

/** I AM FINE — Thumb touches chest → hand opens outward (thumb on chest, open 5 sweeps out) */
function iAmFineFrames(): TimedFrame[] {
  return sample(1800, 30, (u) => {
    if (u < 0.4) {
      // Phase 1: Thumb touches center chest
      const subU = u / 0.4;
      const wrist = lerp(v(0.52, 0.48, 0), v(0.50, 0.52, -0.02), subU);
      const fingers = lerp(v(0.05, -0.7, 0.2), v(0.05, -0.4, 0.4), subU);
      return pose(wrist, fingers, v(0, 0.3, 0.9), FIVE);
    } else if (u < 0.7) {
      // Phase 2: Tap chest — thumb contacts chest
      const subU = (u - 0.4) / 0.3;
      const tap = Math.sin(subU * Math.PI) * 0.015;
      const wrist = v(0.50, 0.52 + tap, -0.02);
      return pose(wrist, v(0.05, -0.4, 0.4), v(0, 0.3, 0.9), FIVE);
    } else {
      // Phase 3: Open hand sweeps outward and slightly down
      const subU = (u - 0.7) / 0.3;
      const wrist = lerp(v(0.50, 0.52, -0.02), v(0.58, 0.56, 0.05), subU);
      const fingers = lerp(v(0.05, -0.4, 0.4), v(0.2, -0.6, 0.5), subU);
      const palm = lerp(v(0, 0.3, 0.9), v(0, 0.5, 0.7), subU);
      return pose(wrist, fingers, palm, FIVE);
    }
  });
}

/** WHAT'S YOUR NAME — H-fingers (index+middle) tap together twice → point outward */
function whatsYourNameFrames(): TimedFrame[] {
  return sample(2200, 30, (u) => {
    if (u < 0.35) {
      // Phase 1: Form H-hand, first tap (H-fingers cross/tap)
      const subU = u / 0.35;
      const tap = Math.sin(subU * Math.PI * 2) * 0.03;
      const wrist = v(0.50, 0.44 + tap, 0);
      const fingers = v(0.08 + tap * 0.5, -0.8, 0.15);
      return pose(wrist, fingers, v(0.1, 0.1, 1), H_SHAPE);
    } else if (u < 0.65) {
      // Phase 2: Second tap
      const subU = (u - 0.35) / 0.3;
      const tap = Math.sin(subU * Math.PI * 2) * 0.03;
      const wrist = v(0.50, 0.44 + tap, 0);
      const fingers = v(0.08 + tap * 0.5, -0.8, 0.15);
      return pose(wrist, fingers, v(0.1, 0.1, 1), H_SHAPE);
    } else {
      // Phase 3: Point outward (YOUR)
      const subU = (u - 0.65) / 0.35;
      const wrist = lerp(v(0.50, 0.44, 0), v(0.58, 0.42, 0.08), subU);
      const fingers = lerp(v(0.08, -0.8, 0.15), v(0.25, -0.85, 0.3), subU);
      const curls = lerpCurls(H_SHAPE, POINT, subU);
      return pose(wrist, fingers, v(0.1, 0.1, 1), curls);
    }
  });
}

/** MY NAME IS — Point to self (MY) → H-fingers tap together twice (NAME) */
function myNameIsFrames(): TimedFrame[] {
  return sample(2000, 30, (u) => {
    if (u < 0.3) {
      // Phase 1: Point to self (MY) — finger touches chest
      const subU = u / 0.3;
      const wrist = lerp(v(0.55, 0.45, 0), v(0.50, 0.50, -0.02), subU);
      const fingers = lerp(v(0.05, -0.7, 0.3), v(0.0, -0.5, 0.2), subU);
      return pose(wrist, fingers, v(0, 0.2, 1), POINT);
    } else if (u < 0.65) {
      // Phase 2: H-fingers first tap (NAME)
      const subU = (u - 0.3) / 0.35;
      const tap = Math.sin(subU * Math.PI * 2) * 0.03;
      const wrist = lerp(v(0.50, 0.50, -0.02), v(0.50, 0.44 + tap, 0), Math.min(1, subU * 2));
      const fingers = v(0.08 + tap * 0.5, -0.8, 0.15);
      const curls = lerpCurls(POINT, H_SHAPE, Math.min(1, subU * 3));
      return pose(wrist, fingers, v(0.1, 0.1, 1), curls);
    } else {
      // Phase 3: H-fingers second tap
      const subU = (u - 0.65) / 0.35;
      const tap = Math.sin(subU * Math.PI * 2) * 0.03;
      const wrist = v(0.50, 0.44 + tap, 0);
      const fingers = v(0.08 + tap * 0.5, -0.8, 0.15);
      return pose(wrist, fingers, v(0.1, 0.1, 1), H_SHAPE);
    }
  });
}

/** NICE TO MEET YOU — Open hand slides off opposite palm → point outward */
function niceToMeetYouFrames(): TimedFrame[] {
  return sample(2000, 30, (u) => {
    if (u < 0.4) {
      // Phase 1: NICE — open hand on chest/palm sliding upward
      const subU = u / 0.4;
      const wrist = lerp(v(0.48, 0.55, 0), v(0.50, 0.48, 0.02), subU);
      const fingers = lerp(v(0.05, -0.5, 0.3), v(0.1, -0.7, 0.25), subU);
      return pose(wrist, fingers, v(0, 0.4, 0.85), OPEN);
    } else if (u < 0.7) {
      // Phase 2: MEET — index fingers approach each other
      const subU = (u - 0.4) / 0.3;
      const wrist = lerp(v(0.50, 0.48, 0.02), v(0.52, 0.46, 0.04), subU);
      const fingers = lerp(v(0.1, -0.7, 0.25), v(0.15, -0.85, 0.2), subU);
      const curls = lerpCurls(OPEN, POINT, subU);
      return pose(wrist, fingers, v(0.05, 0.15, 1), curls);
    } else {
      // Phase 3: YOU — point outward
      const subU = (u - 0.7) / 0.3;
      const wrist = lerp(v(0.52, 0.46, 0.04), v(0.60, 0.44, 0.1), subU);
      const fingers = lerp(v(0.15, -0.85, 0.2), v(0.3, -0.85, 0.35), subU);
      return pose(wrist, fingers, v(0.05, 0.1, 1), POINT);
    }
  });
}

/** RESTAURANT QUEST — Full 6-phase restaurant conversation (~5.5s) */
function restaurantQuestFrames(): TimedFrame[] {
  return sample(5500, 30, (u) => {
    if (u < 0.15) {
      // Phase 1: HELLO — wave greeting to server
      const subU = u / 0.15;
      const wave = Math.sin(subU * Math.PI * 2) * 0.04;
      const wrist = v(0.58 + subU * 0.08, 0.28 + wave * 0.12, 0);
      const fingers = v(0.15 + subU * 0.2, -0.85 + wave, 0.1);
      return pose(wrist, fingers, v(0, 0.15, 1), OPEN);
    } else if (u < 0.30) {
      // Phase 2: PLEASE — chest circle asking politely
      const subU = (u - 0.15) / 0.15;
      const ang = subU * Math.PI * 2;
      const wrist = v(0.50 + Math.cos(ang) * 0.04, 0.55 + Math.sin(ang) * 0.03, 0);
      return pose(wrist, v(0.05, -0.2, 0.6), v(0, 0.9, 0.3), OPEN);
    } else if (u < 0.48) {
      // Phase 3: WHAT — palms-up questioning gesture ("what do you recommend?")
      const subU = (u - 0.30) / 0.18;
      const bounce = Math.sin(subU * Math.PI) * 0.03;
      const wrist = lerp(v(0.48, 0.48, 0), v(0.56, 0.46, 0.06), subU);
      const fingers = v(0.15, -0.6 + bounce, 0.4);
      return pose(wrist, fingers, v(0, 0.7, 0.6), FIVE);
    } else if (u < 0.65) {
      // Phase 4: FOOD / EAT — flat-O to lips (double tap)
      const subU = (u - 0.48) / 0.17;
      const tap = Math.abs(Math.sin(subU * Math.PI * 2)) * 0.03;
      const wrist = v(0.50, 0.38 - tap, 0);
      return pose(wrist, v(0.05, -0.85, 0.2), v(0, 0.2, 1), FLAT_O);
    } else if (u < 0.82) {
      // Phase 5: THANK YOU — chin outward
      const subU = (u - 0.65) / 0.17;
      const wrist = lerp(v(0.50, 0.40, 0), v(0.60, 0.54, 0.05), subU);
      const fingers = lerp(v(0.05, -1, 0.2), v(0.3, -0.4, 0.5), subU);
      const palm = lerp(v(0, 0.2, 1), v(0, 0.55, 0.7), subU);
      return pose(wrist, fingers, palm, OPEN);
    } else {
      // Phase 6: GOOD / NICE — thumbs up approval
      const subU = (u - 0.82) / 0.18;
      const nod = Math.sin(subU * Math.PI) * 0.025;
      const wrist = lerp(v(0.52, 0.46, 0.05), v(0.54, 0.44, 0.08), subU);
      const fingers = v(0.05, -0.6 + nod, 0.3);
      return pose(wrist, fingers, v(0.1, 0.2, 0.95), THUMBS_UP);
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   SIGN ORDER & CATALOG
   ══════════════════════════════════════════════════════════════════════ */

export const SIGN_ORDER = ['HELLO', 'HOW ARE YOU', 'I AM FINE', "WHAT'S YOUR NAME", 'MY NAME IS', 'NICE TO MEET YOU'] as const;

export const SIGN_CATALOG: Record<string, SignReference> = {
  HELLO: {
    id: 'w1-hello',
    name: 'HELLO',
    phonetic: '/həˈloʊ/',
    meaning: 'Friendly greeting acknowledging another person.',
    instructions: [
      'Open your dominant hand, fingers together.',
      'Touch fingertips to the side of your forehead like a salute.',
      'Move the hand forward and slightly outward.'
    ],
    teachPhases: [
      { start: 0, end: 0.35, caption: 'Open your dominant hand. Raise it so the fingertips sit near the side of your forehead (like a salute).' },
      { start: 0.35, end: 0.75, caption: 'Move the open hand forward and slightly outward, away from your face. Palm faces out.' },
      { start: 0.75, end: 1, caption: 'Finish the outward path. Keep fingers extended with a steady, natural sweep.' }
    ],
    icon: 'waving_hand',
    durationMs: 3800,
    frames: helloFrames(),
    videoUrl: '/videos/clips/HELLO.mp4',
    videoStartTime: 0,
    videoEndTime: 7.8
  },
  'HOW ARE YOU': {
    id: 'w1-how-are-you',
    name: 'HOW ARE YOU',
    phonetic: '/haʊ ɑːr juː/',
    meaning: 'Asking about someone\'s wellbeing.',
    instructions: [
      'Point your index finger forward toward the person.',
      'Curve your hand inward toward your chest while opening to a flat hand.',
      'End with palm facing up near chest in a questioning gesture.'
    ],
    teachPhases: [
      { start: 0, end: 0.35, caption: 'Point your index finger forward toward the person you are addressing.' },
      { start: 0.35, end: 0.7, caption: 'Sweep your hand inward toward your chest. Fingers open gradually from a point to a flat "5" hand.' },
      { start: 0.7, end: 1, caption: 'Finish with your palm facing up near your chest. Small bounce indicates a question.' }
    ],
    icon: 'psychology_alt',
    durationMs: 4200,
    frames: howAreYouFrames(),
    videoUrl: '/videos/clips/HOW_ARE_YOU.mp4',
    videoStartTime: 0,
    videoEndTime: 8.7
  },
  'I AM FINE': {
    id: 'w1-i-am-fine',
    name: 'I AM FINE',
    phonetic: '/aɪ æm faɪn/',
    meaning: 'Responding that you are well.',
    instructions: [
      'Spread all five fingers (open "5" hand), thumb extended.',
      'Touch the thumb to the center of your chest.',
      'Move the hand forward and outward with a confident gesture.'
    ],
    teachPhases: [
      { start: 0, end: 0.4, caption: 'Spread all five fingers into an open "5" hand. Bring your thumb toward the center of your chest.' },
      { start: 0.4, end: 0.7, caption: 'Tap your thumb lightly against your chest — this is the ASL sign for FINE.' },
      { start: 0.7, end: 1, caption: 'Sweep the open hand outward and slightly down to finish confidently.' }
    ],
    icon: 'sentiment_satisfied',
    durationMs: 4000,
    frames: iAmFineFrames(),
    videoUrl: '/videos/clips/I_AM_FINE.mp4',
    videoStartTime: 0,
    videoEndTime: 8.8
  },
  "WHAT'S YOUR NAME": {
    id: 'w1-whats-your-name',
    name: "WHAT'S YOUR NAME",
    phonetic: '/wɒts jɔːr neɪm/',
    meaning: 'Asking someone\'s name.',
    instructions: [
      'Form an H-hand: extend index and middle fingers, curl the rest.',
      'Tap your H-fingers together twice (like tapping stacked fingers) — this is NAME.',
      'Then point your index finger outward — this means YOUR.'
    ],
    teachPhases: [
      { start: 0, end: 0.35, caption: 'Form H-hand (index + middle extended). Tap your two H-fingers together — first tap for NAME.' },
      { start: 0.35, end: 0.65, caption: 'Second tap of H-fingers together. Keep the shape crisp.' },
      { start: 0.65, end: 1, caption: 'Transition to a point: extend index finger outward toward the person — YOUR.' }
    ],
    icon: 'badge',
    durationMs: 4800,
    frames: whatsYourNameFrames(),
    videoUrl: '/videos/clips/WHATS_YOUR_NAME.mp4',
    videoStartTime: 0,
    videoEndTime: 18.3
  },
  'MY NAME IS': {
    id: 'w1-my-name-is',
    name: 'MY NAME IS',
    phonetic: '/maɪ neɪm ɪz/',
    meaning: 'Introducing yourself by name.',
    instructions: [
      'Point your index finger to your own chest — MY.',
      'Form H-hand (index + middle extended) and tap together — first tap for NAME.',
      'Tap H-fingers again — second tap for NAME.'
    ],
    teachPhases: [
      { start: 0, end: 0.3, caption: 'Point to yourself: touch your index finger to your chest — MY.' },
      { start: 0.3, end: 0.65, caption: 'Transition to H-hand (index + middle). Tap H-fingers together — first tap for NAME.' },
      { start: 0.65, end: 1, caption: 'Second tap of H-fingers. Keep the H shape clear throughout.' }
    ],
    icon: 'person',
    durationMs: 4500,
    frames: myNameIsFrames(),
    videoUrl: '/videos/clips/MY_NAME_IS.mp4',
    videoStartTime: 0,
    videoEndTime: 13.6
  },
  'NICE TO MEET YOU': {
    id: 'w1-nice-to-meet-you',
    name: 'NICE TO MEET YOU',
    phonetic: '/naɪs tuː miːt juː/',
    meaning: 'Expressing pleasure at meeting someone.',
    instructions: [
      'NICE: Slide your open dominant hand upward on your opposite flat palm.',
      'MEET: Bring your index finger toward the other hand\'s index (fingers approaching).',
      'YOU: Point your index finger outward at the person.'
    ],
    teachPhases: [
      { start: 0, end: 0.4, caption: 'NICE — Open hand slides upward across your palm or chest. Keep fingers flat.' },
      { start: 0.4, end: 0.7, caption: 'MEET — Index finger approaches the other hand. Fingers come together representing two people meeting.' },
      { start: 0.7, end: 1, caption: 'YOU — Point index finger outward toward the person you are meeting.' }
    ],
    icon: 'handshake',
    durationMs: 4500,
    frames: niceToMeetYouFrames(),
    videoUrl: '/videos/clips/NICE_TO_MEET_YOU.mp4',
    videoStartTime: 0,
    videoEndTime: 12.0
  },
  'RESTAURANT QUEST': {
    id: 'quest-restaurant',
    name: 'RESTAURANT QUEST',
    phonetic: '/ˈrɛstərənt kwɛst/',
    meaning: 'Full restaurant dialogue: Greet server → Ask politely → What do you recommend? → Food → Thank you → Good!',
    instructions: [
      '1. Greet the server with a friendly HELLO wave.',
      '2. PLEASE — flat open hand circles on chest to ask politely.',
      '3. WHAT — palms up questioning ("What do you recommend?").',
      '4. FOOD — flat-O fingertips tap lips twice.',
      '5. THANK YOU — fingertips from chin sweep outward.',
      '6. GOOD — thumbs up approval nod.'
    ],
    teachPhases: [
      { start: 0, end: 0.15, caption: 'Phase 1 — HELLO: Wave to greet the server as you approach.' },
      { start: 0.15, end: 0.30, caption: 'Phase 2 — PLEASE: Flat hand circles on chest. Politely request attention.' },
      { start: 0.30, end: 0.48, caption: 'Phase 3 — WHAT: Palms up in a questioning gesture. "What do you recommend?"' },
      { start: 0.48, end: 0.65, caption: 'Phase 4 — FOOD: Flat-O fingertips tap lips twice. Referencing the meal.' },
      { start: 0.65, end: 0.82, caption: 'Phase 5 — THANK YOU: Fingertips from chin sweep outward toward the server.' },
      { start: 0.82, end: 1, caption: 'Phase 6 — GOOD: Thumbs up! Express approval and satisfaction.' }
    ],
    icon: 'restaurant',
    durationMs: 5500,
    frames: restaurantQuestFrames(),
    videoUrl: '/videos/SL.mp4',
    videoStartTime: 0,
    videoEndTime: 73
  }
};

// Aliases
SIGN_CATALOG.FOOD = SIGN_CATALOG['RESTAURANT QUEST'];
SIGN_CATALOG.ORDER = SIGN_CATALOG['RESTAURANT QUEST'];

export function getSign(name: string): SignReference {
  const upper = name.toUpperCase();
  return SIGN_CATALOG[name] || SIGN_CATALOG[upper] || SIGN_CATALOG.HELLO;
}
