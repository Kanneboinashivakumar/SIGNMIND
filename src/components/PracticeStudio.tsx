import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSignMindStore } from '../store/useSignMindStore';
import { usePracticeEngine } from '../hooks/usePracticeEngine';
import { metricLabel } from '../vision/diagnosis';
import type { MetricKey } from '../vision/types';
import type { NavigationTab } from '../types';
import { WatchLearnStage } from './WatchLearnStage';
import { VideoReferencePlayer } from './VideoReferencePlayer';
import { SIGN_ORDER } from '../data/signCatalog';
import { FixMySignCard } from './FixMySignCard';
import { AttemptComparison } from './AttemptComparison';
import { CameraReadinessCard } from './CameraReadinessCard';

// ─── Pedagogy data for Tips tab (mirrors WatchLearnStage) ────────────────────
const SIGN_TIPS: Record<string, string[]> = {
  HELLO: [
    'Keep your wrist firm but not stiff — the motion comes from the elbow and forearm.',
    'Do not bend your fingers into a claw; keep the palm flat and planar.',
    'Finish the stroke cleanly before relaxing your arm.'
  ],
  'THANK YOU': [
    'Keep fingers straight and held together like a flat paddle.',
    'The movement originates from the elbow and wrist, extending comfortably outward.',
    'Ensure the hand moves forward toward the person you are thanking, not down toward the floor.'
  ],
  PLEASE: [
    'Keep your palm flat against your chest throughout the entire circular path.',
    'Make smooth circular sweeps rather than jerky linear motions.',
    'Two small revolutions at natural conversational pace are ideal.'
  ],
  SORRY: [
    'Make sure your thumb rests alongside the index finger rather than tucked under.',
    'Maintain continuous contact with your chest as the fist circles.',
    'Do not move too quickly; keep the movement controlled and sincere.'
  ],
  YES: [
    'The nod is purely wrist flexion — do not move your entire arm up and down.',
    'Two crisp nods create the standard conversational ASL cadence.',
    'Keep your fist upright and fingers neatly closed.'
  ],
  NO: [
    'Keep index and middle fingers glued together throughout the snap.',
    'The snap down onto the thumb should be crisp, definitive, and rhythmic.',
    'Release slightly after the first snap to execute the second tap cleanly.'
  ]
};

const METRICS: { key: MetricKey; title: string }[] = [
  { key: 'handShape',    title: 'Hand Shape'  },
  { key: 'position',     title: 'Position'    },
  { key: 'orientation',  title: 'Orientation' },
  { key: 'trajectory',   title: 'Trajectory'  },
  { key: 'timing',       title: 'Timing'      }
];

function band(n: number) {
  if (n >= 90) return 'Excellent';
  if (n >= 80) return 'Good';
  if (n >= 70) return 'Correct';
  if (n > 0)   return 'Needs work';
  return 'No data';
}

export const PracticeStudio: React.FC = () => {
  const { audioEnabled, toggleAudio, setActiveTab, targetSign } = useSignMindStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<'watch' | 'practice'>('watch');
  useEffect(() => { setStage('watch'); }, [targetSign]);

  if (stage === 'watch') {
    return <WatchLearnStage signName={targetSign} onReady={() => setStage('practice')} />;
  }

  return (
    <PracticeAttemptUI
      videoRef={videoRef}
      canvasRef={canvasRef}
      audioEnabled={audioEnabled}
      toggleAudio={toggleAudio}
      setActiveTab={setActiveTab}
      onRewatch={() => setStage('watch')}
    />
  );
};

// ─── Mobile Camera Tab ────────────────────────────────────────────────────────
const MobileCameraTab: React.FC<{
  e: ReturnType<typeof usePracticeEngine>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scores: ReturnType<typeof usePracticeEngine>['results'];
  displayScores: ReturnType<typeof usePracticeEngine>['results'] | ReturnType<typeof usePracticeEngine>['liveMetrics'] | null;
  isLive: boolean;
  isCurrentLessonCompleted: boolean;
  nextSign: string | null;
  setTargetSign: (s: string) => void;
  setActiveTab: (t: NavigationTab) => void;
  onRewatch: () => void;
}> = ({ e, videoRef, canvasRef, scores, displayScores, isLive, isCurrentLessonCompleted, nextSign, setTargetSign, setActiveTab, onRewatch }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Camera viewport — full width, portrait ratio */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10" style={{ aspectRatio: '3/4' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} width={720} height={960} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Camera ready badge */}
        {e.trackerReady && !e.trackerError && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#00f5a0]/20 backdrop-blur-md border border-[#00f5a0]/40 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse" />
            <span className="text-[#00f5a0] text-[11px] font-bold">Camera Ready</span>
          </div>
        )}

        {/* Debug status */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 text-[#00f5a0] text-[10px] font-mono px-2 py-1 rounded-lg">
          {e.fps} fps
        </div>

        {/* Countdown overlay */}
        {e.countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
            <span className="text-[96px] text-primary-container font-extrabold">{e.countdown}</span>
          </div>
        )}

        {/* Recording indicator */}
        {e.phase === 'playing' && (
          <>
            <div className="absolute top-12 left-3 z-20 px-2.5 py-1 rounded-full bg-red-950/90 text-red-400 text-[10px] border border-red-500/40 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              RECORDING
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-30">
              <div
                className="h-full bg-primary-container transition-all duration-75 ease-linear"
                style={{ width: `${Math.round(e.recordingProgress * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Hand detected status line */}
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${e.handDetected ? 'bg-[#00f5a0]' : 'bg-surface-container-highest'}`} />
        <span className="text-xs text-on-surface-variant">
          {e.trackerError
            ? `Error: ${e.trackerError}`
            : !e.mediaPipeReady
            ? 'Loading vision engine…'
            : !e.trackerReady
            ? 'Starting camera…'
            : e.handDetected
            ? 'Hand detected · Ready to practice'
            : 'Waiting for hand…'}
        </span>
      </div>

      {/* Camera Readiness */}
      <CameraReadinessCard
        mediaPipeReady={e.mediaPipeReady}
        cameraReady={e.trackerReady}
        trackerError={e.trackerError}
        handDetected={e.handDetected}
        wristPos={e.wristPos}
        isPracticing={e.phase === 'countdown' || e.phase === 'go' || e.phase === 'playing' || e.phase === 'scoring'}
        onStart={e.startAttempt}
        onRetry={() => window.location.reload()}
      />

      {/* START ATTEMPT button */}
      {e.phase === 'idle' && (
        <button
          onClick={e.startAttempt}
          disabled={!e.trackerReady}
          className="w-full py-4 rounded-2xl bg-primary-container text-on-primary-fixed font-extrabold text-base cursor-pointer disabled:opacity-40 shadow-[0_0_24px_rgba(0,245,160,0.35)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <span>START ATTEMPT</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      )}

      {e.phase === 'playing' && (
        <div className="w-full py-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 font-extrabold text-center">
          SIGNING… Hold your sign
        </div>
      )}
      {(e.phase === 'countdown' || e.phase === 'go') && (
        <div className="w-full py-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400 font-extrabold text-center">
          GET READY…
        </div>
      )}

      {/* Movement Debugger live metrics */}
      <div className="rounded-2xl bg-surface-container-low border border-white/5 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Movement Debugger</span>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/20 text-[#00f5a0] text-[10px] font-mono font-bold animate-pulse">LIVE</span>
            )}
            <span className="text-primary-container font-bold text-base font-mono">
              {displayScores ? `${displayScores.overall}%` : '—'}
            </span>
          </div>
        </div>
        {METRICS.map((m) => {
          const value = displayScores ? displayScores[m.key] : 0;
          const focus = scores && e.diagnosis?.priorityIssue === m.key;
          return (
            <div key={m.key} className={`rounded-xl border px-2 py-1.5 ${focus ? 'border-error/40 bg-error/10' : 'border-white/5 bg-surface-container-lowest/60'}`}>
              <div className="flex justify-between text-xs">
                <span className={focus ? 'text-error font-bold' : 'text-on-surface'}>{m.title}</span>
                <span className={focus ? 'text-error font-bold' : 'text-primary-container font-mono'}>
                  {displayScores ? `${value}% ${band(value)}` : '—'}
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                <div className={`h-full rounded-full transition-all duration-100 ${focus ? 'bg-error' : 'bg-primary-container'}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ASL Video Tutorial */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">ASL Video Tutorial</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-container/20 text-primary-container font-bold">HD</span>
        </div>
        <div
          className="rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden cursor-pointer"
          onClick={onRewatch}
        >
          <div className="relative aspect-video">
            <video
              className="w-full h-full object-cover opacity-80"
              src={e.sign.videoUrl}
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-10 h-10 rounded-full bg-primary-container/90 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-2">
            <span className="font-bold text-sm text-on-surface">{e.sign.name}</span>
            <p className="text-xs text-on-surface-variant mt-0.5">Observe hand shape, orientation and motion trajectory.</p>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col gap-2">
        {nextSign && isCurrentLessonCompleted && (
          <button
            onClick={() => setTargetSign(nextSign)}
            className="w-full py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm"
          >
            <span>Move to Next Sign: {nextSign}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
        <button
          onClick={onRewatch}
          className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant cursor-pointer text-xs font-semibold"
        >
          Watch &amp; Learn again
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant cursor-pointer text-xs font-semibold"
        >
          Return to Journey
        </button>
      </div>
    </div>
  );
};

// ─── Main Practice Attempt UI ─────────────────────────────────────────────────
const PracticeAttemptUI: React.FC<{
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  audioEnabled: boolean;
  toggleAudio: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  onRewatch: () => void;
}> = ({ videoRef, canvasRef, audioEnabled, toggleAudio, setActiveTab, onRewatch }) => {
  const e = usePracticeEngine(canvasRef, videoRef);
  const xp = useSignMindStore((s) => s.xp);
  const setTargetSign = useSignMindStore((s) => s.setTargetSign);
  const attemptsHistory = useSignMindStore((s) => s.attemptsHistory);
  const scores = e.results;
  const displayScores = scores || (e.handDetected ? e.liveMetrics : null);
  const isLive = !scores && e.handDetected;

  const lessons = useSignMindStore((s) => s.lessons);
  const currentLesson = lessons.find((l) => l.signName === e.sign.name || l.id === e.sign.id);
  const isCurrentLessonCompleted =
    currentLesson?.status === 'completed' ||
    currentLesson?.status === 'perfect' ||
    (scores && scores.overall >= 70);

  const currentIdx = SIGN_ORDER.indexOf(e.sign.name as typeof SIGN_ORDER[number]);
  const nextSign = currentIdx >= 0 && currentIdx < SIGN_ORDER.length - 1 ? SIGN_ORDER[currentIdx + 1] : null;

  const ALL_METRIC_KEYS: MetricKey[] = ['handShape', 'position', 'orientation', 'trajectory', 'timing'];
  const weakestKey: MetricKey = scores
    ? ALL_METRIC_KEYS.reduce((lowest, key) => (scores[key] < scores[lowest] ? key : lowest))
    : 'handShape';

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'camera' | 'tutorial' | 'tips'>('camera');
  const tips = SIGN_TIPS[e.sign.name] || SIGN_TIPS.HELLO;

  return (
    <div className="w-full flex flex-col">

      {/* ══════════════════════ MOBILE LAYOUT < xl ══════════════════════ */}
      <div className="xl:hidden w-full flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={onRewatch} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <span className="font-bold text-on-surface text-base">Practice Studio</span>
          <button onClick={toggleAudio} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              {audioEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>
        </div>

        {/* Sign banner */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl bg-surface-container-low border border-white/5 p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Target Sign</span>
              <div className="font-extrabold text-2xl text-primary tracking-tight">{e.sign.name}</div>
              <span className="text-xs text-on-surface-variant">{e.sign.phonetic} · Mirror the tutorial video</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-on-surface-variant font-bold">XP</span>
              <span className="text-amber-400 font-extrabold font-mono text-sm">{xp}</span>
            </div>
          </div>
        </div>

        {/* Mobile Tabs: Camera / Tutorial / Tips */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full">
            {(['camera', 'tutorial', 'tips'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer capitalize ${
                  mobileTab === tab
                    ? 'bg-surface-container-highest text-primary-container shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                {tab === 'camera' ? 'Camera' : tab === 'tutorial' ? 'Tutorial' : 'Tips'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 pb-6">
          {mobileTab === 'camera' && (
            <MobileCameraTab
              e={e}
              videoRef={videoRef}
              canvasRef={canvasRef}
              scores={scores}
              displayScores={displayScores}
              isLive={isLive}
              isCurrentLessonCompleted={!!isCurrentLessonCompleted}
              nextSign={nextSign}
              setTargetSign={setTargetSign}
              setActiveTab={setActiveTab}
              onRewatch={onRewatch}
            />
          )}

          {mobileTab === 'tutorial' && (
            <div className="flex flex-col gap-3">
              <VideoReferencePlayer
                signName={e.sign.name}
                videoUrl={e.sign.videoUrl}
                startTime={e.sign.videoStartTime}
                endTime={e.sign.videoEndTime}
              />
              <div className="rounded-2xl bg-surface-container-low border border-white/5 p-3 flex flex-col gap-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase">How to sign "{e.sign.name}"</span>
                {e.sign.instructions.map((step: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs text-on-surface">
                    <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setMobileTab('camera')}
                className="w-full py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer text-sm"
              >
                Go to Camera
              </button>
            </div>
          )}

          {mobileTab === 'tips' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-surface-container-low border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-amber-400 text-base">tips_and_updates</span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Instructor Tips</span>
                </div>
                <div className="flex flex-col gap-3">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm text-on-surface">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-surface-container-low border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base">front_hand</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Coach</span>
                </div>
                <p className="text-sm text-on-surface">{e.coach}</p>
              </div>
              <button
                onClick={() => setMobileTab('camera')}
                className="w-full py-3 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer text-sm"
              >
                Go to Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════ DESKTOP LAYOUT xl+ ══════════════════════ */}
      <div className="hidden xl:block w-full px-margin-desktop py-unit-md max-w-[1520px] mx-auto">
        <div className="w-full bg-surface-container-low/95 backdrop-blur-2xl rounded-2xl p-unit-md shadow-xl flex flex-wrap items-center justify-between gap-unit-md border border-white/5">
          <div>
            <span className="font-label-code-metric text-on-surface-variant uppercase tracking-wider">Target sign</span>
            <h1 className="font-headline-lg text-primary tracking-tight font-extrabold m-0">{e.sign.name}</h1>
            <span className="text-on-surface-variant text-sm">{e.sign.phonetic} · mirror the tutorial video</span>
          </div>
          <div className="flex items-center flex-wrap gap-unit-sm">
            <div className="flex items-center gap-unit-xs bg-surface-container-highest/80 px-unit-md py-unit-xs rounded-full border border-primary-container/20">
              <span className="font-label-code-metric text-on-surface-variant">XP</span>
              <span className="font-label-telemetry text-amber-400 font-extrabold">{xp}</span>
            </div>
            <div className="flex items-center gap-unit-xs bg-surface-container-highest/80 px-unit-md py-unit-xs rounded-full border border-primary-container/20">
              <span className="font-label-code-metric text-on-surface-variant">LIVE SYNC</span>
              <span className="font-label-telemetry text-primary-container font-bold">
                {e.handDetected ? `${e.liveSync}%` : 'NO HAND'}
              </span>
            </div>
            {e.tier && (
              <div className="px-unit-md py-unit-xs rounded-full bg-secondary-container/40 text-secondary font-bold text-sm">
                {e.tier}
              </div>
            )}
            <button onClick={toggleAudio} className="p-unit-xs rounded-full bg-surface-container-high cursor-pointer" title="Toggle audio feedback">
              <span className="material-symbols-outlined">{audioEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-unit-md items-start mt-unit-md">
          {/* Left: Telemetry Panel */}
          <div className="xl:col-span-3 flex flex-col gap-unit-sm">
            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col gap-3 bg-surface-container-lowest/80">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">sensors</span>
                  Live Telemetry
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${e.handDetected ? 'bg-[#00f5a0]/20 text-[#00f5a0]' : 'bg-white/10 text-on-surface-variant'}`}>
                  {e.handDetected ? 'TRACKING' : 'SEARCHING'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant">WRIST 3D POSITION</span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  {(['X', 'Y', 'DEPTH Z'] as const).map((label, idx) => {
                    const vals = ['x', 'y', 'z'] as const;
                    return (
                      <div key={label} className="bg-surface-container-high p-1.5 rounded-lg text-center">
                        <span className="text-white/40 block text-[9px]">{label}</span>
                        <span className="text-[#00f5a0] font-bold">{e.handDetected ? e.wristPos[vals[idx]].toFixed(2) : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-on-surface-variant">WRIST / PALM ROTATION</span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  {(['PITCH', 'ROLL', 'YAW'] as const).map((a) => (
                    <div key={a} className="bg-surface-container-high p-1.5 rounded-lg text-center">
                      <span className="text-white/40 block text-[9px]">{a}</span>
                      <span className="text-primary-container font-bold">
                        {e.handDetected ? `${e.wristAngles[a.toLowerCase() as 'pitch' | 'roll' | 'yaw']}°` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-on-surface-variant">FINGER EXTENSION / CURL</span>
                {(['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'] as const).map((name, idx) => {
                  const curl = e.handDetected ? e.fingerCurls[idx] : 0;
                  const isCurled = curl > 0.6;
                  return (
                    <div key={name} className="flex items-center gap-2 text-[10px]">
                      <span className="w-11 text-on-surface-variant">{name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div className={`h-full transition-all duration-75 ${isCurled ? 'bg-amber-400' : 'bg-[#00f5a0]'}`} style={{ width: `${Math.round(curl * 100)}%` }} />
                      </div>
                      <span className="w-7 text-right font-mono text-[10px] text-white/60">
                        {e.handDetected ? `${Math.round(curl * 100)}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {e.phase === 'playing' && (
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                  <span className="text-[10px] font-bold text-primary block uppercase">Recording Progress</span>
                  <p className="text-on-surface text-[11px] leading-tight mt-0.5 font-medium">
                    Perform the {e.sign.name} sign steadily until recording finishes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center: Camera */}
          <div className="xl:col-span-5 flex flex-col gap-unit-md">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/10">
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted autoPlay />
              <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
              <div className="absolute top-3 left-3 right-3 z-20 font-mono text-[11px] sm:text-xs bg-black/70 text-[#00f5a0] px-3 py-2 rounded-lg border border-[#00f5a0]/30">
                {e.debugText} · engine {e.fps} fps
                {e.trackerError ? ` · ERROR: ${e.trackerError}` : e.trackerReady ? ' · MediaPipe HandLandmarker' : ' · loading model…'}
              </div>
              {e.countdown !== null && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                  <span className="text-[96px] text-primary-container font-extrabold">{e.countdown}</span>
                </div>
              )}
              {e.phase === 'playing' && (
                <>
                  <div className="absolute top-14 right-3 z-20 px-3 py-1 rounded-full bg-red-950/90 text-red-400 text-xs border border-red-500/40 flex items-center gap-2 font-mono shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>RECORDING MOTION</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-30">
                    <div className="h-full bg-primary-container transition-all duration-75 ease-linear shadow-[0_0_12px_#00f5a0]" style={{ width: `${Math.round(e.recordingProgress * 100)}%` }} />
                  </div>
                </>
              )}
              <div className="absolute bottom-4 inset-x-4 z-20 flex justify-end">
                <button
                  onClick={e.startAttempt}
                  disabled={e.phase !== 'idle' || !e.trackerReady}
                  className="px-unit-xl py-unit-sm rounded-xl bg-primary-container text-on-primary-fixed font-extrabold shadow-[0_0_24px_rgba(0,245,160,0.4)] cursor-pointer disabled:opacity-40"
                >
                  {e.phase === 'playing' ? 'SIGNING…' : e.phase === 'countdown' || e.phase === 'go' ? 'GET READY' : 'START ATTEMPT'}
                </button>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant">{e.qualityNote}</p>
          </div>

          {/* Right: Side panels */}
          <div className="xl:col-span-4 flex flex-col gap-unit-md">
            <VideoReferencePlayer signName={e.sign.name} videoUrl={e.sign.videoUrl} startTime={e.sign.videoStartTime} endTime={e.sign.videoEndTime} />
            <CameraReadinessCard
              mediaPipeReady={e.mediaPipeReady}
              cameraReady={e.trackerReady}
              trackerError={e.trackerError}
              handDetected={e.handDetected}
              wristPos={e.wristPos}
              isPracticing={e.phase === 'countdown' || e.phase === 'go' || e.phase === 'playing' || e.phase === 'scoring'}
              onStart={e.startAttempt}
              onRetry={() => window.location.reload()}
            />

            <div className="glass-panel rounded-2xl p-unit-lg flex flex-col gap-unit-md border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm font-bold">Movement Debugger</span>
                  {isLive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/20 text-[#00f5a0] text-[10px] font-mono font-bold animate-pulse">LIVE</span>
                  )}
                </div>
                <span className="text-primary-container font-bold text-lg font-mono">
                  {displayScores ? `${displayScores.overall}%` : '—'}
                </span>
              </div>
              {METRICS.map((m) => {
                const value = displayScores ? displayScores[m.key] : 0;
                const focus = scores && e.diagnosis?.priorityIssue === m.key;
                return (
                  <div key={m.key} className={`p-unit-xs rounded-xl border ${focus ? 'border-error/40 bg-error/10' : 'border-white/5 bg-surface-container-lowest/70'}`}>
                    <div className="flex justify-between text-sm">
                      <span className={focus ? 'text-error font-bold' : 'text-on-surface'}>{m.title}</span>
                      <span className={focus ? 'text-error font-bold' : 'text-primary-container font-mono'}>
                        {displayScores ? `${value}% ${band(value)}` : '—'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                      <div className={`h-full rounded-full transition-all duration-100 ${focus ? 'bg-error' : 'bg-primary-container'}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="p-unit-md rounded-xl bg-surface-container-lowest/90 border border-primary-container/20">
                <div className="font-bold text-sm mb-2">How to sign "{e.sign.name}"</div>
                {e.sign.instructions.map((step: string, i: number) => (
                  <div key={i} className="text-xs text-on-surface-variant flex gap-2 mb-1">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="p-unit-md rounded-xl bg-secondary-container/20 border border-secondary/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-secondary text-sm">AI Coach (templates)</span>
                </div>
                <p className="text-sm text-on-surface">{e.coach}</p>
              </div>

              {nextSign && isCurrentLessonCompleted && (
                <button
                  onClick={() => setTargetSign(nextSign)}
                  className="w-full py-unit-md rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm"
                >
                  <span>Move to Next Sign: {nextSign}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              )}

              <button
                onClick={e.startAttempt}
                disabled={e.phase !== 'idle'}
                className={`w-full py-unit-md rounded-xl font-bold cursor-pointer disabled:opacity-40 transition-all ${
                  isCurrentLessonCompleted && nextSign
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright text-xs'
                    : 'bg-primary-container text-on-primary-fixed shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm'
                }`}
              >
                {scores ? 'Retry' : 'Start Attempt'}
              </button>
              <button onClick={onRewatch} className="w-full py-unit-sm rounded-xl bg-surface-container-high text-on-surface-variant cursor-pointer text-xs">
                Watch &amp; Learn again
              </button>
              <button onClick={() => setActiveTab('journey')} className="w-full py-unit-sm rounded-xl bg-surface-container-high text-on-surface-variant cursor-pointer text-xs">
                Return to Journey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal (unchanged, works on both mobile and desktop) */}
      {e.modalOpen && e.diagnosis && scores && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl">
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-surface-container-low border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-primary font-bold uppercase">Attempt result</div>
                  <h2 className="text-xl font-extrabold m-0">{e.sign.name} · {e.diagnosis.score}%</h2>
                  {e.tier && <div className="text-secondary font-bold">{e.tier}</div>}
                </div>
                <button onClick={() => e.setModalOpen(false)} className="cursor-pointer shrink-0">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-sm">
                {e.diagnosis.priorityIssue
                  ? `Priority issue: ${metricLabel(e.diagnosis.priorityIssue)} (${e.diagnosis.allScores[e.diagnosis.priorityIssue]}%).`
                  : 'All five metrics are strong — no invented problem.'}
                {e.diagnosis.improvementFromLastAttempt !== null && (
                  <span> Change vs last {e.sign.name}: {e.diagnosis.improvementFromLastAttempt >= 0 ? '+' : ''}
                    {e.diagnosis.improvementFromLastAttempt}.
                  </span>
                )}
              </p>
              <p className="text-sm text-on-surface-variant">{e.coach}</p>

              <div className="grid grid-cols-2 gap-2">
                {METRICS.map((m) => (
                  <div key={m.key} className="text-xs">
                    {m.title}: <strong>{e.diagnosis!.allScores[m.key]}%</strong>
                  </div>
                ))}
              </div>

              <FixMySignCard scores={scores} coach={e.coach} signName={e.sign.name} onRetry={() => { e.setModalOpen(false); e.startAttempt(); }} />
              <AttemptComparison signId={e.sign.name} attemptsHistory={attemptsHistory} weakestKey={weakestKey} />

              <div className="flex flex-col gap-2 pt-1">
                {e.diagnosis.score >= 70 ? (
                  <>
                    <div className="p-3 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-primary">verified</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary">SIGN COMPLETED (≥70% ACCURACY)!</span>
                        <span className="text-[11px] text-on-surface-variant">Completed! You accurately reproduced the sign.</span>
                      </div>
                    </div>
                    {nextSign ? (
                      <button onClick={() => { e.setModalOpen(false); setTargetSign(nextSign); }} className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm">
                        <span>Move to Next Sign: {nextSign}</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    ) : (
                      <button onClick={() => { e.setModalOpen(false); setActiveTab('journey'); }} className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm">
                        <span>All Signs Completed · Return to Journey</span>
                        <span className="material-symbols-outlined">map</span>
                      </button>
                    )}
                    <button onClick={() => { e.setModalOpen(false); e.startAttempt(); }} className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold cursor-pointer hover:bg-surface-bright transition-all">
                      Retry
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { e.setModalOpen(false); e.startAttempt(); }} className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-fixed font-extrabold cursor-pointer hover:brightness-110 active:scale-98 transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)] text-sm">
                      Retry (Goal: 70%)
                    </button>
                    <button onClick={() => { e.setModalOpen(false); onRewatch(); }} className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-semibold cursor-pointer hover:bg-surface-bright transition-all">
                      Watch Tutorial Video Again
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
