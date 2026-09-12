import React from 'react';
import { getSign } from '../data/signCatalog';
import { VideoReferencePlayer } from './VideoReferencePlayer';

interface Props {
  signName: string;
  onReady: () => void;
}

interface SignGuideInfo {
  handShape: string;
  orientation: string;
  startingPosition: string;
  movementPath: string;
  culturalNote?: string;
  proTips: string[];
}

const SIGN_PEDAGOGY: Record<string, SignGuideInfo> = {
  HELLO: {
    handShape: 'Open B-hand — all 4 fingers straight and pressed together, thumb resting comfortably beside the index finger.',
    orientation: 'Palm facing outward toward the viewer / conversational partner.',
    startingPosition: 'Dominant hand raised to the temple or side of forehead, tips of fingers gently near the brow.',
    movementPath: 'Smooth, confident arc moving forward and slightly outward away from your forehead (like a courteous salute).',
    culturalNote: 'In ASL, a warm facial expression and direct eye contact are essential when delivering this greeting.',
    proTips: [
      'Keep your wrist firm but not stiff — the motion comes from the elbow and forearm.',
      'Do not bend your fingers into a claw; keep the palm flat and planar.',
      'Finish the stroke cleanly before relaxing your arm.'
    ]
  },
  'HOW ARE YOU': {
    handShape: 'Starts with Index Point (1-finger), transitioning fluidly into Open 5-Hand (all fingers extended and spread).',
    orientation: 'Finger points forward → rotates into open palm facing upward near chest level.',
    startingPosition: 'Dominant hand extended forward, pointing directly toward the other person.',
    movementPath: 'Arc the hand inward toward your lower chest while opening fingers, finishing with an upward-facing questioning open palm.',
    culturalNote: 'As an open-ended WH/general question, tilt your head slightly forward and furrow your brows slightly to signal inquiry in ASL.',
    proTips: [
      'Ensure the transition from point to open palm is continuous and fluid.',
      'Add a very subtle upward pulse at the end to emphasize the question.',
      'Keep your opposite hand relaxed or at your side.'
    ]
  },
  'I AM FINE': {
    handShape: 'Open 5-hand with all five fingers spread wide and thumb fully extended.',
    orientation: 'Palm faces across your torso toward the non-dominant side.',
    startingPosition: 'Thumb tip positioned in front of or lightly touching the center of your chest (sternum).',
    movementPath: 'Touch thumb to chest, tap once or twice gently, and sweep slightly forward with confidence.',
    culturalNote: 'The sign FINE conveys contentment and casual comfort. Smile slightly and nod to reinforce the positivity.',
    proTips: [
      'Make sure the thumb clearly makes contact or hovers directly over the sternum.',
      'Do not curl the other four fingers; keep the open "5" spread distinct.',
      'A relaxed outward movement completes the sign naturally.'
    ]
  },
  "WHAT'S YOUR NAME": {
    handShape: 'ASL "H" handshape — index and middle fingers extended together, ring and pinky curled into palm under thumb.',
    orientation: 'Fingers horizontal, palm facing toward yourself / slightly angled.',
    startingPosition: 'Hands in front of chest at mid-torso height.',
    movementPath: 'Tap the extended index and middle fingers together twice (NAME), then extend dominant index forward (YOUR).',
    culturalNote: 'Furrow your brows when asking "What\'s your name?" — in ASL grammar, WH-questions require furrowed eyebrows.',
    proTips: [
      'Keep index and middle fingers pressed tightly together like a single paddle.',
      'The double-tap for NAME should be light, crisp, and rhythmic.',
      'Point cleanly forward on YOUR without dropping your arm too early.'
    ]
  },
  'MY NAME IS': {
    handShape: 'Starts with index point to self, then transitions to ASL "H" handshape (index + middle fingers extended).',
    orientation: 'Self point touches chest; H-hand fingers tap horizontally with palm facing torso.',
    startingPosition: 'Dominant index finger touching center of chest (MY).',
    movementPath: 'Point to chest (MY) → switch to H-hand and tap fingers together twice (NAME).',
    culturalNote: 'Follow this immediately by fingerspelling your name with clear letters at shoulder height.',
    proTips: [
      'Point directly to the center of your own chest for clarity.',
      'Maintain an upright posture so your hand shapes are clearly visible in the signing space.',
      'Keep the H-hand double tap crisp and distinct.'
    ]
  },
  'NICE TO MEET YOU': {
    handShape: 'Flat open B-hand on both hands, transitioning to upright index fingers approaching each other.',
    orientation: 'Dominant palm slides across non-dominant palm facing up; then both index fingers face each other.',
    startingPosition: 'Non-dominant hand flat, palm up; dominant hand rests on top of it at the wrist (NICE).',
    movementPath: 'Slide dominant hand smoothly across the other palm (NICE) → bring index fingers toward each other (MEET) → point outward (YOU).',
    culturalNote: 'This 3-part sequence is the standard polite greeting when meeting someone new in the Deaf community.',
    proTips: [
      'NICE: The slide across the palm should be smooth from wrist toward fingertips.',
      'MEET: Bring the two index fingers together like two people meeting face-to-face.',
      'YOU: Point directly at your partner to conclude.'
    ]
  },
  'RESTAURANT QUEST': {
    handShape: 'Multi-sign sequence covering greeting, polite request, inquiry, food, gratitude, and approval.',
    orientation: 'Varies by phase: salute outward → circular chest rub → palms up → lips tap → chin sweep → thumbs up.',
    startingPosition: 'Comfortable signing box in front of chest and face.',
    movementPath: '1. Hello (salute) → 2. Please (chest circle) → 3. What (palms up) → 4. Food (lips tap) → 5. Thank You (chin outward) → 6. Good (thumbs up).',
    culturalNote: 'Politeness and facial clarity are paramount when dining and ordering in ASL establishments.',
    proTips: [
      'Take your time through each phase without rushing.',
      'Watch the video carefully to internalize the tempo between phrases.',
      'Match the facial expression with each phase (friendly smile, questioning, approving).'
    ]
  }
};

export const WatchLearnStage: React.FC<Props> = ({ signName, onReady }) => {
  const sign = getSign(signName);
  const guide = SIGN_PEDAGOGY[sign.name] || SIGN_PEDAGOGY.HELLO;

  return (
    <div className="w-full px-margin-mobile md:px-margin-tablet xl:px-margin-desktop py-unit-md flex flex-col gap-unit-md max-w-[1440px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <span className="font-label-code-metric text-on-surface-variant uppercase tracking-wider text-xs">
            Step 1 · Watch &amp; Learn
          </span>
          <h1 className="font-headline-lg text-primary font-extrabold m-0 text-2xl sm:text-3xl">
            {sign.name}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Watch the video reference for <span className="text-white font-medium">{sign.name}</span>, study the sign mechanics, and prepare for practice.
          </p>
        </div>

        <button
          onClick={onReady}
          className="self-start sm:self-center px-6 py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm flex items-center gap-2 shrink-0"
        >
          <span>Try It — I’m Ready</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-md items-start">
        {/* Left / Main Column: Isolated Video Clip */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <VideoReferencePlayer
            signName={sign.name}
            videoUrl={sign.videoUrl}
            startTime={sign.videoStartTime}
            endTime={sign.videoEndTime}
          />

          {/* Quick Step-by-Step Instructions */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">checklist</span>
                Step-by-Step Execution
              </span>
              <span className="text-[11px] font-mono text-white/50">{sign.phonetic}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {sign.instructions.map((inst, i) => (
                <div key={i} className="text-xs sm:text-sm text-on-surface flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-primary/30">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{inst}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sign Guidance & Mechanics (Replacing Ghost) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-sm text-secondary">school</span>
              SIGN MECHANICS &amp; ANATOMY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-white/70">
              ASL GUIDE
            </span>
          </div>

          {/* Card 1: Hand Shape & Palm Orientation */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">front_hand</span>
              Hand Shape &amp; Palm Orientation
            </div>
            
            <div className="flex flex-col gap-2 text-xs">
              <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Handshape Form</span>
                <span className="text-on-surface leading-relaxed font-medium">{guide.handShape}</span>
              </div>

              <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Palm Direction</span>
                <span className="text-[#00f5a0] leading-relaxed font-medium">{guide.orientation}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Starting Pose & Motion Trajectory */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">timeline</span>
              Position &amp; Movement Path
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Starting Position</span>
                <span className="text-on-surface leading-relaxed">{guide.startingPosition}</span>
              </div>

              <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Motion Trajectory</span>
                <span className="text-amber-300 leading-relaxed font-medium">{guide.movementPath}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pro-Tips & Accuracy Keys */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">tips_and_updates</span>
              Instructor Pro-Tips
            </div>

            <ul className="flex flex-col gap-2 text-xs text-on-surface/90 m-0 pl-1 list-none">
              {guide.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>

            {guide.culturalNote && (
              <div className="mt-1 pt-2 border-t border-white/5 text-[11px] text-white/60 italic leading-relaxed">
                💡 <strong className="text-white/80 not-italic">Cultural Note:</strong> {guide.culturalNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Try-It Button */}
      <div className="pt-2">
        <button
          onClick={onReady}
          className="w-full py-4 rounded-2xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all text-base shadow-[0_0_24px_rgba(0,245,160,0.3)] flex items-center justify-center gap-2"
        >
          <span>Try It — I’m Ready to Practice</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
