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
  'THANK YOU': {
    handShape: 'Open flat B-hand with all four fingers straight together and thumb resting gently at the side.',
    orientation: 'Fingertips point to chin/lips with palm facing toward your face, transitioning outward toward your partner.',
    startingPosition: 'Tips of extended fingers lightly touching or hovering just in front of your chin and lower lip.',
    movementPath: 'Move hand smoothly forward and slightly downward toward your conversation partner in a warm, open arc.',
    culturalNote: 'Do not hurry this gesture; a respectful slight nod and a pleasant facial expression communicate authentic gratitude.',
    proTips: [
      'Keep fingers straight and held together like a flat paddle.',
      'The movement originates from the elbow and wrist, extending comfortably outward.',
      'Ensure the hand moves forward toward the person you are thanking, not down toward the floor.'
    ]
  },
  PLEASE: {
    handShape: 'Flat open B-hand with palm flat and all fingers extended and together.',
    orientation: 'Palm facing directly against your chest with fingers pointing slightly diagonally upward.',
    startingPosition: 'Dominant hand resting flat against the center of your chest/sternum.',
    movementPath: 'Rub your hand in a gentle, continuous clockwise circular motion across your chest twice.',
    culturalNote: 'PLEASE reflects humble courtesy in ASL. A soft, welcoming smile reinforces the politeness of your request.',
    proTips: [
      'Keep your palm flat against your chest throughout the entire circular path.',
      'Make smooth circular sweeps rather than jerky linear motions.',
      'Two small revolutions at natural conversational pace are ideal.'
    ]
  },
  SORRY: {
    handShape: 'ASL "A" handshape — fingers curled into a neat fist with the thumb resting straight alongside the index finger.',
    orientation: 'Knuckles facing outward and palm-side of the fist resting against the center of your chest.',
    startingPosition: 'Dominant fist placed over the sternum in the center of your chest.',
    movementPath: 'Rub your fist in a circular motion on your chest, tracing two steady circles.',
    culturalNote: 'In ASL grammar, facial expression gives SORRY its weight — an apologetic or remorseful look conveys genuine apology.',
    proTips: [
      'Make sure your thumb rests alongside the index finger rather than tucked under.',
      'Maintain continuous contact with your chest as the fist circles.',
      'Do not move too quickly; keep the movement controlled and sincere.'
    ]
  },
  YES: {
    handShape: 'ASL "S" handshape — a firm closed fist with the thumb curled across the front of the fingers.',
    orientation: 'Knuckles facing forward/outward toward the camera, thumb side facing upward.',
    startingPosition: 'Dominant fist held comfortably in neutral signing space at chest/shoulder level.',
    movementPath: 'Nod the fist up and down from the wrist, bending downward and releasing up twice like a head nod.',
    culturalNote: 'Nod your head in sync with the hand motion to naturally reinforce the affirmative meaning.',
    proTips: [
      'The nod is purely wrist flexion — do not move your entire arm up and down.',
      'Two crisp nods create the standard conversational ASL cadence.',
      'Keep your fist upright and fingers neatly closed.'
    ]
  },
  NO: {
    handShape: 'Index and middle fingers extended together, thumb extended outward underneath them like an open beak.',
    orientation: 'Fingers pointing forward and slightly upward toward your partner, palm angled diagonally.',
    startingPosition: 'Hand held at mid-chest height in neutral signing space.',
    movementPath: 'Snap the tips of your index and middle fingers firmly down onto the tip of your thumb twice.',
    culturalNote: 'A subtle head shake paired with the finger snap reinforces the negation clearly and expressively.',
    proTips: [
      'Keep index and middle fingers glued together throughout the snap.',
      'The snap down onto the thumb should be crisp, definitive, and rhythmic.',
      'Release slightly after the first snap to execute the second tap cleanly.'
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
