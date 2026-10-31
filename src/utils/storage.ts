import { Habit, UserStats } from '../types';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Dawn Photon Exposure',
    cue: 'Step outside within 30m of waking; view natural light without sunglasses',
    category: 'biohacking',
    ringType: 'core',
    timeAnchor: '06:45 AM',
    targetValue: 15,
    currentValue: 15,
    unit: 'min',
    streak: 24,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Sun',
    accentColor: '#6366f1',
    protocolDurationSeconds: 900,
    energyImpact: '+35% Cortisol Peak',
    notes: 'Triggers circadian clock and optimizes melatonin secretion 14h later.',
  },
  {
    id: 'habit-2',
    title: 'Cold Thermogenesis (2°C)',
    cue: 'Submerge to clavicle; slow nasal breathing',
    category: 'biohacking',
    ringType: 'focus',
    timeAnchor: '07:15 AM',
    targetValue: 3,
    currentValue: 3,
    unit: 'min',
    streak: 18,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Snowflake',
    accentColor: '#38bdf8',
    protocolDurationSeconds: 180,
    energyImpact: '+250% Dopamine Surge',
    notes: 'Brown adipose tissue activation and thermal resilience training.',
  },
  {
    id: 'habit-3',
    title: 'Deep Work Sprint I',
    cue: 'Zero tabs, phone in Faraday cage, 40Hz binaural audio',
    category: 'focus',
    ringType: 'focus',
    timeAnchor: '09:00 AM',
    targetValue: 90,
    currentValue: 90,
    unit: 'min',
    streak: 14,
    completedDates: [],
    frequency: 'Weekdays',
    icon: 'Brain',
    accentColor: '#38bdf8',
    protocolDurationSeconds: 5400,
    energyImpact: 'Ultra-Flow State',
    notes: 'Single objective: high cognitive density architecture output.',
  },
  {
    id: 'habit-4',
    title: 'Electrolyte Bio-Matrix',
    cue: '1,000ml chilled filtered water + sodium & magnesium',
    category: 'vitality',
    ringType: 'bonus',
    timeAnchor: '11:30 AM',
    targetValue: 1000,
    currentValue: 750,
    unit: 'ml',
    streak: 31,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Droplets',
    accentColor: '#10b981',
    energyImpact: 'Plasma Volume & Hydration',
    notes: 'Maintains cellular hydration and eliminates midday brain fog.',
  },
  {
    id: 'habit-5',
    title: 'Zone 2 Metabolic Base',
    cue: 'Nasal-only steady state output (HR 130-142 bpm)',
    category: 'vitality',
    ringType: 'core',
    timeAnchor: '04:30 PM',
    targetValue: 40,
    currentValue: 0,
    unit: 'min',
    streak: 9,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Activity',
    accentColor: '#6366f1',
    protocolDurationSeconds: 2400,
    energyImpact: 'Mitochondrial Density',
    notes: 'Fat oxidation efficiency and lactate clearance threshold.',
  },
  {
    id: 'habit-6',
    title: 'Box Breathing (Vagal Reset)',
    cue: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s',
    category: 'recovery',
    ringType: 'focus',
    timeAnchor: '06:45 PM',
    targetValue: 5,
    currentValue: 5,
    unit: 'min',
    streak: 16,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Wind',
    accentColor: '#38bdf8',
    protocolDurationSeconds: 300,
    energyImpact: 'Parasympathetic Shift',
    notes: 'Lowers heart rate variability tension and halts sympathetic over-drive.',
  },
  {
    id: 'habit-7',
    title: 'Digital Sunset & Blue Blockers',
    cue: 'Put on 550nm red lenses, dim ambient lighting to candle tone',
    category: 'discipline',
    ringType: 'bonus',
    timeAnchor: '09:30 PM',
    targetValue: 1,
    currentValue: 0,
    unit: 'session',
    streak: 22,
    completedDates: [],
    frequency: 'Daily',
    icon: 'Moon',
    accentColor: '#10b981',
    energyImpact: '+40m Deep REM Sleep',
    notes: 'Preserves natural pineal melatonin release for restorative recovery.',
  },
];

// Helper to format date YYYY-MM-DD
export function getFormattedDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic simulated history for the last 120 days
export function seedSampleHistory(): Habit[] {
  const today = new Date();
  const todayStr = getFormattedDate(today);

  return INITIAL_HABITS.map((habit) => {
    const completedDates: string[] = [];
    const probability = habit.streak > 20 ? 0.92 : 0.78;

    for (let i = 1; i <= 90; i++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      const pastStr = getFormattedDate(pastDate);

      // Higher chance of completion within streak window
      if (i <= habit.streak) {
        completedDates.push(pastStr);
      } else if (Math.random() < probability) {
        completedDates.push(pastStr);
      }
    }

    // Today's completion state
    if (habit.currentValue >= habit.targetValue) {
      completedDates.push(todayStr);
    }

    return {
      ...habit,
      completedDates,
    };
  });
}

const STORAGE_KEY = 'kinetic_obsidian_habits_v2';
const STATS_KEY = 'kinetic_obsidian_user_stats_v2';

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedSampleHistory();
      saveHabits(seeded);
      return seeded;
    }
    const habits: Habit[] = JSON.parse(raw);
    return habits;
  } catch {
    return seedSampleHistory();
  }
}

export function saveHabits(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch {
    // Ignore storage errors
  }
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    level: 14,
    xp: 4820,
    xpNextLevel: 5500,
    title: 'Cyber Nomad',
    longestStreak: 31,
    currentGlobalStreak: 18,
    totalCompletions: 486,
    disciplineScore: 94,
  };
}

export function saveUserStats(stats: UserStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}
