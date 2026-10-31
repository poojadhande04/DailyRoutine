import React from 'react';
import { Habit } from '../types';

interface ConcentricRingsProps {
  habits: Habit[];
  onRingClick?: (ringType: 'core' | 'focus' | 'bonus') => void;
  selectedRing?: string | null;
}

export const ConcentricRings: React.FC<ConcentricRingsProps> = ({
  habits,
  onRingClick,
  selectedRing,
}) => {
  // Compute completion by ring type
  const getRingStats = (type: 'core' | 'focus' | 'bonus') => {
    const list = habits.filter((h) => h.ringType === type);
    if (list.length === 0) return { percent: 100, completed: 0, total: 0 };
    const completed = list.filter((h) => h.currentValue >= h.targetValue).length;
    return {
      percent: Math.round((completed / list.length) * 100),
      completed,
      total: list.length,
    };
  };

  const core = getRingStats('core');
  const focus = getRingStats('focus');
  const bonus = getRingStats('bonus');

  const totalHabits = habits.length;
  const totalCompleted = habits.filter((h) => h.currentValue >= h.targetValue).length;
  const overallVelocity = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;

  // Ring dimensions: SVG viewBox 0 0 260 260, center at 130, 130
  // Radii: Outer (Core) = 104, Mid (Focus) = 82, Inner (Bonus) = 60
  // Stroke widths = 14
  const size = 260;
  const center = size / 2;
  const strokeWidth = 13;

  const rings = [
    {
      id: 'core' as const,
      name: 'Core Biometrics',
      radius: 106,
      color: '#6366f1', // Electric Indigo
      bgTrack: '#1e2130',
      stats: core,
    },
    {
      id: 'focus' as const,
      name: 'Focus Routines',
      radius: 86,
      color: '#38bdf8', // Electric Cyan
      bgTrack: '#162836',
      stats: focus,
    },
    {
      id: 'bonus' as const,
      name: 'Vitality Bonus',
      radius: 66,
      color: '#10b981', // Vivid Emerald
      bgTrack: '#122e26',
      stats: bonus,
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Visualizer Frame with Dark Glass Backdrop */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Ambient photonic glow under visualizer */}
        <div 
          className="absolute inset-4 rounded-full blur-2xl opacity-20 transition-all duration-700 pointer-events-none"
          style={{
            background: overallVelocity === 100 
              ? 'radial-gradient(circle, #10b981 0%, #38bdf8 60%, transparent 100%)' 
              : 'radial-gradient(circle, #6366f1 0%, #38bdf8 60%, transparent 100%)'
          }}
        />

        {/* Concentric SVG rings */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90 drop-shadow-xl"
        >
          <defs>
            <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="bonusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            const progressOffset = circumference - (ring.stats.percent / 100) * circumference;
            const isSelected = selectedRing === ring.id;

            return (
              <g
                key={ring.id}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => onRingClick?.(ring.id)}
              >
                {/* Background Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  stroke="#232936"
                  strokeWidth={strokeWidth}
                  fill="none"
                  className="opacity-70 transition-opacity hover:opacity-90"
                />

                {/* Progress Arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  stroke={
                    ring.id === 'core'
                      ? 'url(#coreGradient)'
                      : ring.id === 'focus'
                      ? 'url(#focusGradient)'
                      : 'url(#bonusGradient)'
                  }
                  strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                  filter={ring.stats.percent > 0 ? 'url(#glow)' : undefined}
                />
              </g>
            );
          })}
        </svg>

        {/* Central Kinetic Telemetry readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#94a3b8] mb-0.5">
            Daily Orbit
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#f8fafc] tabular-nums tracking-tight">
              {overallVelocity}
            </span>
            <span className="text-sm font-bold text-[#38bdf8]">%</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1d2330]/80 border border-[#232936] text-[11px] font-semibold text-[#c7c4d7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="tabular-nums">{totalCompleted}/{totalHabits}</span> Protocols
          </div>
        </div>
      </div>

      {/* Ring Legends and interactive quick-toggles */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm mt-3">
        {rings.map((ring) => {
          const isSelected = selectedRing === ring.id;
          return (
            <button
              key={ring.id}
              onClick={() => onRingClick?.(ring.id)}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-[#1d2330] border-[#6366f1]/50 shadow-sm'
                  : 'bg-[#151922]/80 border-[#232936] hover:bg-[#1d2330]/60'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full justify-between">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: ring.color }}
                />
                <span className="text-xs font-bold tabular-nums text-[#f8fafc]">
                  {ring.stats.percent}%
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#94a3b8] mt-1 truncate w-full text-center">
                {ring.id === 'core' ? 'Core' : ring.id === 'focus' ? 'Focus' : 'Bonus'}
              </span>
              <span className="text-[10px] text-[#64748b] tabular-nums">
                {ring.stats.completed}/{ring.stats.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
