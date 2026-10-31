import React from 'react';
import {
  Flame,
  Plus,
  Volume2,
  VolumeX,
  Layers,
  Compass,
  Activity,
  Award,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: 'today' | 'matrix' | 'protocols';
  onSelectTab: (tab: 'today' | 'matrix' | 'protocols') => void;
  onOpenNewHabit: () => void;
  globalStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewHabit,
  globalStreak,
}) => {
  const [audioEnabled, setAudioEnabled] = React.useState(sound.isEnabled());

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    sound.setEnabled(next);
    setAudioEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/90 backdrop-blur-xl border-b border-[#232936] px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#38bdf8] p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.35)]">
            <div className="w-full h-full bg-[#0b0e14] rounded-[11px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#38bdf8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-[#f8fafc]">
                KINETIC <span className="text-[#38bdf8]">OBSIDIAN</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                Active Orbit
              </span>
            </div>
            <p className="text-[10px] text-[#94a3b8] font-mono tracking-tight hidden sm:block">
              TACTILE DARK GLASSMORPHISM • 24MS LATENCY
            </p>
          </div>
        </div>

        {/* Center Nav tabs */}
        <nav className="flex items-center gap-1 bg-[#151922] p-1 rounded-2xl border border-[#232936]">
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('today');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-[#1d2330] text-[#f8fafc] border border-[#6366f1]/40 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Daily Orbit</span>
            <span className="sm:hidden">Today</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('matrix');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#1d2330] text-[#f8fafc] border border-[#6366f1]/40 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="hidden sm:inline">Performance Matrix</span>
            <span className="sm:hidden">Matrix</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('protocols');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'protocols'
                ? 'bg-[#1d2330] text-[#f8fafc] border border-[#6366f1]/40 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden sm:inline">Protocol Lab</span>
            <span className="sm:hidden">Lab</span>
          </button>
        </nav>

        {/* Trailing actions: Global streak, Audio toggle, Add Habit CTA */}
        <div className="flex items-center gap-2">
          {/* Flame streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full flame-chip text-xs font-black tabular-nums shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
            <span>{globalStreak}d</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-xl bg-[#151922] hover:bg-[#1d2330] text-[#94a3b8] hover:text-[#f8fafc] border border-[#232936] transition-colors"
            title={audioEnabled ? 'Mute Kinetic Audio' : 'Enable Kinetic Audio'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-[#38bdf8]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#64748b]" />
            )}
          </button>

          {/* Deploy Protocol CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNewHabit();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl primary-gradient-cta text-xs font-bold transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Protocol</span>
          </button>
        </div>
      </div>
    </header>
  );
};
