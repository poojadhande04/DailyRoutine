export type HabitCategory = 'biohacking' | 'focus' | 'vitality' | 'recovery' | 'discipline';

export type RingType = 'core' | 'focus' | 'bonus';

export interface Habit {
  id: string;
  title: string;
  cue: string;
  category: HabitCategory;
  ringType: RingType;
  timeAnchor: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
  frequency: 'Daily' | 'Weekdays' | 'Weekends' | '3x / week';
  icon: string;
  accentColor: string; // hex
  protocolDurationSeconds?: number; // for timer
  energyImpact: string;
  notes?: string;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
  total: number;
  intensity: number; // 0 to 4 for heatmap
}

export interface UserStats {
  level: number;
  xp: number;
  xpNextLevel: number;
  title: string;
  longestStreak: number;
  currentGlobalStreak: number;
  totalCompletions: number;
  disciplineScore: number;
}
