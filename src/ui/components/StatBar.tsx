import { useEffect, useId, useState } from 'react';
import type { DeltaKey } from '../../engine';
import { deltaTone, formatDelta, ratioPercent } from '../format';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  tooltip: string;
  tone: string;
  deltaKey: DeltaKey;
  delta?: number;
  actionSeq: number;
  displayValue?: string;
}

export const StatBar = ({
  label,
  value,
  max,
  tooltip,
  tone,
  deltaKey,
  delta,
  actionSeq,
  displayValue,
}: StatBarProps) => {
  const tipId = useId();
  const [flash, setFlash] = useState<number | null>(null);

  useEffect(() => {
    if (delta === undefined || delta === 0) {
      setFlash(null);
      return;
    }
    setFlash(delta);
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [actionSeq, delta]);

  const shown = displayValue ?? String(value);
  const width = `${ratioPercent(value, max).toFixed(1)}%`;

  return (
    <div className="stat-bar">
      <div className="stat-bar-top">
        <span className="stat-bar-label">{label}</span>
        <span className="stat-bar-value">
          {shown}
          {flash !== null && (
            <span className={`stat-delta ${deltaTone(deltaKey, flash)}`} aria-live="polite">
              {formatDelta(deltaKey, flash)}
            </span>
          )}
        </span>
      </div>
      <div
        className={`stat-track tone-${tone}`}
        tabIndex={0}
        role="meter"
        aria-label={`${label}: ${shown}`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-describedby={tipId}
      >
        <div className="stat-fill" style={{ width }} />
      </div>
      <p id={tipId} className="stat-tooltip" role="tooltip">
        {tooltip}
      </p>
    </div>
  );
};
