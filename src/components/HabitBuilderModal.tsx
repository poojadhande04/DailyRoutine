import React from 'react';
import {
  X,
  Plus,
  Sparkles,
  Sun,
  Snowflake,
  Brain,
  Droplets,
  Activity,
  Wind,
  Moon,
  Zap,
  Check,
  Flame,
} from 'lucide-react';
import { Habit, HabitCategory, RingType } from '../types';
import { sound } from '../utils/audio';

interface HabitBuilderModalProps {
  initialHabit?: Habit | null;
  onClose: () => void;
  onSaveHabit: (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'> & { id?: string }) => void;
}

const PRESET_PROTOCOLS = [
  {
    title: 'Huberman Circadian Stack',
    cue: 'Direct outdoor sunlight exposure within 45m of waking',
    category: 'biohacking' as HabitCategory,
    ringType: 'core' as RingType,
    timeAnchor: '07:00 AM',
    targetValue: 15,
    unit: 'min',
    icon: 'Sun',
    accentColor: '#6366f1',
    protocolDurationSeconds: 900,
    energyImpact: '+35% Dopamine Baseline',
    frequency: 'Daily' as const,
  },
  {
    title: 'Zone 2 Mitochondrial Ride',
    cue: 'Steady aerobic effort with nasal breathing only',
    category: 'vitality' as HabitCategory,
    ringType: 'core' as RingType,
    timeAnchor: '05:00 PM',
    targetValue: 45,
    unit: 'min',
    icon: 'Activity',
    accentColor: '#6366f1',
    protocolDurationSeconds: 2700,
    energyImpact: 'Cardio-Metabolic Efficiency',
    frequency: 'Daily' as const,
  },
  {
    title: '40Hz Gamma Deep Work Sprint',
    cue: '90m block with phone locked in kitchen, full screen focus',
    category: 'focus' as HabitCategory,
    ringType: 'focus' as RingType,
    timeAnchor: '10:00 AM',
    targetValue: 90,
    unit: 'min',
    icon: 'Brain',
    accentColor: '#38bdf8',
    protocolDurationSeconds: 5400,
    energyImpact: 'High-Density Output',
    frequency: 'Weekdays' as const,
  },
  {
    title: 'Wim Hof Retention Breathing',
    cue: '3 rounds of 30 deep breaths followed by exhalation hold',
    category: 'recovery' as HabitCategory,
    ringType: 'focus' as RingType,
    timeAnchor: '06:30 AM',
    targetValue: 12,
    unit: 'min',
    icon: 'Wind',
    accentColor: '#38bdf8',
    protocolDurationSeconds: 720,
    energyImpact: 'Vascular Autonomic Reset',
    frequency: 'Daily' as const,
  },
  {
    title: 'Pineal Digital Sunset',
    cue: 'Equip blue-light blocking lenses and dim room lux below 30',
    category: 'discipline' as HabitCategory,
    ringType: 'bonus' as RingType,
    timeAnchor: '09:30 PM',
    targetValue: 1,
    unit: 'session',
    icon: 'Moon',
    accentColor: '#10b981',
    energyImpact: 'Endogenous Melatonin',
    frequency: 'Daily' as const,
  },
];

const ICONS = ['Sun', 'Snowflake', 'Brain', 'Droplets', 'Activity', 'Wind', 'Moon', 'Zap'];

export const HabitBuilderModal: React.FC<HabitBuilderModalProps> = ({
  initialHabit,
  onClose,
  onSaveHabit,
}) => {
  const [tab, setTab] = React.useState<'custom' | 'presets'>('custom');

  const [title, setTitle] = React.useState(initialHabit?.title || '');
  const [cue, setCue] = React.useState(initialHabit?.cue || '');
  const [category, setCategory] = React.useState<HabitCategory>(initialHabit?.category || 'biohacking');
  const [ringType, setRingType] = React.useState<RingType>(initialHabit?.ringType || 'core');
  const [timeAnchor, setTimeAnchor] = React.useState(initialHabit?.timeAnchor || '08:00 AM');
  const [targetValue, setTargetValue] = React.useState(initialHabit?.targetValue || 1);
  const [unit, setUnit] = React.useState(initialHabit?.unit || 'session');
  const [icon, setIcon] = React.useState(initialHabit?.icon || 'Sun');
  const [protocolDurationMinutes, setProtocolDurationMinutes] = React.useState(
    initialHabit?.protocolDurationSeconds ? Math.round(initialHabit.protocolDurationSeconds / 60) : 15
  );
  const [hasTimer, setHasTimer] = React.useState(!!initialHabit?.protocolDurationSeconds);
  const [energyImpact, setEnergyImpact] = React.useState(initialHabit?.energyImpact || '+20% Vitality');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playSuccessChime();
    onSaveHabit({
      ...(initialHabit?.id ? { id: initialHabit.id } : {}),
      title: title.trim(),
      cue: cue.trim() || 'Execute routine according to protocol anchor.',
      category,
      ringType,
      timeAnchor,
      targetValue: Number(targetValue) || 1,
      currentValue: initialHabit ? initialHabit.currentValue : 0,
      unit,
      icon,
      accentColor: ringType === 'core' ? '#6366f1' : ringType === 'focus' ? '#38bdf8' : '#10b981',
      protocolDurationSeconds: hasTimer ? protocolDurationMinutes * 60 : undefined,
      energyImpact,
      frequency: 'Daily',
    });
    onClose();
  };

  const handleApplyPreset = (preset: typeof PRESET_PROTOCOLS[0]) => {
    sound.playSuccessChime();
    onSaveHabit({
      title: preset.title,
      cue: preset.cue,
      category: preset.category,
      ringType: preset.ringType,
      timeAnchor: preset.timeAnchor,
      targetValue: preset.targetValue,
      currentValue: 0,
      unit: preset.unit,
      icon: preset.icon,
      accentColor: preset.accentColor,
      protocolDurationSeconds: preset.protocolDurationSeconds,
      energyImpact: preset.energyImpact,
      frequency: preset.frequency,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl obsidian-sheet p-6 sm:p-7 border border-white/10 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232936] mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#6366f1]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc]">
                {initialHabit ? 'Calibrate Protocol' : 'Deploy New Protocol'}
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Tactile Habit Tracking & Bio-Orbit Architecture
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full bg-[#151922] hover:bg-[#232936] text-[#94a3b8] hover:text-[#f8fafc] border border-[#232936] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Custom Form vs Preset Library */}
        {!initialHabit && (
          <div className="flex items-center gap-2 p-1 bg-[#0e121a] rounded-xl border border-[#232936] mb-5">
            <button
              onClick={() => {
                sound.playClick();
                setTab('custom');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'custom'
                  ? 'bg-[#1d2330] text-[#f8fafc] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              Custom Protocol
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('presets');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'presets'
                  ? 'bg-[#1d2330] text-[#38bdf8] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Biohacker Library
            </button>
          </div>
        )}

        {tab === 'presets' ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs text-[#94a3b8] mb-2">
              Select a peer-reviewed high-performance protocol to inject into your orbit:
            </p>
            {PRESET_PROTOCOLS.map((preset, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#151922] border border-[#232936] hover:border-[#6366f1]/50 hover:bg-[#191d27] transition-all flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1d2330] text-[#94a3b8]">
                      {preset.category}
                    </span>
                    <span className="text-xs text-[#64748b]">{preset.timeAnchor}</span>
                    <span className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                      {preset.energyImpact}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {preset.cue}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl bg-[#6366f1]/15 hover:bg-[#6366f1] text-[#c0c1ff] hover:text-white font-bold text-xs border border-[#6366f1]/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Deploy
                </button>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Protocol Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cold Thermogenesis, Deep Work Block..."
                className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3.5 py-2.5 text-[#f8fafc] text-sm placeholder-[#475569] outline-none transition-colors"
              />
            </div>

            {/* Cue / Implementation Intention */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Behavioral Cue / Trigger
              </label>
              <input
                type="text"
                value={cue}
                onChange={(e) => setCue(e.target.value)}
                placeholder="e.g. When waking up, I will submerge in cold water for 3 min"
                className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3.5 py-2.5 text-[#f8fafc] text-xs placeholder-[#475569] outline-none transition-colors"
              />
            </div>

            {/* Category & Ring Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HabitCategory)}
                  className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3 py-2 text-[#f8fafc] outline-none"
                >
                  <option value="biohacking">Biohacking</option>
                  <option value="focus">Deep Focus</option>
                  <option value="vitality">Vitality & Nutrition</option>
                  <option value="recovery">Recovery & Rest</option>
                  <option value="discipline">Discipline</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Concentric Orbit Ring
                </label>
                <select
                  value={ringType}
                  onChange={(e) => setRingType(e.target.value as RingType)}
                  className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3 py-2 text-[#f8fafc] outline-none"
                >
                  <option value="core">Primary Core Ring (Indigo)</option>
                  <option value="focus">Focus Routines (Cyan)</option>
                  <option value="bonus">Vitality Bonus (Emerald)</option>
                </select>
              </div>
            </div>

            {/* Target Value, Unit & Time Anchor */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Target Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3 py-2 text-[#f8fafc] outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="min, ml, reps"
                  className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3 py-2 text-[#f8fafc] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Anchor Time
                </label>
                <input
                  type="text"
                  value={timeAnchor}
                  onChange={(e) => setTimeAnchor(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full bg-[#0e121a] border border-[#232936] focus:border-[#38bdf8] rounded-xl px-3 py-2 text-[#f8fafc] outline-none tabular-nums"
                />
              </div>
            </div>

            {/* Timer Integration */}
            <div className="p-3 rounded-xl bg-[#0e121a] border border-[#232936] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f8fafc] text-xs">Enable Live Performance Timer</span>
                <p className="text-[11px] text-[#94a3b8]">Enables guided countdown and 40Hz focus audio</p>
              </div>
              <div className="flex items-center gap-2">
                {hasTimer && (
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={protocolDurationMinutes}
                    onChange={(e) => setProtocolDurationMinutes(Number(e.target.value))}
                    className="w-16 bg-[#151922] border border-[#232936] rounded-lg px-2 py-1 text-[#38bdf8] text-center font-bold"
                    title="Duration in minutes"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setHasTimer(!hasTimer)}
                  className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    hasTimer ? 'bg-[#38bdf8] justify-end' : 'bg-[#232936] justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Protocol Glyphs
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIcon(ic);
                    }}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      icon === ic
                        ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                        : 'bg-[#0e121a] border-[#232936] text-[#94a3b8] hover:text-[#f8fafc]'
                    }`}
                  >
                    {ic === 'Sun' && <Sun className="w-4 h-4" />}
                    {ic === 'Snowflake' && <Snowflake className="w-4 h-4" />}
                    {ic === 'Brain' && <Brain className="w-4 h-4" />}
                    {ic === 'Droplets' && <Droplets className="w-4 h-4" />}
                    {ic === 'Activity' && <Activity className="w-4 h-4" />}
                    {ic === 'Wind' && <Wind className="w-4 h-4" />}
                    {ic === 'Moon' && <Moon className="w-4 h-4" />}
                    {ic === 'Zap' && <Zap className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl primary-gradient-cta font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>{initialHabit ? 'Save Calibration' : 'Deploy Protocol'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
