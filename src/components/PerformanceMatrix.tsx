import React from 'react';
import {
  Flame,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Sparkles,
  Target,
  BarChart2,
} from 'lucide-react';
import { Habit, UserStats } from '../types';
import { getFormattedDate } from '../utils/storage';
import { sound } from '../utils/audio';

interface PerformanceMatrixProps {
  habits: Habit[];
  userStats: UserStats;
}

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({
  habits,
  userStats,
}) => {
  const [selectedCell, setSelectedCell] = React.useState<{
    dateStr: string;
    completed: number;
    total: number;
    percent: number;
  } | null>(null);

  // Generate 52 weeks (364 days) leading up to today
  const heatmapData = React.useMemo(() => {
    const data: Array<{
      dateStr: string;
      dayOfWeek: number; // 0=Sun, 6=Sat
      completed: number;
      total: number;
      intensity: number; // 0-4
    }> = [];

    const today = new Date();
    // 52 weeks * 7 days = 364 days
    const totalDays = 52 * 7;
    const start = new Date(today);
    start.setDate(today.getDate() - totalDays + 1);

    // Pre-calculate date completion map from habits
    const dateMap: Record<string, number> = {};
    habits.forEach((habit) => {
      habit.completedDates.forEach((dateStr) => {
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
      });
    });

    const activeTotalHabits = Math.max(1, habits.length);

    for (let i = 0; i < totalDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = getFormattedDate(current);
      const completedCount = dateMap[dateStr] || 0;
      const ratio = completedCount / activeTotalHabits;

      let intensity = 0;
      if (completedCount > 0) {
        if (ratio >= 0.85) intensity = 4;
        else if (ratio >= 0.6) intensity = 3;
        else if (ratio >= 0.35) intensity = 2;
        else intensity = 1;
      }

      data.push({
        dateStr,
        dayOfWeek: current.getDay(),
        completed: completedCount,
        total: activeTotalHabits,
        intensity,
      });
    }

    return data;
  }, [habits]);

  // Group into columns of 7 days (Sunday to Saturday)
  const weeks = React.useMemo(() => {
    const cols: Array<typeof heatmapData> = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      cols.push(heatmapData.slice(i, i + 7));
    }
    return cols;
  }, [heatmapData]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)] border border-[#34d399]';
      case 3:
        return 'bg-[#059669] border border-[#10b981]/50';
      case 2:
        return 'bg-[#0e7490] border border-[#38bdf8]/40';
      case 1:
        return 'bg-[#1e293b] border border-[#334155]';
      default:
        return 'bg-[#151922] border border-[#232936] hover:border-[#475569]';
    }
  };

  const badges = [
    {
      title: 'Dawn Master',
      subtitle: '24-Day Sunlight Protocol',
      icon: Sparkles,
      color: '#6366f1',
      unlocked: true,
    },
    {
      title: 'Cryo Spartan',
      subtitle: 'Sub-Zero Thermogenesis',
      icon: Zap,
      color: '#38bdf8',
      unlocked: true,
    },
    {
      title: 'Deep Flow Titan',
      subtitle: '90m Pure Focus Sprints',
      icon: Target,
      color: '#38bdf8',
      unlocked: true,
    },
    {
      title: 'Circadian Anchor',
      subtitle: 'Consistent Sleep & Wake Sync',
      icon: ShieldCheck,
      color: '#10b981',
      unlocked: true,
    },
    {
      title: 'Century Club',
      subtitle: '100 Total Protocol Conquers',
      icon: Award,
      color: '#f59e0b',
      unlocked: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gamified Bio-Level Telemetry Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#151922] via-[#1d2330] to-[#151922] border border-[#232936] p-5 sm:p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#6366f1]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Level Icon Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/20 border border-[#6366f1]/50 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(99,102,241,0.25)] flex-shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#c7c4d7]">
                Level
              </span>
              <span className="text-2xl font-black text-[#f8fafc] tabular-nums">
                {userStats.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#f8fafc] tracking-tight">
                  {userStats.title}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  Elite Tier
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Velocity Score: {userStats.disciplineScore}% • Monitored via Kinetic Obsidian
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="sm:w-64">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-[#c7c4d7] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#f59e0b]" /> XP Kinetic Energy
              </span>
              <span className="tabular-nums text-[#38bdf8]">
                {userStats.xp} / {userStats.xpNextLevel}
              </span>
            </div>
            <div className="h-2.5 bg-[#0e121a] rounded-full overflow-hidden border border-[#232936]">
              <div
                className="h-full bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${(userStats.xp / userStats.xpNextLevel) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#64748b] text-right mt-1">
              {userStats.xpNextLevel - userStats.xp} XP to Level {userStats.level + 1}
            </p>
          </div>
        </div>

        {/* 4 Quantitative Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#232936]">
          <div className="p-3 rounded-xl bg-[#0e121a]/60 border border-[#232936]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f59e0b] mb-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>Max Streak</span>
            </div>
            <div className="text-2xl font-black text-[#f8fafc] tabular-nums">
              {userStats.longestStreak} <span className="text-xs font-normal text-[#94a3b8]">days</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e121a]/60 border border-[#232936]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Discipline</span>
            </div>
            <div className="text-2xl font-black text-[#f8fafc] tabular-nums">
              {userStats.disciplineScore}<span className="text-sm font-bold text-[#38bdf8]">%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e121a]/60 border border-[#232936]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6366f1] mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Total Logs</span>
            </div>
            <div className="text-2xl font-black text-[#f8fafc] tabular-nums">
              {userStats.totalCompletions}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e121a]/60 border border-[#232936]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10b981] mb-1">
              <Award className="w-4 h-4" />
              <span>Full Orbits</span>
            </div>
            <div className="text-2xl font-black text-[#f8fafc] tabular-nums">
              42 <span className="text-xs font-normal text-[#94a3b8]">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Habit Heatmap Matrix (52 Weeks x 7 Days) */}
      <div className="rounded-2xl bg-[#151922] border border-[#232936] p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-base font-bold text-[#f8fafc] tracking-tight">
                Kinetic Orbit Matrix (52-Week Continuum)
              </h3>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Photonic density map of protocol completions across 365 days
            </p>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#151922] border border-[#232936]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#1e293b]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#0e7490]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#059669]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
            </div>
            <span>High Intensity</span>
          </div>
        </div>

        {/* Heatmap Scrollable Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-flex flex-col gap-1 min-w-[720px]">
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <button
                      key={day.dateStr}
                      onClick={() => {
                        sound.playClick();
                        setSelectedCell({
                          dateStr: day.dateStr,
                          completed: day.completed,
                          total: day.total,
                          percent: Math.round((day.completed / day.total) * 100),
                        });
                      }}
                      className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${getIntensityColor(
                        day.intensity
                      )}`}
                      title={`${day.dateStr}: ${day.completed}/${day.total} completed`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Cell Detail Box */}
        {selectedCell && (
          <div className="mt-4 p-3 rounded-xl bg-[#1d2330] border border-[#272a31] flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
              <div>
                <span className="text-xs font-bold text-[#f8fafc]">
                  {selectedCell.dateStr}
                </span>
                <span className="text-xs text-[#94a3b8] ml-2">
                  {selectedCell.completed} of {selectedCell.total} habits executed
                </span>
              </div>
            </div>
            <div className="text-sm font-extrabold text-[#10b981] tabular-nums">
              {selectedCell.percent}% Orbit
            </div>
          </div>
        )}
      </div>

      {/* Gamified Milestones & Protocol Badges */}
      <div className="rounded-2xl bg-[#151922] border border-[#232936] p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-[#f59e0b]" />
          <h3 className="text-base font-bold text-[#f8fafc] tracking-tight">
            Biohacking Milestones & Accolades
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0e121a]/80 border border-[#232936] hover:border-[#6366f1]/40 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${b.color}20`,
                    border: `1px solid ${b.color}40`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: b.color }} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#f8fafc] truncate">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-[#94a3b8] truncate">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
