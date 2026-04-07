import React from 'react';

const STATUS_COLORS = {
  compliant: '#22c55e',
  partial: '#f59e0b',
  'non-compliant': '#ef4444'
};

export default function ScoreCircle({ score, status, size = 120 }) {
  const color = STATUS_COLORS[status] || '#3b82f6';
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="score-num" style={{ color }}>{score}</span>
      <span className="score-label">/ 100</span>
    </div>
  );
}
