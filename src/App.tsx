import React from 'react';
import {
  Plus,
  Flame,
  CheckCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Compass,
  Layers,
  Award,
  Filter,
} from 'lucide-react';
import { Habit, HabitCategory, UserStats } from './types';
import {
  getFormattedDate,
  loadHabits,
  saveHabits,
  loadUserStats,
  saveUserStats,
} from './utils/storage';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { ConcentricRings } from './components/ConcentricRings';
import { DateTicker } from './components/DateTicker';
import { HabitCard } from './components/HabitCard';
import { PerformanceMatrix } from './components/PerformanceMatrix';
import { ProtocolLab } from './components/ProtocolLab';
import { LiveProtocolModal } from './components/LiveProtocolModal';
import { HabitBuilderModal } from './components/HabitBuilderModal';

export default function App() {
  const todayStr = React.useMemo(() => getFormattedDate(new Date()), []);
  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr);
  const [activeTab, setActiveTab] = React.useState<'today' | 'matrix' | 'protocols'>('today');
  const [habits, setHabits] = React.useState<Habit[]>(() => loadHabits());
  const [userStats, setUserStats] = React.useState<UserStats>(() => loadUserStats());
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [selectedRingFilter, setSelectedRingFilter] = React.useState<string | null>(null);

  // Modals state
  const [activeLiveHabit, setActiveLiveHabit] = React.useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = React.useState<Habit | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [orbitCelebration, setOrbitCelebration] = React.useState(false);

  // Sync state changes to storage
  React.useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  React.useEffect(() => {
    saveUserStats(userStats);
  }, [userStats]);

  // Map of completed habits per date for the DateTicker
  const dayCompletions = React.useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    const total = habits.length;

    habits.forEach((h) => {
      h.completedDates.forEach((d) => {
        if (!map[d]) {
          map[d] = { completed: 0, total };
        }
        map[d].completed += 1;
      });
    });

    return map;
  }, [habits]);

  // Adjust habit values according to whether the selectedDate is in completedDates
  const habitsForSelectedDate = React.useMemo(() => {
    return habits.map((h) => {
      const isDateCompleted = h.completedDates.includes(selectedDate);
      return {
        ...h,
        currentValue: isDateCompleted ? h.targetValue : selectedDate === todayStr ? h.currentValue : 0,
      };
    });
  }, [habits, selectedDate, todayStr]);

  // Filtered habits for the Today view
  const visibleHabits = React.useMemo(() => {
    return habitsForSelectedDate.filter((h) => {
      if (selectedRingFilter && h.ringType !== selectedRingFilter) return false;
      if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
      return true;
    });
  }, [habitsForSelectedDate, selectedRingFilter, categoryFilter]);

  // Toggle completion
  const handleToggleComplete = (id: string) => {
    setHabits((prev) => {
      const next = prev.map((h) => {
        if (h.id !== id) return h;

        const isCurrentlyCompleted = h.completedDates.includes(selectedDate);
        let newDates = [...h.completedDates];
        let newStreak = h.streak;
        let newCurrentValue = h.currentValue;

        if (isCurrentlyCompleted) {
          // Uncomplete
          newDates = newDates.filter((d) => d !== selectedDate);
          if (selectedDate === todayStr) {
            newCurrentValue = 0;
            newStreak = Math.max(0, newStreak - 1);
          }
        } else {
          // Complete
          newDates.push(selectedDate);
          if (selectedDate === todayStr) {
            newCurrentValue = h.targetValue;
            newStreak = newStreak + 1;
          }
        }

        return {
          ...h,
          currentValue: newCurrentValue,
          completedDates: newDates,
          streak: newStreak,
        };
      });

      // Check if all habits are now completed for selectedDate
      const allDone = next.every((item) => item.completedDates.includes(selectedDate));
      if (allDone) {
        sound.playOrbitComplete();
        setOrbitCelebration(true);
        setTimeout(() => setOrbitCelebration(false), 4500);

        // Boost user XP
        setUserStats((stats) => ({
          ...stats,
          xp: stats.xp + 100,
          totalCompletions: stats.totalCompletions + 1,
          disciplineScore: Math.min(100, stats.disciplineScore + 1),
        }));
      } else {
        setUserStats((stats) => ({
          ...stats,
          xp: stats.xp + 25,
          totalCompletions: stats.totalCompletions + 1,
        }));
      }

      return next;
    });
  };

  // Increment or decrement habit numeric values
  const handleUpdateValue = (id: string, delta: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nextVal = Math.max(0, Math.min(h.targetValue * 2, h.currentValue + delta));
        const wasCompleted = h.currentValue >= h.targetValue;
        const isNowCompleted = nextVal >= h.targetValue;

        let newDates = [...h.completedDates];
        let newStreak = h.streak;

        if (!wasCompleted && isNowCompleted) {
          if (!newDates.includes(selectedDate)) newDates.push(selectedDate);
          if (selectedDate === todayStr) newStreak += 1;
        } else if (wasCompleted && !isNowCompleted) {
          newDates = newDates.filter((d) => d !== selectedDate);
          if (selectedDate === todayStr) newStreak = Math.max(0, newStreak - 1);
        }

        return {
          ...h,
          currentValue: nextVal,
          completedDates: newDates,
          streak: newStreak,
        };
      })
    );
  };

  // Add or edit habit
  const handleSaveHabit = (
    data: Omit<Habit, 'id' | 'completedDates' | 'streak'> & { id?: string }
  ) => {
    if (data.id) {
      // Edit
      setHabits((prev) =>
        prev.map((h) =>
          h.id === data.id
            ? {
                ...h,
                ...data,
              }
            : h
        )
      );
    } else {
      // Add
      const newHabit: Habit = {
        ...data,
        id: `habit-${Date.now()}`,
        currentValue: 0,
        streak: 1,
        completedDates: [],
      };
      setHabits((prev) => [newHabit, ...prev]);
    }
    setEditingHabit(null);
  };

  // Delete habit
  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e1e2eb] pb-24 selection:bg-[#6366f1]/30">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsBuilderOpen(true);
        }}
        globalStreak={userStats.currentGlobalStreak}
      />

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* TAB 1: DAILY ORBIT (TODAY) */}
        {activeTab === 'today' && (
          <div className="space-y-5 animate-fade-in">
            {/* Week Ticker Strip */}
            <DateTicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              dayCompletions={dayCompletions}
            />

            {/* Concentric Multi-Habit Rings Visualizer */}
            <div className="rounded-3xl bg-gradient-to-b from-[#151922] via-[#151922]/90 to-[#12151d] border border-[#232936] shadow-xl overflow-hidden relative">
              {/* Subtle top specular stroke */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <ConcentricRings
                habits={habitsForSelectedDate}
                selectedRing={selectedRingFilter}
                onRingClick={(ring) => {
                  sound.playClick();
                  setSelectedRingFilter((curr) => (curr === ring ? null : ring));
                }}
              />
            </div>

            {/* Filter pills & Active Routine count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCategoryFilter('all');
                    setSelectedRingFilter(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'all' && !selectedRingFilter
                      ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
                  }`}
                >
                  All Protocols
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCategoryFilter('biohacking');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'biohacking'
                      ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
                  }`}
                >
                  Biohacking
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCategoryFilter('focus');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'focus'
                      ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
                  }`}
                >
                  Deep Focus
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCategoryFilter('vitality');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'vitality'
                      ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
                  }`}
                >
                  Vitality
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCategoryFilter('recovery');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === 'recovery'
                      ? 'bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm'
                      : 'bg-[#151922] text-[#94a3b8] border border-[#232936] hover:text-[#f8fafc]'
                  }`}
                >
                  Recovery
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#94a3b8] font-mono justify-end">
                <span>Displaying: </span>
                <span className="font-bold text-[#f8fafc]">{visibleHabits.length} protocols</span>
              </div>
            </div>

            {/* Habit Action Cards List */}
            <div className="space-y-3">
              {visibleHabits.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#151922] border border-[#232936] text-center">
                  <p className="text-sm text-[#94a3b8]">No protocols match the selected filter.</p>
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setSelectedRingFilter(null);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#1d2330] text-xs font-bold text-[#38bdf8] border border-[#272a31]"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                visibleHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleComplete={handleToggleComplete}
                    onUpdateValue={handleUpdateValue}
                    onLaunchTimer={(h) => setActiveLiveHabit(h)}
                    onEdit={(h) => {
                      setEditingHabit(h);
                      setIsBuilderOpen(true);
                    }}
                    onDelete={handleDeleteHabit}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERFORMANCE MATRIX */}
        {activeTab === 'matrix' && (
          <PerformanceMatrix habits={habits} userStats={userStats} />
        )}

        {/* TAB 3: PROTOCOL LAB */}
        {activeTab === 'protocols' && (
          <ProtocolLab
            habits={habits}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsBuilderOpen(true);
            }}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsBuilderOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onLaunchTimer={(h) => setActiveLiveHabit(h)}
          />
        )}
      </main>

      {/* Floating Bottom Action Bar for Mobile Thumb Ergonomics */}
      <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto sm:hidden z-30">
        <div className="p-2 rounded-2xl obsidian-sheet flex items-center justify-around border border-white/10 shadow-2xl">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('today');
            }}
            className={`p-2.5 rounded-xl transition-colors ${
              activeTab === 'today' ? 'bg-[#1d2330] text-[#38bdf8]' : 'text-[#94a3b8]'
            }`}
          >
            <Compass className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('matrix');
            }}
            className={`p-2.5 rounded-xl transition-colors ${
              activeTab === 'matrix' ? 'bg-[#1d2330] text-[#10b981]' : 'text-[#94a3b8]'
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setEditingHabit(null);
              setIsBuilderOpen(true);
            }}
            className="p-3 rounded-xl primary-gradient-cta shadow-lg -mt-4 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('protocols');
            }}
            className={`p-2.5 rounded-xl transition-colors ${
              activeTab === 'protocols' ? 'bg-[#1d2330] text-[#f59e0b]' : 'text-[#94a3b8]'
            }`}
          >
            <Award className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Live Protocol Timer Modal */}
      {activeLiveHabit && (
        <LiveProtocolModal
          habit={activeLiveHabit}
          onClose={() => setActiveLiveHabit(null)}
          onCompleteHabit={(habitId) => {
            handleToggleComplete(habitId);
          }}
        />
      )}

      {/* Protocol Builder / Calibrator Modal */}
      {isBuilderOpen && (
        <HabitBuilderModal
          initialHabit={editingHabit}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingHabit(null);
          }}
          onSaveHabit={handleSaveHabit}
        />
      )}

      {/* Full Orbit Dopamine Achievement Toast */}
      {orbitCelebration && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-[#151922] border border-[#10b981] shadow-[0_0_35px_rgba(16,185,129,0.4)] flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-[#f8fafc]">
              100% ORBIT VELOCITY ACHIEVED
            </div>
            <div className="text-xs text-[#94a3b8]">
              All concentric circuits complete. +100 XP logged to Cyber Codex.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
