import { useEffect, useRef, useState } from 'react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { getSign } from '../data/signCatalog';
import { createHandLandmarker, landmarksFromResult } from '../vision/handTracker';
import { drawSkeleton, ghostAtTime } from '../vision/drawHand';
import { liveSyncScore, scoreAttempt, trackingQuality } from '../vision/scoring';
import { diagnoseAttempt } from '../vision/diagnosis';
import { coachSentence, xpForAttempt } from '../vision/coach';
import { palmNormal, dist, fingerJointAngles, dot, normalize, scoreFromError } from '../vision/geometry';
import type { Diagnosis } from '../vision/diagnosis';
import type { LandmarkFrame, MetricScores, TimedFrame, Vec3 } from '../vision/types';
import { useSignMindStore } from '../store/useSignMindStore';
import { soundManager } from '../utils/audio';

export type Phase = 'idle' | 'countdown' | 'go' | 'playing' | 'scoring';

export function usePracticeEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const targetSign = useSignMindStore((s) => s.targetSign);
  const ghostEnabled = useSignMindStore((s) => s.ghostEnabled);
  const recordAttempt = useSignMindStore((s) => s.recordAttempt);
  const completeLesson = useSignMindStore((s) => s.completeLesson);
  const sign = getSign(targetSign);

  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | string | null>(null);
  const [liveSync, setLiveSync] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [debugText, setDebugText] = useState('Camera starting…');
  const [trackerReady, setTrackerReady] = useState(false);
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [trackerError, setTrackerError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [results, setResults] = useState<MetricScores | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [coach, setCoach] = useState('Complete an attempt to get feedback.');
  const [tier, setTier] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [qualityNote, setQualityNote] = useState('');

  // Live real-time telemetry
  const [wristPos, setWristPos] = useState<Vec3>({ x: 0, y: 0, z: 0 });
  const [wristAngles, setWristAngles] = useState<{ pitch: number; roll: number; yaw: number }>({ pitch: 0, roll: 0, yaw: 0 });
  const [fingerCurls, setFingerCurls] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<MetricScores>({
    handShape: 0,
    position: 0,
    orientation: 0,
    trajectory: 0,
    timing: 0,
    overall: 0
  });

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const recordedRef = useRef<TimedFrame[]>([]);
  const playStartRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const ghostRef = useRef(ghostEnabled);
  const signRef = useRef(sign);
  const fpsCountRef = useRef(0);
  const fpsStampRef = useRef(performance.now());
  const recentRef = useRef<LandmarkFrame[]>([]);
  ghostRef.current = ghostEnabled;
  signRef.current = sign;
  phaseRef.current = phase;

  const finishRef = useRef<() => void>(() => {});
  finishRef.current = () => {
    if (phaseRef.current !== 'playing') return;
    phaseRef.current = 'scoring';
    setPhase('scoring');
    const captured = recordedRef.current;
    const refSign = signRef.current;
    const scores = scoreAttempt(captured, refSign.frames);
    const history = useSignMindStore.getState().attemptsHistory;
    const prev = history.find((a) => a.signId === refSign.name);
    const prevBest = history
      .filter((a) => a.signId === refSign.name)
      .reduce((m, a) => Math.max(m, a.overallScore), 0);
    const isPB = scores.overall > prevBest && scores.overall >= 70;
    const diag = diagnoseAttempt(scores, prev ? prev.overallScore : null);
    const advice = coachSentence(diag, refSign.name);
    const { xp, tier: t } = xpForAttempt(scores.overall, isPB);
    setResults(scores);
    setDiagnosis(diag);
    setCoach(advice);
    setTier(t);
    setModalOpen(true);
    soundManager.playSuccess();
    recordAttempt({
      signId: refSign.name,
      handShapeScore: scores.handShape,
      positionScore: scores.position,
      orientationScore: scores.orientation,
      trajectoryScore: scores.trajectory,
      timingScore: scores.timing,
      overallScore: scores.overall,
      xpEarned: xp,
      primaryDivergencePointSeconds: 0,
      aiCoachAdvice: advice
    });
    completeLesson(refSign.id, scores.overall);
    phaseRef.current = 'idle';
    setPhase('idle');
  };

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = landmarkerRef.current;
      const currentStream = streamRef.current;

      if (cancelled || !detector) return;

      // Auto-attach stream if video element was mounted or remounted
      if (video && currentStream && video.srcObject !== currentStream) {
        video.srcObject = currentStream;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-playsinline', 'true');
        video.play().catch(() => {});
      }

      // Resume playback if paused
      if (video && video.paused && video.srcObject) {
        video.play().catch(() => {});
      }

      if (!video || !canvas || video.readyState < 2) return;

      const now = performance.now();
      let user: LandmarkFrame | null = null;
      try {
        user = landmarksFromResult(detector.detectForVideo(video, now));
      } catch {
        /* drop */
      }

      fpsCountRef.current += 1;
      if (now - fpsStampRef.current >= 1000) {
        setFps(fpsCountRef.current);
        fpsCountRef.current = 0;
        fpsStampRef.current = now;
      }

      setHandDetected(!!user);
      if (user) {
        recentRef.current = [...recentRef.current.slice(-8), user];
        const wristPt = user[0];
        setWristPos({ x: wristPt.x, y: wristPt.y, z: wristPt.z });

        // Calculate palm rotation angles (pitch, roll, yaw)
        const norm = palmNormal(user);
        const pitchDeg = Math.round(Math.asin(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI));
        const yawDeg = Math.round(Math.atan2(norm.x, norm.z) * (180 / Math.PI));
        const indexMcp = user[5];
        const pinkyMcp = user[17];
        const rollDeg = Math.round(Math.atan2(pinkyMcp.y - indexMcp.y, pinkyMcp.x - indexMcp.x) * (180 / Math.PI));
        setWristAngles({ pitch: pitchDeg, roll: rollDeg, yaw: yawDeg });

        // Calculate approximate finger curls (0 = straight, 1 = curled)
        // Ratio of tip-to-wrist distance vs MCP-to-wrist distance
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerMcps = [2, 5, 9, 13, 17];
        const curls = fingerTips.map((tipIdx, fIdx) => {
          const mcpIdx = fingerMcps[fIdx];
          const fullLen = dist(user[mcpIdx], user[tipIdx]);
          const wristToTip = dist(user[0], user[tipIdx]);
          const wristToMcp = dist(user[0], user[mcpIdx]);
          const ratio = (wristToTip - wristToMcp) / Math.max(0.01, fullLen);
          return Math.max(0, Math.min(1, parseFloat((1 - (ratio + 0.2) / 1.2).toFixed(2))));
        }) as [number, number, number, number, number];
        setFingerCurls(curls);

        setDebugText(`HAND DETECTED | ${fpsCountRef.current} fps window | wrist ${wristPt.x.toFixed(3)}, ${wristPt.y.toFixed(3)}, ${wristPt.z.toFixed(3)}`);
      } else {
        setDebugText('NO HAND | show your dominant hand to the webcam');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const current = signRef.current;
      const p = phaseRef.current;
      let ghostT = 0;
      if (p === 'playing') ghostT = now - playStartRef.current;
      const showGhost = ghostRef.current && p !== 'scoring';
      const ghost = showGhost ? ghostAtTime(current.frames, ghostT) : null;
      
      const phaseProgress = current.durationMs > 0 ? ghostT / current.durationMs : 0;
      if (p === 'playing') {
        setRecordingProgress(Math.min(1, phaseProgress));
      } else {
        setRecordingProgress(0);
      }

      // Render user hand tracking on webcam canvas (ghost avatar removed per user request)
      if (user) {
        drawSkeleton(ctx, user, w, h, '#00f5a0', 1, true);
      }

      const sync = liveSyncScore(user, ghost);
      setLiveSync(sync);
      setQualityNote(
        `Live tracking quality: ${trackingQuality(user, recentRef.current)}%. Match the motion shown in the tutorial video.`
      );

      // Compute live continuous metrics for Movement Debugger
      if (user && ghost && user.length >= 21 && ghost.length >= 21) {
        const ua = fingerJointAngles(user);
        const ra = fingerJointAngles(ghost);
        let ae = 0;
        const k = Math.min(ua.length, ra.length);
        for (let idx = 0; idx < k; idx++) ae += Math.abs(ua[idx] - ra[idx]);
        const shapeErr = k ? ae / k : 1;
        const liveShape = scoreFromError(shapeErr, 1.1);

        const rWrist = ghost[0];
        const rWristMirr = { x: 1 - rWrist.x, y: rWrist.y, z: rWrist.z };
        const robustDistLive = (a: Vec3, b: Vec3) =>
          Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.35);
        const posErr = Math.min(robustDistLive(user[0], rWrist), robustDistLive(user[0], rWristMirr));
        const livePos = scoreFromError(posErr, 0.55);

        const un = palmNormal(user);
        const rn = palmNormal(ghost);
        const rnMirr = { x: -rn.x, y: rn.y, z: rn.z };
        const unNorm = normalize(un);
        const rnNorm = normalize(rn);
        const rnMirrNorm = normalize(rnMirr);
        const orientErr = Math.min(
          Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(unNorm, rnNorm))))),
          Math.acos(Math.max(-1, Math.min(1, Math.abs(dot(unNorm, rnMirrNorm)))))
        );
        const liveOrient = scoreFromError(orientErr, Math.PI * 0.5);

        const liveTraj = sync;
        const liveTiming = p === 'playing' ? Math.round(100 * Math.max(0, 1 - Math.abs(phaseProgress - (recordedRef.current.length / Math.max(1, (current.durationMs / 1000) * 30))))) : 85;
        const liveOverall = Math.round(
          liveShape * 0.25 + livePos * 0.2 + liveOrient * 0.25 + liveTraj * 0.18 + liveTiming * 0.12
        );

        setLiveMetrics({
          handShape: liveShape,
          position: livePos,
          orientation: liveOrient,
          trajectory: liveTraj,
          timing: Math.min(100, Math.max(10, liveTiming)),
          overall: liveOverall
        });
      }

      if (p === 'playing' && user) {
        recordedRef.current.push({ t: ghostT, landmarks: user.map((pt) => ({ ...pt })) });
      }
      if (p === 'playing' && ghostT >= current.durationMs) {
        finishRef.current();
      }
    };

    (async () => {
      try {
        const detector = await createHandLandmarker();
        if (cancelled) {
          detector.close();
          return;
        }
        landmarkerRef.current = detector;
        setMediaPipeReady(true); // model loaded — camera permission request follows
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.muted = true;
          v.defaultMuted = true;
          v.playsInline = true;
          v.setAttribute('playsinline', 'true');
          v.setAttribute('webkit-playsinline', 'true');
          v.setAttribute('x5-playsinline', 'true');
          try {
            await v.play();
          } catch (playErr) {
            console.warn('Initial video.play() deferred:', playErr);
          }
        }
        setTrackerReady(true);
        setTrackerError(null);
        raf = requestAnimationFrame(loop);
      } catch (err) {
        setTrackerError(err instanceof Error ? err.message : String(err));
        setDebugText('TRACKING FAILED — camera or MediaPipe did not start');
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [canvasRef, videoRef]);

  const startAttempt = () => {
    if (phaseRef.current !== 'idle') return;
    recordedRef.current = [];
    setResults(null);
    setCountdown(3);
    phaseRef.current = 'countdown';
    setPhase('countdown');
    soundManager.playTick();
    let n = 3;
    const tick = () => {
      n -= 1;
      if (n >= 1) {
        setCountdown(n);
        soundManager.playTick();
        window.setTimeout(tick, 700);
      } else {
        setCountdown('GO');
        phaseRef.current = 'go';
        setPhase('go');
        window.setTimeout(() => {
          setCountdown(null);
          playStartRef.current = performance.now();
          recordedRef.current = [];
          phaseRef.current = 'playing';
          setPhase('playing');
        }, 550);
      }
    };
    window.setTimeout(tick, 700);
  };

  return {
    sign,
    phase,
    countdown,
    liveSync,
    handDetected,
    debugText,
    trackerReady,
    mediaPipeReady,
    trackerError,
    fps,
    results,
    diagnosis,
    coach,
    tier,
    modalOpen,
    setModalOpen,
    qualityNote,
    wristPos,
    wristAngles,
    fingerCurls,
    recordingProgress,
    liveMetrics,
    startAttempt
  };
}
