/**
 * CameraReadinessCard — Feature 3: Dynamic Camera Pre-Flight Check
 *
 * This component is PURELY PRESENTATIONAL.
 * It receives real runtime state from the existing usePracticeEngine hook.
 *
 * It does NOT:
 *  - Create a second camera stream
 *  - Create a second MediaPipe/HandLandmarker instance
 *  - Run a second requestAnimationFrame loop
 *  - Use fake/hardcoded states
 *  - Use setTimeout to pretend something is ready
 *  - Generate random values
 *
 * It DOES:
 *  - Map the 4 real readiness conditions from existing engine state
 *  - Derive hand-in-frame from real wristPos coordinates (normalized 0–1)
 *  - Show dynamic transitions as each condition becomes true
 *  - Allow the user to start when the minimum viable conditions are met
 */

import React from 'react';
import type { Vec3 } from '../vision/types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  /** True after createHandLandmarker() resolves — model downloaded and ready */
  mediaPipeReady: boolean;
  /** True after getUserMedia() + video.play() + MediaPipe all succeed */
  cameraReady: boolean;
  /** Error string if any init step threw (camera denied, MediaPipe crash, etc.) */
  trackerError: string | null;
  /** True when the MediaPipe loop detects ≥21 landmarks this frame */
  handDetected: boolean;
  /** Real wrist position in normalized [0,1] camera space (landmark[0]) */
  wristPos: Vec3;
  /** Whether a practice attempt is in progress (hides the card during play) */
  isPracticing: boolean;
  /** Calls the existing startAttempt() — no new engine created */
  onStart: () => void;
  /** Optionally re-try after camera permission denial */
  onRetry: () => void;
}

// ─── Hand-in-frame derivation ─────────────────────────────────────────────────
/**
 * The video element uses `transform: scaleX(-1)` (mirrored).
 * Wrist x,y are normalized [0,1] by MediaPipe.
 * Edge margin of 0.12 on every side is generous — normal adult hands
 * anywhere in the central 76% of the frame pass this check.
 */
const EDGE_MARGIN = 0.12;

function handInFrame(wristPos: Vec3, handDetected: boolean): 'outside' | 'partial' | 'ready' {
  if (!handDetected) return 'outside';
  const { x, y } = wristPos;
  const tooClose =
    x < EDGE_MARGIN || x > 1 - EDGE_MARGIN || y < EDGE_MARGIN || y > 1 - EDGE_MARGIN;
  return tooClose ? 'partial' : 'ready';
}

// ─── Row component ─────────────────────────────────────────────────────────────
type RowState = 'loading' | 'ok' | 'warn' | 'error' | 'idle';

interface RowProps {
  label: string;
  subLabel: string;
  state: RowState;
}

const ICONS: Record<RowState, string> = {
  loading: 'hourglass_empty',
  ok:      'check_circle',
  warn:    'warning',
  error:   'cancel',
  idle:    'radio_button_unchecked',
};
const COLORS: Record<RowState, string> = {
  loading: 'text-amber-400',
  ok:      'text-[#00f5a0]',
  warn:    'text-amber-400',
  error:   'text-red-400',
  idle:    'text-white/30',
};
const LABEL_COLORS: Record<RowState, string> = {
  loading: 'text-amber-300',
  ok:      'text-on-surface',
  warn:    'text-amber-300',
  error:   'text-red-300',
  idle:    'text-on-surface-variant',
};

const ReadinessRow: React.FC<RowProps> = ({ label, subLabel, state }) => (
  <div className="flex items-center gap-3">
    <span
      className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-300 ${COLORS[state]} ${
        state === 'loading' ? 'animate-spin' : ''
      }`}
    >
      {ICONS[state]}
    </span>
    <div className="flex flex-col min-w-0">
      <span className={`text-sm font-semibold transition-colors duration-300 ${LABEL_COLORS[state]}`}>
        {label}
      </span>
      <span className="text-[10px] text-on-surface-variant leading-tight">{subLabel}</span>
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
export const CameraReadinessCard: React.FC<Props> = ({
  mediaPipeReady,
  cameraReady,
  trackerError,
  handDetected,
  wristPos,
  isPracticing,
  onStart,
  onRetry,
}) => {
  // ── Derive the 4 conditions from real state ──────────────────────────────
  // Condition 1: Camera stream
  const cameraState: RowState = trackerError
    ? (trackerError.toLowerCase().includes('denied') ||
       trackerError.toLowerCase().includes('notallowed') ||
       trackerError.toLowerCase().includes('permission')
        ? 'error'
        : 'error')
    : cameraReady
    ? 'ok'
    : 'loading';

  // Condition 2: MediaPipe model
  const mpState: RowState = trackerError
    ? 'error'
    : mediaPipeReady
    ? 'ok'
    : 'loading';

  // Condition 3: Hand detected — real MediaPipe detection result
  const handState: RowState = !cameraReady
    ? 'idle'
    : handDetected
    ? 'ok'
    : 'idle';

  // Condition 4: Hand position in frame — derived from real wrist coordinates
  const frameStatus = handInFrame(wristPos, handDetected);
  const frameState: RowState = !cameraReady
    ? 'idle'
    : frameStatus === 'ready'
    ? 'ok'
    : frameStatus === 'partial'
    ? 'warn'
    : 'idle';

  // ── Overall readiness ────────────────────────────────────────────────────
  // Minimum: camera + MediaPipe + hand detected (frame position is advisory)
  const isPermissionDenied =
    !!trackerError &&
    (trackerError.toLowerCase().includes('denied') ||
     trackerError.toLowerCase().includes('notallowed') ||
     trackerError.toLowerCase().includes('permission') ||
     trackerError.toLowerCase().includes('not found'));
  const isHardError = !!trackerError;
  const minReady = cameraReady && handDetected; // MediaPipe implied by cameraReady
  const fullyReady = minReady && frameStatus === 'ready';

  // ── Overall status badge ─────────────────────────────────────────────────
  let overallLabel = '';
  let overallColor = '';
  let overallDot = '';
  if (isHardError) {
    overallLabel = 'CAMERA ERROR';
    overallColor = 'text-red-400';
    overallDot = 'bg-red-500';
  } else if (!cameraReady) {
    overallLabel = 'INITIALIZING…';
    overallColor = 'text-amber-400';
    overallDot = 'bg-amber-400 animate-pulse';
  } else if (!handDetected) {
    overallLabel = 'SHOW YOUR HAND';
    overallColor = 'text-on-surface-variant';
    overallDot = 'bg-white/20';
  } else if (frameStatus === 'partial') {
    overallLabel = 'MOVE HAND INWARD';
    overallColor = 'text-amber-400';
    overallDot = 'bg-amber-400';
  } else {
    overallLabel = 'READY';
    overallColor = 'text-[#00f5a0]';
    overallDot = 'bg-[#00f5a0] shadow-[0_0_8px_#00f5a0]';
  }

  // ── Collapse during active attempt ───────────────────────────────────────
  if (isPracticing) {
    // Minimal live tracking badge only — does not block the camera view
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all ${
          handDetected
            ? 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30'
            : 'bg-amber-950/40 text-amber-400 border border-amber-400/30'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            handDetected ? 'bg-[#00f5a0] animate-pulse' : 'bg-amber-400'
          }`}
        />
        {handDetected ? 'TRACKING' : 'HAND LOST'}
      </div>
    );
  }

  // ── Permission-denied full card ──────────────────────────────────────────
  if (isPermissionDenied) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-950/50 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-red-400">videocam_off</span>
          <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
            Camera Access Required
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          SIGNMIND needs camera access to evaluate your hand movement. Allow camera access in your
          browser settings (or the address-bar lock icon), then try again.
        </p>
        <button
          onClick={onRetry}
          className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold cursor-pointer hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Try Again
        </button>
      </div>
    );
  }

  // ── Generic error card (MediaPipe crash, etc.) ───────────────────────────
  if (isHardError && !isPermissionDenied) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-red-400">error</span>
          <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
            Tracking Error
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant font-mono break-all">{trackerError}</p>
        <button
          onClick={onRetry}
          className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-bold cursor-pointer hover:bg-surface-bright transition-all"
        >
          Reload Page
        </button>
      </div>
    );
  }

  // ── Normal pre-flight card ───────────────────────────────────────────────
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-4 flex flex-col gap-3 ${
        fullyReady
          ? 'border-[#00f5a0]/30 bg-[#00f5a0]/5'
          : minReady
          ? 'border-amber-400/20 bg-surface-container-lowest/60'
          : 'border-white/10 bg-surface-container-lowest/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-secondary">
            {cameraReady ? 'videocam' : 'videocam_off'}
          </span>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Camera Check
          </span>
        </div>
        {/* Overall status badge */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${overallDot}`} />
          <span className={`text-[10px] font-bold font-mono uppercase ${overallColor}`}>
            {overallLabel}
          </span>
        </div>
      </div>

      {/* 4 Readiness rows — all driven by real state */}
      <div className="flex flex-col gap-2.5">
        <ReadinessRow
          state={cameraState}
          label={
            cameraState === 'loading' ? 'Connecting camera…' :
            cameraState === 'ok'      ? 'Camera connected' :
            'Camera unavailable'
          }
          subLabel={
            cameraState === 'loading' ? 'Requesting camera permission' :
            cameraState === 'ok'      ? 'Video stream active' :
            trackerError ?? 'Check browser settings'
          }
        />
        <ReadinessRow
          state={mpState}
          label={
            mpState === 'loading' ? 'Loading vision engine…' :
            mpState === 'ok'      ? 'MediaPipe ready' :
            'Vision engine error'
          }
          subLabel={
            mpState === 'loading' ? 'Downloading hand tracking model' :
            mpState === 'ok'      ? 'Hand Landmarker initialized' :
            'MediaPipe HandLandmarker failed'
          }
        />
        <ReadinessRow
          state={handState}
          label={
            handState === 'ok'   ? 'Hand detected' :
            handState === 'idle' ? 'No hand detected' :
            'No hand detected'
          }
          subLabel={
            handState === 'ok'   ? 'MediaPipe tracking active' :
            !cameraReady         ? 'Waiting for camera…' :
            'Place one hand in front of the camera'
          }
        />
        <ReadinessRow
          state={frameState}
          label={
            frameState === 'ok'   ? 'Hand in frame' :
            frameState === 'warn' ? 'Move hand inward' :
            'Hand position'
          }
          subLabel={
            frameState === 'ok'   ? 'Hand well-positioned for tracking' :
            frameState === 'warn' ? 'Hand is near the edge — move it toward center' :
            !handDetected         ? 'Show your hand to check position' :
            'Waiting for hand…'
          }
        />
      </div>

      {/* Start button — enabled when minimum conditions met */}
      <button
        onClick={onStart}
        disabled={!minReady}
        className={`w-full py-3 rounded-xl font-extrabold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
          fullyReady
            ? 'bg-primary-container text-on-primary-fixed shadow-[0_0_20px_rgba(0,245,160,0.3)] hover:brightness-110'
            : minReady
            ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
            : 'bg-surface-container-low text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-base">
          {minReady ? 'play_arrow' : 'schedule'}
        </span>
        {minReady ? 'Start Practice' : 'Waiting for camera & hand…'}
      </button>

      {/* Frame guidance — show advisory note when hand partially out */}
      {minReady && frameStatus === 'partial' && (
        <p className="text-[10px] text-amber-400/80 text-center">
          ⚠ Hand is near the frame edge — you can still start, tracking may be reduced
        </p>
      )}
    </div>
  );
};
