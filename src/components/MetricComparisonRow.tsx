/**
 * MetricComparisonRow — sub-component for AttemptComparison
 *
 * Renders a single before/after row with animated delta value.
 * All numbers come from actual PracticeAttempt history — never mocked.
 */

import React, { useEffect, useState } from 'react';

interface Props {
  label: string;
  before: number;
  after: number;
  isWeakest?: boolean;
}

export const MetricComparisonRow: React.FC<Props> = ({ label, before, after, isWeakest }) => {
  const delta = after - before;
  const [displayDelta, setDisplayDelta] = useState(0);

  // Animate delta from 0 → actual value on mount
  useEffect(() => {
    let frame: number;
    const startTime = performance.now();
    const duration = 600;
    const targetDelta = delta;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayDelta(Math.round(targetDelta * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [delta]);

  const isImproved = delta > 0;
  const isDeclined = delta < 0;

  const deltaColor = isImproved
    ? 'text-[#00f5a0]'
    : isDeclined
    ? 'text-red-400'
    : 'text-on-surface-variant';

  const deltaPrefix = isImproved ? '▲ +' : isDeclined ? '▼ ' : '— ';
  const deltaDisplay = delta === 0 ? '—' : `${deltaPrefix}${Math.abs(displayDelta)}`;

  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] ${
        isWeakest ? 'bg-amber-950/30 border border-amber-400/20' : 'bg-surface-container-lowest/50'
      }`}
    >
      {/* Label */}
      <span className={`font-medium ${isWeakest ? 'text-amber-400' : 'text-on-surface-variant'}`}>
        {label}
        {isWeakest && (
          <span className="ml-1 text-[9px] font-bold text-amber-400/70 uppercase">focus</span>
        )}
      </span>

      {/* Before */}
      <span className="font-mono text-on-surface-variant w-8 text-right">{before}%</span>

      {/* Arrow */}
      <span className="text-white/30 text-[10px]">→</span>

      {/* After + Delta */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="font-mono font-bold text-on-surface w-8 text-right">{after}%</span>
        <span className={`font-mono font-bold w-12 text-right ${deltaColor}`}>
          {deltaDisplay}
        </span>
      </div>
    </div>
  );
};
