import { buildHand, type FingerCurls } from '../vision/handModel';
import { lerp, v } from '../vision/geometry';
import type { SignReference, TimedFrame, Vec3 } from '../vision/types';

/* ── Curl presets ────────────────────────────────────────────────────── */
const OPEN: FingerCurls = [0.15, 0.05, 0.05, 0.08, 0.12];
const FIVE: FingerCurls = [0.05, 0.05, 0.05, 0.05, 0.05];
const FLAT_O: FingerCurls = [0.45, 0.65, 0.65, 0.65, 0.65];
const THUMBS_UP: FingerCurls = [0.05, 0.95, 0.95, 0.95, 0.95];
const A_SHAPE: FingerCurls = [0.15, 0.95, 0.95, 0.95, 0.95];

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

/** THANK YOU — Flat open hand from chin moving outward toward partner */
function thankYouFrames(): TimedFrame[] {
  return sample(2400, 30, (u) => {
    const wrist = lerp(v(0.50, 0.42, 0.0), v(0.52, 0.52, -0.05), u);
    const fingers = lerp(v(0.05, -0.85, 0.0), v(0.1, -0.65, 0.15), u);
    const palm = lerp(v(0, 0.3, -0.9), v(0, 0.6, 0.8), u);
    return pose(wrist, fingers, palm, OPEN);
  });
}

/** PLEASE — Open flat hand circular rubbing motion on chest */
function pleaseFrames(): TimedFrame[] {
  return sample(2600, 30, (u) => {
    const angle = u * Math.PI * 4;
    const circleX = Math.cos(angle) * 0.05;
    const circleY = Math.sin(angle) * 0.05;
    const wrist = v(0.52 + circleX, 0.50 + circleY, 0.02);
    const fingers = v(circleX * 0.5, -0.9, 0.1);
    return pose(wrist, fingers, v(0, 0.2, 0.98), OPEN);
  });
}

/** SORRY — A-hand fist circular rubbing motion on chest */
function sorryFrames(): TimedFrame[] {
  return sample(2600, 30, (u) => {
    const angle = u * Math.PI * 4;
    const circleX = Math.cos(angle) * 0.05;
    const circleY = Math.sin(angle) * 0.05;
    const wrist = v(0.52 + circleX, 0.50 + circleY, 0.02);
    const fingers = v(circleX * 0.4, -0.85, 0.15);
    return pose(wrist, fingers, v(0, 0.2, 0.98), A_SHAPE);
  });
}

/** YES — S-fist in neutral space nodding up and down */
function yesFrames(): TimedFrame[] {
  return sample(2200, 30, (u) => {
    const nod = Math.sin(u * Math.PI * 4) * 0.06;
    const pitch = Math.sin(u * Math.PI * 4) * 0.25;
    const wrist = v(0.58, 0.46 + nod, 0.05);
    const fingers = v(0.05, -0.8 + pitch, 0.25);
    return pose(wrist, fingers, v(0, 0.15, 0.98), THUMBS_UP);
  });
}

/** NO — Extended index & middle fingers snapping down to tap thumb */
function noFrames(): TimedFrame[] {
  return sample(2200, 30, (u) => {
    const snap = Math.pow(Math.sin(u * Math.PI * 4), 2);
    const fingerCurl = 0.05 + (0.85 - 0.05) * snap;
    const curls: FingerCurls = [0.45, fingerCurl, fingerCurl, 0.95, 0.95];
    const wrist = v(0.58, 0.44 + snap * 0.02, 0.05);
    const fingers = v(0.1, -0.75 + snap * 0.1, 0.35);
    return pose(wrist, fingers, v(0, 0.2, 0.95), curls);
  });
}

/* ══════════════════════════════════════════════════════════════════════
   SIGN ORDER & CATALOG
   ══════════════════════════════════════════════════════════════════════ */

export const SIGN_ORDER = ['HELLO', 'THANK YOU', 'PLEASE', 'SORRY', 'YES', 'NO'] as const;

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
  'THANK YOU': {
    id: 'w1-thank-you',
    name: 'THANK YOU',
    phonetic: '/θæŋk juː/',
    meaning: 'Universal expression of courtesy and gratitude.',
    instructions: [
      'Touch your fingertips to your chin with a flat, open hand.',
      'Move your hand forward and slightly downward toward the person.',
      'Keep your palm facing toward yourself at the start, tilting outward as you extend.'
    ],
    teachPhases: [
      { start: 0, end: 0.35, caption: 'Place the fingertips of your flat open dominant hand against your chin or lips.' },
      { start: 0.35, end: 0.75, caption: 'Move your hand outward and slightly downward toward the person you are thanking.' },
      { start: 0.75, end: 1, caption: 'End with your palm angled comfortably upward and outward with a warm smile.' }
    ],
    icon: 'volunteer_activism',
    durationMs: 2400,
    frames: thankYouFrames(),
    videoUrl: '/videos/clips/THANK_YOU.mp4',
    videoStartTime: 0,
    videoEndTime: 3.5
  },
  PLEASE: {
    id: 'w1-please',
    name: 'PLEASE',
    phonetic: '/pliːz/',
    meaning: 'Polite request indicating respect and courtesy.',
    instructions: [
      'Place your flat open hand over the center of your chest.',
      'Keep fingers together and thumb extended comfortably.',
      'Rub your hand in a gentle clockwise circle over your chest twice.'
    ],
    teachPhases: [
      { start: 0, end: 0.3, caption: 'Place your flat open dominant hand flat against the center of your chest.' },
      { start: 0.3, end: 0.7, caption: 'Move your hand in a smooth, continuous clockwise circle on your chest.' },
      { start: 0.7, end: 1, caption: 'Complete the circular motion smoothly to emphasize politeness.' }
    ],
    icon: 'favorite',
    durationMs: 2600,
    frames: pleaseFrames(),
    videoUrl: '/videos/clips/PLEASE.mp4',
    videoStartTime: 0,
    videoEndTime: 3.5
  },
  SORRY: {
    id: 'w1-sorry',
    name: 'SORRY',
    phonetic: '/ˈsɒri/',
    meaning: 'Sincere expression of apology or regret.',
    instructions: [
      'Form an "A" handshape (closed fist with thumb resting alongside index finger).',
      'Place the knuckles and palm side against the center of your chest.',
      'Rub your fist in a circular motion on your chest twice.'
    ],
    teachPhases: [
      { start: 0, end: 0.3, caption: 'Make a fist with your thumb resting straight against the side of your index finger ("A" handshape).' },
      { start: 0.3, end: 0.7, caption: 'Place the fist on your chest and rub in a gentle circular motion.' },
      { start: 0.7, end: 1, caption: 'Convey sincerity with your facial expression as you finish the circle.' }
    ],
    icon: 'sentiment_dissatisfied',
    durationMs: 2600,
    frames: sorryFrames(),
    videoUrl: '/videos/clips/SORRY.mp4',
    videoStartTime: 0,
    videoEndTime: 3.5
  },
  YES: {
    id: 'w1-yes',
    name: 'YES',
    phonetic: '/jɛs/',
    meaning: 'Affirmative response signifying agreement or consent.',
    instructions: [
      'Form an "S" handshape (closed fist with thumb wrapped across fingers).',
      'Hold your fist in front of your chest at comfortable shoulder height.',
      'Nod your fist up and down from the wrist, like a head nodding "yes".'
    ],
    teachPhases: [
      { start: 0, end: 0.3, caption: 'Form a closed fist with your thumb wrapped comfortably over your fingers.' },
      { start: 0.3, end: 0.7, caption: 'Flex your wrist up and down smoothly — simulating a nodding head.' },
      { start: 0.7, end: 1, caption: 'Nod twice with a confident, affirmative rhythm.' }
    ],
    icon: 'check_circle',
    durationMs: 2200,
    frames: yesFrames(),
    videoUrl: '/videos/clips/YES.mp4',
    videoStartTime: 0,
    videoEndTime: 4.0
  },
  NO: {
    id: 'w1-no',
    name: 'NO',
    phonetic: '/noʊ/',
    meaning: 'Negative response indicating refusal, denial, or boundary.',
    instructions: [
      'Extend your index and middle fingers together, with thumb open.',
      'Hold the hand at upper chest level facing slightly outward.',
      'Snap index and middle fingers firmly down onto the thumb twice.'
    ],
    teachPhases: [
      { start: 0, end: 0.3, caption: 'Extend your index and middle fingers together like a beak, with thumb open underneath.' },
      { start: 0.3, end: 0.7, caption: 'Snap your index and middle fingertips down to meet the tip of your thumb.' },
      { start: 0.7, end: 1, caption: 'Release slightly and snap down a second time for a clear, crisp negation.' }
    ],
    icon: 'cancel',
    durationMs: 2200,
    frames: noFrames(),
    videoUrl: '/videos/clips/NO.mp4',
    videoStartTime: 0,
    videoEndTime: 4.0
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
