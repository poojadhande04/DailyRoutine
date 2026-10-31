import React from 'react';
import {
  Plus,
  Play,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  Target,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { Habit } from '../types';
import { sound } from '../utils/audio';

interface ProtocolLabProps {
  habits: Habit[];
  onOpenNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onLaunchTimer: (habit: Habit) => void;
}

export const ProtocolLab: React.FC<ProtocolLabProps> = ({
  habits,
  onOpenNewHabit,
  onEditHabit,
  onDeleteHabit,
  onLaunchTimer,
}) => {
  const [filterCategory, setFilterCategory] = React.useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Protocols' },
    { id: 'biohacking', label: 'Biohacking' },
    { id: 'focus', label: 'Deep Focus' },
    { id: 'vitality', label: 'Vitality' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'discipline', label: 'Discipline' },
  ];

  const filtered = habits.filter(
    (h) => filterCategory === 'all' || h.category === filterCategory
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151922] via-[#1d2330] to-[#151922] border border-[#232936] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]">
              Tactile Routine Laboratory
            </span>
          </div>
          <h2 className="text-xl font-black text-[#f8fafc]">
            Active Neuro-Protocols & Habit Stack
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-lg">
            Fine-tune behavioral triggers, cues, target thresholds, and sync frequencies to sustain unbroken momentum.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onOpenNewHabit();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl primary-gradient-cta text-xs font-bold transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Protocol</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              sound.playClick();
              setFilterCategory(c.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === c.id
                ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((habit) => {
          const ringColor =
            habit.ringType === 'core'
              ? '#6366f1'
              : habit.ringType === 'focus'
              ? '#38bdf8'
              : '#10b981';

          return (
            <div
              key={habit.id}
              className="p-5 rounded-2xl bg-[#151922] border border-[#232936] hover:border-[#6366f1]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ringColor }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1d2330] text-[#94a3b8] border border-[#272a31]">
                      {habit.category}
                    </span>
                    <span className="text-[11px] text-[#64748b] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#94a3b8]" />
                      {habit.timeAnchor}
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 tabular-nums">
                    {habit.streak}d streak
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">
                  {habit.title}
                </h3>

                {/* Cue */}
                <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                  <span className="text-[#64748b] font-semibold">Cue: </span>
                  {habit.cue}
                </p>

                {/* Notes or Energy Impact */}
                {habit.energyImpact && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#10b981]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{habit.energyImpact}</span>
                  </div>
                )}
              </div>

              {/* Trailing actions */}
              <div className="pt-4 mt-4 border-t border-[#232936] flex items-center justify-between">
                <div className="text-xs text-[#94a3b8] font-mono">
                  Target: <span className="text-[#f8fafc] font-bold">{habit.targetValue} {habit.unit}</span>
                </div>

                <div className="flex items-center gap-2">
                  {habit.protocolDurationSeconds && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onLaunchTimer(habit);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8] text-[#38bdf8] hover:text-black font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> Live Timer
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playClick();
                      onEditHabit(habit);
                    }}
                    className="p-1.5 rounded-lg bg-[#1d2330] hover:bg-[#272a31] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                    title="Calibrate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onDeleteHabit(habit.id);
                    }}
                    className="p-1.5 rounded-lg bg-[#1d2330] hover:bg-[#ff5722]/20 text-[#64748b] hover:text-[#ff5722] transition-colors"
                    title="Archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
