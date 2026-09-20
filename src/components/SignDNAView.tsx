import React from 'react';
import { useSignMindStore } from '../store/useSignMindStore';

export const SignDNAView: React.FC = () => {
  const { signDNA, userName, userId, level, levelTitle, activeAltitudeMeters, setActiveTab, setTargetSign } = useSignMindStore();

  const handleStartRx = () => {
    setTargetSign('HELLO');
    setActiveTab('practice');
  };

  // Dynamically compute 5-axis radar polygon points from live signDNA
  const maxR = 125;
  const pShape = [150, 150 - (maxR * signDNA.handShape) / 100];
  const pTrajectory = [
    150 + Math.sin(0.4 * Math.PI) * maxR * (signDNA.trajectory / 100),
    150 - Math.cos(0.4 * Math.PI) * maxR * (signDNA.trajectory / 100)
  ];
  const pTiming = [
    150 + Math.sin(0.8 * Math.PI) * maxR * (signDNA.timing / 100),
    150 - Math.cos(0.8 * Math.PI) * maxR * (signDNA.timing / 100)
  ];
  const pOrientation = [
    150 - Math.sin(0.8 * Math.PI) * maxR * (signDNA.orientation / 100),
    150 - Math.cos(0.8 * Math.PI) * maxR * (signDNA.orientation / 100)
  ];
  const pPosition = [
    150 - Math.sin(0.4 * Math.PI) * maxR * (signDNA.position / 100),
    150 - Math.cos(0.4 * Math.PI) * maxR * (signDNA.position / 100)
  ];

  const radarPolygonPoints = `${pShape[0].toFixed(1)},${pShape[1].toFixed(1)} ${pTrajectory[0].toFixed(1)},${pTrajectory[1].toFixed(1)} ${pTiming[0].toFixed(1)},${pTiming[1].toFixed(1)} ${pOrientation[0].toFixed(1)},${pOrientation[1].toFixed(1)} ${pPosition[0].toFixed(1)},${pPosition[1].toFixed(1)}`;

  return (
    <div className="w-full px-4 md:px-margin-tablet xl:px-margin-desktop py-4 md:py-unit-xl flex flex-col gap-unit-xl md:gap-unit-2xl max-w-[1440px] mx-auto">
      {/* SECTION 1: TOP MASTHEAD & PROFILE SUMMARY */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-unit-lg md:p-unit-2xl shadow-xl border border-white/5">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-unit-xl">
          <div className="flex flex-col gap-unit-xs max-w-2xl">
            <div className="flex items-center gap-unit-xs">
              <span className="inline-flex items-center gap-1.5 px-unit-sm py-0.5 rounded-full bg-surface-container-highest text-primary font-label-code-metric text-label-code-metric uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
                Biometric Profile Active
              </span>
              <span className="text-on-surface-variant font-label-telemetry text-label-telemetry">
                ID: {userId}
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg md:font-display-hero md:text-display-hero text-on-surface tracking-tight font-extrabold">
              {userName}'s <span className="text-primary-container">SignDNA</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Kinematic Movement Fingerprint &amp; Neural Biomechanics Matrix
            </p>

            <div className="flex flex-wrap items-center gap-unit-md mt-unit-sm pt-unit-xs">
              <div className="flex items-center gap-unit-xs">
                <span className="material-symbols-outlined text-primary-container text-body-lg">terrain</span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface font-semibold">
                  ZONE 2: EXPLORER RIDGE
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <div className="flex items-center gap-unit-xs">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-body-lg">military_tech</span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface font-semibold">
                  LVL 0{level} {levelTitle.toUpperCase()}
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <div className="flex items-center gap-unit-xs">
                <span className="material-symbols-outlined text-secondary text-body-lg">history_edu</span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface font-semibold">
                  {signDNA.synapseRuns} SYNAPSE RUNS
                </span>
              </div>
            </div>
          </div>

          {/* ACCURACY HERO GAUGE & ALTITUDE BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-unit-lg w-full xl:w-auto shrink-0 bg-surface-container/70 backdrop-blur-xl p-unit-lg rounded-2xl shadow-md border border-white/5">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  className="text-surface-container-highest stroke-current"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  strokeWidth="9"
                />
                <circle
                  className="text-primary-container stroke-current transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  strokeDasharray="314.159"
                  strokeDashoffset={314.159 - (314.159 * signDNA.globalPrecision) / 100}
                  strokeLinecap="round"
                  strokeWidth="9"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none font-extrabold">
                  {signDNA.globalPrecision}
                  <span className="text-primary-container font-label-telemetry text-label-telemetry">%</span>
                </span>
                <span className="font-label-code-metric text-label-code-metric text-on-surface-variant uppercase mt-0.5">
                  Global Precision
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-unit-xs w-full sm:w-56">
              <div className="flex justify-between items-baseline font-label-code-metric text-label-code-metric">
                <span className="text-on-surface-variant uppercase">Ridge Altitude</span>
                <span className="text-primary font-bold">{activeAltitudeMeters.toLocaleString()}m ({Math.round((activeAltitudeMeters / 4500) * 100)}% to Summit)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-container via-primary-container to-primary-fixed rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round((activeAltitudeMeters / 4500) * 100))}%` }}
                ></div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Top 12% velocity in current cohort. 3 milestones to Summit Trial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 5 CORE DIMENSIONS + ISOMETRIC RADAR SCHEMATIC */}
      <section className="flex flex-col gap-unit-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-unit-sm">
          <div>
            <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-primary-container uppercase font-bold">
              <span className="material-symbols-outlined text-body-sm">hub</span>
              <span>Spatial Kinematics Engine</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
              5 Core Movement Dimensions
            </h2>
          </div>
          <div className="flex items-center gap-unit-xs text-on-surface-variant font-label-telemetry text-label-telemetry">
            <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00f5a0]"></span>
            CAMERA OPTICAL SAMPLING: 60 FPS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-lg items-start">
          {/* RADAR SCHEMATIC (5 COLS on desktop, appears after progress cards on mobile) */}
          <div className="order-2 lg:order-1 lg:col-span-5 bg-surface-container-low rounded-2xl p-unit-lg flex flex-col items-center justify-between shadow-lg relative overflow-hidden border border-white/5">
            <div className="w-full flex items-center justify-between font-label-code-metric text-label-code-metric text-on-surface-variant">
              <span className="uppercase font-bold">Vector Distribution</span>
              <span className="text-primary font-bold">ISOMETRIC VIEW</span>
            </div>

            {/* Radar SVG Canvas from Stitch */}
            <div className="relative w-full max-w-[320px] aspect-square my-unit-md flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 300">
                <polygon
                  className="stroke-surface-container-highest"
                  fill="none"
                  points="150,20 274,110 226,258 74,258 26,110"
                  strokeDasharray="3,3"
                  strokeWidth="1.5"
                />
                <polygon
                  className="stroke-surface-container-highest"
                  fill="none"
                  points="150,60 236,122 203,222 97,222 64,122"
                  strokeWidth="1.5"
                />
                <polygon
                  className="stroke-surface-container-highest"
                  fill="none"
                  points="150,100 197,135 179,190 121,190 103,135"
                  strokeWidth="1.5"
                />
                {/* Spokes */}
                <line className="stroke-surface-container-highest" strokeWidth="1.5" x1="150" x2="150" y1="150" y2="20" />
                <line className="stroke-surface-container-highest" strokeWidth="1.5" x1="150" x2="274" y1="150" y2="110" />
                <line className="stroke-surface-container-highest" strokeWidth="1.5" x1="150" x2="226" y1="150" y2="258" />
                <line className="stroke-surface-container-highest" strokeWidth="1.5" x1="150" x2="74" y1="150" y2="258" />
                <line className="stroke-surface-container-highest" strokeWidth="1.5" x1="150" x2="26" y1="150" y2="110" />

                {/* Optimal Baseline Reference Polygon */}
                <polygon
                  className="stroke-outline-variant"
                  fill="none"
                  points="150,30 262,112 218,245 82,245 38,112"
                  strokeDasharray="4,4"
                  strokeWidth="1"
                />

                {/* Maya's Dynamic Active Polygon */}
                <polygon
                  className="stroke-primary-container transition-all duration-700"
                  fill="rgba(0, 245, 160, 0.18)"
                  points={radarPolygonPoints}
                  strokeWidth="2.5"
                />
                <circle className="fill-primary-container shadow-[0_0_8px_#00f5a0]" cx={pShape[0]} cy={pShape[1]} r="4.5" />
                <circle className="fill-primary-container" cx={pTrajectory[0]} cy={pTrajectory[1]} r="4" />
                <circle className="fill-tertiary-fixed-dim" cx={pTiming[0]} cy={pTiming[1]} r="4" />
                <circle className="fill-error shadow-[0_0_8px_#ffb4ab]" cx={pOrientation[0]} cy={pOrientation[1]} r="5" />
                <circle className="fill-primary-container" cx={pPosition[0]} cy={pPosition[1]} r="4" />
              </svg>

              <span className="absolute top-1 font-label-telemetry text-label-telemetry text-on-surface">SHAPE</span>
              <span className="absolute right-0 top-1/3 font-label-telemetry text-label-telemetry text-on-surface">TRAJECTORY</span>
              <span className="absolute right-4 bottom-2 font-label-telemetry text-label-telemetry text-on-surface">TEMPO</span>
              <span className="absolute left-2 bottom-2 font-label-telemetry text-label-telemetry text-error font-bold">ORIENTATION</span>
              <span className="absolute left-0 top-1/3 font-label-telemetry text-label-telemetry text-on-surface">POSITION</span>
            </div>

            <div className="w-full bg-surface-container rounded-xl p-unit-sm flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-unit-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">Asymmetry Detected</span>
              </div>
              <span className="font-label-code-metric text-label-code-metric text-on-surface-variant uppercase">Delta Variance: 38%</span>
            </div>
          </div>

          {/* PROGRESS CARDS LIST (7 COLS on desktop, appears first on mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col gap-unit-sm">
            {/* Hand Shape (Dominant) */}
            <div className="group relative overflow-hidden bg-surface-container-low hover:bg-surface-container transition-all p-unit-md md:p-unit-lg rounded-2xl shadow-md border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs mb-unit-xs">
                <div className="flex items-center gap-unit-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-body-lg">back_hand</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-unit-xs">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hand Shape</h3>
                      <span className="px-unit-xs py-0.5 rounded-full bg-primary/20 text-on-primary-fixed-variant font-label-code-metric text-label-code-metric uppercase font-semibold">
                        {signDNA.synapseRuns > 0 && signDNA.biggestStrength === 'Hand Shape' ? 'Dominant Strength' : 'Hand Shape'}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Exceptional finger spacing &amp; joint landmark stability
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 self-end sm:self-auto font-label-telemetry text-headline-sm text-primary-container font-bold">
                  <span>{signDNA.handShape}</span><span className="text-label-telemetry font-normal text-on-surface-variant">%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-unit-xs">
                <div className="h-full bg-primary-container rounded-full transition-all duration-700" style={{ width: `${signDNA.handShape}%` }}></div>
              </div>
            </div>

            {/* Hand Position */}
            <div className="group relative overflow-hidden bg-surface-container-low hover:bg-surface-container transition-all p-unit-md md:p-unit-lg rounded-2xl shadow-md border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs mb-unit-xs">
                <div className="flex items-center gap-unit-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-body-lg">filter_center_focus</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hand Position</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Strong spatial anchor relative to torso &amp; cranial baseline
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 self-end sm:self-auto font-label-telemetry text-headline-sm text-primary font-bold">
                  <span>{signDNA.position}</span><span className="text-label-telemetry font-normal text-on-surface-variant">%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-unit-xs">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${signDNA.position}%` }}></div>
              </div>
            </div>

            {/* Trajectory */}
            <div className="group relative overflow-hidden bg-surface-container-low hover:bg-surface-container transition-all p-unit-md md:p-unit-lg rounded-2xl shadow-md border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs mb-unit-xs">
                <div className="flex items-center gap-unit-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-fixed-dim">
                    <span className="material-symbols-outlined text-body-lg">gesture</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Trajectory</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Smooth kinetic curve, minimal motor jitter in lateral arcs
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 self-end sm:self-auto font-label-telemetry text-headline-sm text-primary-fixed-dim font-bold">
                  <span>{signDNA.trajectory}</span><span className="text-label-telemetry font-normal text-on-surface-variant">%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-unit-xs">
                <div className="h-full bg-primary-fixed-dim rounded-full transition-all duration-700" style={{ width: `${signDNA.trajectory}%` }}></div>
              </div>
            </div>

            {/* Timing & Tempo */}
            <div className="group relative overflow-hidden bg-surface-container-low hover:bg-surface-container transition-all p-unit-md md:p-unit-lg rounded-2xl shadow-md border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs mb-unit-xs">
                <div className="flex items-center gap-unit-sm">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary-fixed-dim">
                    <span className="material-symbols-outlined text-body-lg">speed</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Timing &amp; Tempo</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Moderate cadence; rushes multi-finger phonetic transitions
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 self-end sm:self-auto font-label-telemetry text-headline-sm text-tertiary-fixed-dim font-bold">
                  <span>{signDNA.timing}</span><span className="text-label-telemetry font-normal text-on-surface-variant">%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-unit-xs">
                <div className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-700" style={{ width: `${signDNA.timing}%` }}></div>
              </div>
            </div>

            {/* Hand Orientation (Primary Bottleneck) */}
            <div className="group relative overflow-hidden bg-surface-container-low hover:bg-surface-container transition-all p-unit-md md:p-unit-lg rounded-2xl shadow-md border-l-4 border-l-error border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs mb-unit-xs pl-2">
                <div className="flex items-center gap-unit-sm">
                  <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-body-lg">screen_rotation_alt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-unit-xs">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hand Orientation</h3>
                      <span className="px-unit-xs py-0.5 rounded-full bg-error/20 text-error font-label-code-metric text-label-code-metric uppercase font-semibold">
                        {signDNA.synapseRuns > 0 && signDNA.currentFocus === 'Orientation' ? 'Primary Bottleneck' : 'Orientation'}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Recurring wrist over-rotation (+18° beyond coronal plane)
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 self-end sm:self-auto font-label-telemetry text-headline-sm text-error font-extrabold">
                  <span>{signDNA.orientation}</span><span className="text-label-telemetry font-normal text-on-surface-variant">%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-unit-xs ml-2">
                <div className="h-full bg-error rounded-full transition-all duration-700" style={{ width: `${signDNA.orientation}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACTIONABLE INSIGHTS ENGINE (BENTO TRIO) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-unit-lg">
        {/* STRENGTH */}
        <div className="relative bg-surface-container-low rounded-2xl p-unit-lg flex flex-col justify-between shadow-lg overflow-hidden border border-white/5">
          <div className="flex flex-col gap-unit-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-code-metric text-label-code-metric text-primary-container uppercase tracking-wider font-bold">
                Kinematic Apex
              </span>
              <span className="material-symbols-outlined text-primary-container text-headline-sm">
                workspace_premium
              </span>
            </div>
            <div>
              <h4 className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase">
                Your Biggest Strength
              </h4>
              <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                {signDNA.synapseRuns === 0 ? 'No attempts yet' : signDNA.biggestStrength}
              </div>
            </div>
            <p className="font-body-md text-body-sm text-on-surface-variant">
              {signDNA.synapseRuns === 0
                ? 'Averages appear after your first scored attempt. They are not pre-filled.'
                : `Highest average across ${signDNA.synapseRuns} stored attempt${signDNA.synapseRuns === 1 ? '' : 's'}.`}
            </p>
          </div>
          <div className="mt-unit-lg pt-unit-md flex items-center justify-between font-label-code-metric text-label-code-metric border-t border-white/5">
            <span className="text-on-surface-variant">INDEX PRECISION</span>
            <span className="text-primary font-bold">+14% vs peers</span>
          </div>
        </div>

        {/* BOTTLENECK */}
        <div className="relative bg-surface-container-low rounded-2xl p-unit-lg flex flex-col justify-between shadow-lg overflow-hidden border border-white/5">
          <div className="flex flex-col gap-unit-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-code-metric text-label-code-metric text-error uppercase tracking-wider font-bold">
                Kinematic Friction
              </span>
              <span className="material-symbols-outlined text-error text-headline-sm">
                sync_problem
              </span>
            </div>
            <div>
              <h4 className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase">
                Primary Bottleneck
              </h4>
              <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                {signDNA.synapseRuns === 0 ? 'No attempts yet' : signDNA.currentFocus}
              </div>
            </div>
            <p className="font-body-md text-body-sm text-on-surface-variant">
              {signDNA.synapseRuns === 0
                ? 'Weakest metric is computed from real attempt history.'
                : `Lowest average metric across ${signDNA.synapseRuns} attempt${signDNA.synapseRuns === 1 ? '' : 's'}.`}
            </p>
          </div>
          <div className="mt-unit-lg pt-unit-md flex items-center justify-between font-label-code-metric text-label-code-metric border-t border-white/5">
            <span className="text-on-surface-variant">PHONETIC MIS-READS</span>
            <span className="text-error font-bold">3.4x frequency</span>
          </div>
        </div>

        {/* AI PRESCRIPTION */}
        <div className="relative bg-surface-container-high rounded-2xl p-unit-lg flex flex-col justify-between shadow-xl border border-secondary/30">
          <div className="flex flex-col gap-unit-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-code-metric text-label-code-metric text-secondary-fixed uppercase tracking-wider font-bold">
                AI Neuro-Prescription
              </span>
              <span className="material-symbols-outlined text-secondary text-headline-sm">neurology</span>
            </div>
            <div>
              <h4 className="font-label-telemetry text-label-telemetry text-secondary-fixed uppercase font-bold">
                Targeted Rx Routine
              </h4>
              <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                Kinematic Guide Tempo Arc
              </div>
            </div>
            <p className="font-body-md text-body-sm text-on-surface-variant">
              Complete 3 daily tempo micro-sessions strictly targeting 45° palm pitch isolation. Expected resolution within 4 days.
            </p>
          </div>
          <div className="mt-unit-lg flex items-center justify-between pt-unit-md border-t border-white/5">
            <button
              onClick={handleStartRx}
              className="px-unit-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-code-metric text-label-code-metric uppercase font-bold cursor-pointer hover:bg-secondary transition-all"
            >
              Start 3-Min Session
            </button>
            <span className="text-primary-container font-label-code-metric text-label-code-metric uppercase font-bold">
              +300 XP Potential
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4: HISTORICAL PROGRESSION & BIOMETRIC SKELETON PREVIEW */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-unit-lg items-stretch">
        {/* BEAT YOUR PAST SELF GRAPH (8 COLS) */}
        <div className="xl:col-span-8 bg-surface-container-low rounded-2xl p-unit-lg md:p-unit-xl flex flex-col justify-between shadow-lg border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-md mb-unit-lg">
            <div>
              <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-primary-container uppercase font-bold">
                <span className="material-symbols-outlined text-body-sm">trending_up</span>
                <span>Neuroplasticity Trajectory</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                "Beat Your Past Self" Timeline
              </h3>
            </div>
            <div className="flex items-center gap-unit-sm bg-surface-container px-unit-md py-unit-xs rounded-full self-start sm:self-auto border border-white/5">
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant">DELTA:</span>
              <span className="font-label-telemetry text-label-telemetry text-primary-container font-bold">+26% PRECISION</span>
            </div>
          </div>

          {/* SVG Performance Chart from Stitch */}
          <div className="w-full relative h-64 my-unit-xs">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 220">
              <defs>
                <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00f5a0" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00f5a0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="680" y1="20" y2="20" />
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="680" y1="80" y2="80" />
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="680" y1="140" y2="140" />
              <line className="text-surface-container-highest" stroke="currentColor" strokeWidth="1" x1="40" x2="680" y1="200" y2="200" />
              <path d="M 60,150 Q 220,130 360,98 T 640,36 L 640,200 L 60,200 Z" fill="url(#curveGradient)" />
              <path className="stroke-outline-variant" d="M 60,170 Q 220,160 360,140 T 640,120" fill="none" strokeDasharray="6,6" strokeWidth="2" />
              <path className="stroke-primary-container" d="M 60,150 Q 220,130 360,98 T 640,36" fill="none" strokeLinecap="round" strokeWidth="3.5" />
              <circle className="fill-surface stroke-primary" cx="60" cy="150" r="6" strokeWidth="3" />
              <text className="fill-on-surface font-label-telemetry text-[12px]" textAnchor="middle" x="60" y="130">58%</text>
              <circle className="fill-surface stroke-primary" cx="360" cy="98" r="6" strokeWidth="3" />
              <text className="fill-on-surface font-label-telemetry text-[12px]" textAnchor="middle" x="360" y="80">69%</text>
              <circle className="fill-primary-container stroke-surface" cx="640" cy="36" r="7" strokeWidth="3" />
              <text className="fill-primary-container font-label-telemetry text-[13px] font-bold" textAnchor="middle" x="640" y="20">84%</text>
            </svg>
          </div>

          <div className="grid grid-cols-3 pt-unit-md mt-unit-sm text-center font-label-code-metric text-label-code-metric border-t border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-on-surface-variant">WEEK 01</span>
              <span className="text-on-surface font-semibold">Foundation Phase</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-on-surface-variant">WEEK 02</span>
              <span className="text-on-surface font-semibold">Velocity Expansion</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-primary-container font-bold">CURRENT (WK 03)</span>
              <span className="text-on-surface font-semibold">Coronal Fine-Tuning</span>
            </div>
          </div>
        </div>

        {/* VISUAL ANCHOR: AI VISION SKELETON PREVIEW (4 COLS) */}
        <div className="xl:col-span-4 bg-surface-container-low rounded-2xl p-unit-lg flex flex-col justify-between shadow-lg relative overflow-hidden border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-label-code-metric text-label-code-metric text-on-surface-variant uppercase font-bold">
              Biometric Joint Capture
            </span>
            <span className="inline-flex items-center gap-1 font-label-code-metric text-label-code-metric text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              CALIBRATED
            </span>
          </div>

          {/* Exact Vision Skeletal Wireframe Image from Stitch */}
          <div className="relative w-full h-52 my-unit-sm rounded-xl bg-surface-container-lowest overflow-hidden flex items-center justify-center border border-white/5">
            <img
              className="w-full h-full object-cover opacity-60"
              alt="High-tech biometric computer vision capture of hands"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBgooLZOX5NxWculfpPt2iKpSxBok1bA79ZcK8JBCt5tVZRF81sGLYLNoS23xR1QdDTYFgTgdPcFeN1Zyo8uUFbQWcMQJz7_RDPV0pHr3RM5n_zg19F4NI96nhjudTexpTmIPWlMS49vjy9pbJryG2LYnV_dwZV3QrZnHWauI-hpzrEyFBIWOaNq9Zj8W2HRhG0RrCXhAdnujtcUEG--RnnWs0GV7IyCqaxmoQXlrWE_5pLyqJ-QHu"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
            <div className="absolute top-unit-sm left-unit-sm bg-surface-container-lowest/80 backdrop-blur-md px-unit-xs py-0.5 rounded font-label-code-metric text-label-code-metric text-primary-container font-bold border border-white/5">
              {signDNA.currentFocus === 'No data yet' ? 'No attempt data' : `Focus: ${signDNA.currentFocus}`}
            </div>
            <div className="absolute bottom-unit-sm right-unit-sm flex items-center gap-unit-2xs bg-surface-container-lowest/80 backdrop-blur-md px-unit-xs py-0.5 rounded font-label-code-metric text-label-code-metric text-on-surface-variant border border-white/5">
              <span>21 LANDMARKS LOCKED</span>
            </div>
          </div>

          <div className="flex flex-col gap-unit-xs">
            <div className="flex justify-between items-center text-body-sm font-body-sm">
              <span className="text-on-surface font-medium">Model Confidence:</span>
              <span className="text-primary-container font-label-telemetry text-label-telemetry font-bold">
                {signDNA.synapseRuns === 0 ? 'No attempts stored' : `${signDNA.globalPrecision}% avg overall · ${signDNA.synapseRuns} attempts`}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Next capture run will re-evaluate carpometacarpal joint rigidity during release phases.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: SCENARIO MISSIONS & TROPHY CABINET */}
      <section className="flex flex-col gap-unit-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-unit-xs">
          <div>
            <div className="flex items-center gap-unit-xs font-label-code-metric text-label-code-metric text-tertiary-fixed-dim uppercase font-bold">
              <span className="material-symbols-outlined text-body-sm">trophy</span>
              <span>Hall of Mastery</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              Scenario Missions &amp; Milestones
            </h3>
          </div>
          <span className="font-label-telemetry text-label-telemetry text-on-surface-variant font-bold">
            3 UNLOCKED · 2 ACTIVE OBJECTIVES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-unit-md">
          {/* Trophy 1 (First Sign Cleared) */}
          <div className="bg-surface-container-low rounded-2xl p-unit-md flex flex-col justify-between shadow-md border border-white/5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0]">
                <span className="material-symbols-outlined text-headline-sm">workspace_premium</span>
              </div>
              <span className="material-symbols-outlined text-primary-container text-body-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="mt-unit-md flex flex-col gap-1">
              <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">First Sign Cleared</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Completed first sign lesson with ≥70% passing accuracy.
              </p>
            </div>
            <div className="mt-unit-sm pt-unit-xs text-primary-container font-label-code-metric text-label-code-metric uppercase font-bold border-t border-white/5">
              UNLOCKED · +300 XP
            </div>
          </div>

          {/* Trophy 2 (Unlocked) */}
          <div className="bg-surface-container-low rounded-2xl p-unit-md flex flex-col justify-between shadow-md border border-white/5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-headline-sm">local_fire_department</span>
              </div>
              <span className="material-symbols-outlined text-primary-container text-body-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="mt-unit-md flex flex-col gap-1">
              <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Streak Keeper</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Logged movement drills for 7 consecutive days.
              </p>
            </div>
            <div className="mt-unit-sm pt-unit-xs text-tertiary-fixed-dim font-label-code-metric text-label-code-metric uppercase font-bold border-t border-white/5">
              UNLOCKED · +350 XP
            </div>
          </div>

          {/* Trophy 3 (Unlocked) */}
          <div className="bg-surface-container-low rounded-2xl p-unit-md flex flex-col justify-between shadow-md border border-white/5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-headline-sm">auto_stories</span>
              </div>
              <span className="material-symbols-outlined text-primary-container text-body-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="mt-unit-md flex flex-col gap-1">
              <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Sign Explorer</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Mastered 10 functional core signs at 80%+.
              </p>
            </div>
            <div className="mt-unit-sm pt-unit-xs text-secondary font-label-code-metric text-label-code-metric uppercase font-bold border-t border-white/5">
              UNLOCKED · +400 XP
            </div>
          </div>

          {/* Trophy 4 (In Progress) */}
          <div className="bg-surface-container-high rounded-2xl p-unit-md flex flex-col justify-between shadow-md border border-white/10 relative">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-headline-sm">file_download_done</span>
              </div>
              <span className="font-label-code-metric text-label-code-metric text-primary font-bold">1 / 3</span>
            </div>
            <div className="mt-unit-md flex flex-col gap-1">
              <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Precision Master</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Reach 95% precision on 3 distinct signs.
              </p>
            </div>
            <div className="mt-unit-sm flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '33%' }}></div>
              </div>
              <span className="text-on-surface-variant font-label-code-metric text-label-code-metric uppercase font-semibold">
                33% PROGRESS
              </span>
            </div>
          </div>

          {/* Trophy 5 (Restaurant Quest Champion - In Progress) */}
          <div className="bg-surface-container-high rounded-2xl p-unit-md flex flex-col justify-between shadow-md border border-white/10 relative">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-headline-sm">military_tech</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-body-lg">lock</span>
            </div>
            <div className="mt-unit-md flex flex-col gap-1">
              <h5 className="font-headline-sm text-body-lg text-on-surface font-bold">Quest Champion</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Conquer the World 1 Real-time Dialogue Restaurant Quest.
              </p>
            </div>
            <div className="mt-unit-sm flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-amber-400 font-label-code-metric text-label-code-metric uppercase font-bold">
                SCENARIO IN PROGRESS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: HERO CONVERSION / NEXT RECOMMENDED ACTION - FIX HAND ORIENTATION */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-surface-container to-surface-container-low p-unit-lg md:p-unit-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-unit-xl border border-white/5">
        <div className="flex flex-col gap-unit-xs max-w-xl">
          <div className="flex items-center gap-unit-xs text-primary-container font-label-code-metric text-label-code-metric uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00f5a0]"></span>
            Optimal Training Pathway
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            Fix Hand Orientation in 180 Seconds
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your tailored session targets the coronal wrist over-rotation detected in &quot;THANK YOU&quot;. 3 calibration rounds with dynamic video guide.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-unit-md w-full md:w-auto shrink-0">
          <div className="flex flex-col text-center sm:text-right">
            <span className="font-label-telemetry text-headline-sm text-tertiary-fixed-dim leading-tight font-extrabold">+300 XP</span>
            <span className="font-label-code-metric text-label-code-metric text-on-surface-variant uppercase font-semibold">STREAK MULTIPLIER x1.5</span>
          </div>
          <button
            onClick={handleStartRx}
            className="w-full sm:w-auto px-unit-xl py-unit-md rounded-full bg-primary-container text-on-primary-fixed font-headline-sm text-body-md font-bold hover:bg-primary-fixed transition-all flex items-center justify-center gap-unit-sm shadow-[0_0_24px_rgba(0,245,160,0.35)] active:scale-95 cursor-pointer"
            id="launch-drill-btn"
          >
            <span className="material-symbols-outlined text-body-lg">play_arrow</span>
            <span>Launch Tailored Orientation Drill</span>
          </button>
        </div>
      </section>
    </div>
  );
};
