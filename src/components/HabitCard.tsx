import React from 'react';
import {
  Flame,
  Check,
  Play,
  Plus,
  Minus,
  Clock,
  Sparkles,
  Sun,
  Snowflake,
  Brain,
  Droplets,
  Activity,
  Wind,
  Moon,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Habit } from '../types';
import { sound } from '../utils/audio';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
  onUpdateValue: (id: string, delta: number) => void;
  onLaunchTimer?: (habit: Habit) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
}

// Map icon string to Lucide component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Sun': return Sun;
    case 'Snowflake': return Snowflake;
    case 'Brain': return Brain;
    case 'Droplets': return Droplets;
    case 'Activity': return Activity;
    case 'Wind': return Wind;
    case 'Moon': return Moon;
    case 'Zap': return Zap;
    default: return Sparkles;
  }
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onUpdateValue,
  onLaunchTimer,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const isCompleted = habit.currentValue >= habit.targetValue;
  const progressRatio = Math.min(1, Math.max(0, habit.currentValue / habit.targetValue));
  const Icon = getIconComponent(habit.icon);

  // 32px circular SVG progress ring geometry
  const ringSize = 34;
  const strokeWidth = 3.5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      sound.playClick();
      onToggleComplete(habit.id);
    } else {
      sound.playSuccessChime();
      onToggleComplete(habit.id);
    }
  };

  const handleIncrement = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    sound.playClick();
    onUpdateValue(habit.id, amount);
  };

  const ringColor = habit.ringType === 'core' 
    ? '#6366f1' 
    : habit.ringType === 'focus' 
    ? '#38bdf8' 
    : '#10b981';

  return (
    <div
      className={`relative group rounded-2xl transition-all duration-300 p-4 select-none ${
        isCompleted
          ? 'bg-[#151922]/90 border border-[#10b981]/30 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
          : 'bg-[#151922] border border-[#232936] hover:border-[#6366f1]/40 hover:bg-[#191d26]'
      }`}
      style={{
        boxShadow: isCompleted 
          ? 'inset 0 1px 0 0 rgba(16, 185, 129, 0.15), 0 4px 20px -2px rgba(0, 0, 0, 0.5)'
          : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-center gap-3.5">
        {/* Leading Habit Category Icon with Glow */}
        <div
          className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${ringColor}18`,
            border: `1px solid ${ringColor}33`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: ringColor }} />
          {/* Subtle indicator dot for active ring category */}
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#151922]"
            style={{ backgroundColor: ringColor }}
          />
        </div>

        {/* Middle Metadata */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Top Eyebrow row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-[#1d2330] text-[#94a3b8] border border-[#272a31]">
              {habit.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#64748b] font-medium">
              <Clock className="w-3 h-3 text-[#94a3b8]" />
              <span className="tabular-nums">{habit.timeAnchor}</span>
            </div>
            {habit.energyImpact && (
              <span className="hidden sm:inline-block text-[10px] font-semibold text-[#38bdf8]/80 bg-[#38bdf8]/10 px-1.5 py-0.5 rounded">
                {habit.energyImpact}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-[15px] font-bold tracking-tight truncate transition-colors ${
              isCompleted ? 'text-[#f8fafc] line-through decoration-[#10b981]/60' : 'text-[#f8fafc]'
            }`}
          >
            {habit.title}
          </h3>

          {/* Cue / Description */}
          <p className="text-xs text-[#94a3b8] truncate mt-0.5">
            {habit.cue}
          </p>

          {/* Numerical progress indicator if non-binary */}
          {habit.targetValue > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-[#0e121a] rounded-full overflow-hidden border border-[#232936]">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${progressRatio * 100}%`,
                    backgroundColor: isCompleted ? '#10b981' : ringColor,
                  }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#c7c4d7] tabular-nums">
                {habit.currentValue}/{habit.targetValue} {habit.unit}
              </span>
              {/* Quick Stepper for count habits */}
              <div className="flex items-center gap-0.5 bg-[#0e121a] rounded-md border border-[#232936] p-0.5">
                <button
                  onClick={(e) => handleIncrement(e, -Math.max(1, Math.round(habit.targetValue / 4)))}
                  className="p-1 hover:bg-[#1d2330] rounded text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                  title="Decrease"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => handleIncrement(e, Math.max(1, Math.round(habit.targetValue / 4)))}
                  className="p-1 hover:bg-[#1d2330] rounded text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                  title="Increase"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trailing Actions: Live Timer trigger, Gamified Streak Chip, and 32px SVG Completion Ring */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Live Protocol Timer Launch Button */}
          {habit.protocolDurationSeconds && !isCompleted && onLaunchTimer && (
            <button
              onClick={() => {
                sound.playClick();
                onLaunchTimer(habit);
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1d2330] hover:bg-[#232936] border border-[#272a31] hover:border-[#38bdf8]/40 text-[#38bdf8] text-xs font-semibold transition-all group/btn"
              title="Launch live protocol timer"
            >
              <Play className="w-3 h-3 fill-current group-hover/btn:scale-110 transition-transform" />
              <span>Live</span>
            </button>
          )}

          {/* Gamified Streak Chip: flame theme */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flame-chip tabular-nums select-none"
            title={`${habit.streak} day active streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b] animate-bounce-subtle" />
            <span>{habit.streak}</span>
          </div>

          {/* Custom 32px Circular SVG Progress Ring / Toggle */}
          <button
            onClick={handleToggle}
            className={`relative flex items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none ${
              isCompleted ? 'achievement-glow' : ''
            }`}
            style={{ width: ringSize, height: ringSize }}
            aria-label={`Mark ${habit.title} ${isCompleted ? 'incomplete' : 'complete'}`}
          >
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              className="transform -rotate-90"
            >
              {/* Background Track */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="#232936"
                strokeWidth={strokeWidth}
                fill="#0e121a"
              />
              {/* Active Progress fill */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={isCompleted ? '#10b981' : ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Checkmark or Completion Icon with spring bounce */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? 'scale-100 opacity-100 text-[#10b981]'
                  : 'scale-0 opacity-0 text-[#94a3b8]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </button>

          {/* More options menu dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[#1d2330] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#1d2330] border border-[#272a31] rounded-xl shadow-xl z-50 py-1 text-xs">
                  {habit.protocolDurationSeconds && onLaunchTimer && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLaunchTimer(habit);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#272a31] text-[#38bdf8]"
                    >
                      <Play className="w-3.5 h-3.5" /> Launch Protocol
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(habit);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#272a31] text-[#e1e2eb]"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Habit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(habit.id);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#272a31] text-[#ff5722]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
