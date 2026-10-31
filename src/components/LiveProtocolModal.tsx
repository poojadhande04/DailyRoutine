import React from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  CheckCircle2,
  Wind,
  Flame,
  Sparkles,
} from 'lucide-react';
import { Habit } from '../types';
import { sound } from '../utils/audio';

interface LiveProtocolModalProps {
  habit: Habit;
  onClose: () => void;
  onCompleteHabit: (habitId: string) => void;
}

export const LiveProtocolModal: React.FC<LiveProtocolModalProps> = ({
  habit,
  onClose,
  onCompleteHabit,
}) => {
  const defaultSeconds = habit.protocolDurationSeconds || 180;
  const [timeLeft, setTimeLeft] = React.useState(defaultSeconds);
  const [isRunning, setIsRunning] = React.useState(false);
  const [audioMode, setAudioMode] = React.useState<'off' | 'binaural' | 'darknoise'>('off');
  const [completedCelebration, setCompletedCelebration] = React.useState(false);

  // Box breathing state (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s)
  const isBreathingProtocol = habit.id === 'habit-6' || habit.category === 'recovery';
  const [breathPhase, setBreathPhase] = React.useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathCounter, setBreathCounter] = React.useState(4);

  // Stop ambient focus audio when closing modal
  React.useEffect(() => {
    return () => {
      sound.stopAmbientFocus();
    };
  }, []);

  // Timer loop
  React.useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          sound.stopAmbientFocus();
          sound.playSuccessChime();
          setCompletedCelebration(true);
          onCompleteHabit(habit.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, habit.id, onCompleteHabit]);

  // Box breathing 4x4 cyclic guide
  React.useEffect(() => {
    if (!isRunning || !isBreathingProtocol) return;

    const breathInterval = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathPhase((curr) => {
            if (curr === 'Inhale') {
              return 'Hold (Full)';
            } else if (curr === 'Hold (Full)') {
              sound.playBreathGuide(false);
              return 'Exhale';
            } else if (curr === 'Exhale') {
              return 'Hold (Empty)';
            } else {
              sound.playBreathGuide(true);
              return 'Inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(breathInterval);
  }, [isRunning, isBreathingProtocol]);

  const toggleRunning = () => {
    sound.playClick();
    if (!isRunning && audioMode !== 'off') {
      sound.startAmbientFocus(audioMode);
    } else if (isRunning) {
      sound.stopAmbientFocus();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(defaultSeconds);
    sound.stopAmbientFocus();
  };

  const handleAudioModeToggle = (mode: 'binaural' | 'darknoise') => {
    sound.playClick();
    if (audioMode === mode) {
      sound.stopAmbientFocus();
      setAudioMode('off');
    } else {
      setAudioMode(mode);
      if (isRunning) {
        sound.startAmbientFocus(mode);
      }
    }
  };

  const handleFinishEarly = () => {
    sound.stopAmbientFocus();
    sound.playSuccessChime();
    setCompletedCelebration(true);
    onCompleteHabit(habit.id);
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = (defaultSeconds - timeLeft) / defaultSeconds;

  // Ring dimension
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="relative w-full max-w-lg rounded-3xl obsidian-sheet p-6 sm:p-8 flex flex-col items-center border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #38bdf8 0%, #6366f1 70%, transparent 100%)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#151922] hover:bg-[#232936] text-[#94a3b8] hover:text-[#f8fafc] border border-[#232936] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Protocol Identity */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#1d2330] text-[#38bdf8] border border-[#38bdf8]/30">
              Kinetic Live Protocol
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full border border-[#f59e0b]/30 tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-[#f59e0b]" />
              {habit.streak} streak
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f8fafc] tracking-tight">
            {habit.title}
          </h2>
          <p className="text-xs text-[#94a3b8] max-w-sm mt-1">
            {habit.cue}
          </p>
        </div>

        {/* Central Display: Either Box Breathing Kinetic Visualizer or Circular Progress Ring */}
        {isBreathingProtocol ? (
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            {/* Pulsing breathing bubble */}
            <div
              className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
                breathPhase === 'Inhale'
                  ? 'w-56 h-56 bg-gradient-to-tr from-[#38bdf8]/20 to-[#6366f1]/25 border-2 border-[#38bdf8]/60 shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                  : breathPhase === 'Hold (Full)'
                  ? 'w-56 h-56 bg-[#38bdf8]/25 border-2 border-[#10b981]/70 shadow-[0_0_40px_rgba(16,185,129,0.35)] scale-105'
                  : breathPhase === 'Exhale'
                  ? 'w-32 h-32 bg-[#6366f1]/20 border-2 border-[#6366f1]/50'
                  : 'w-28 h-28 bg-[#151922] border-2 border-[#232936]'
              }`}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <Wind className="w-6 h-6 text-[#38bdf8] mb-1 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                {breathPhase}
              </span>
              <span className="text-4xl font-extrabold text-[#f8fafc] tabular-nums my-1">
                {breathCounter}s
              </span>
              <span className="text-[11px] text-[#64748b] tabular-nums">
                Total Left: {timeFormatted}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-64 h-64 flex items-center justify-center my-3">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="#1d2330"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress Arc */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="#38bdf8"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.4))',
                }}
              />
            </svg>

            {/* Center Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black text-[#f8fafc] tabular-nums tracking-tight font-mono">
                {timeFormatted}
              </span>
              <span className="text-xs font-semibold text-[#94a3b8] mt-1">
                {isRunning ? 'Protocol Active' : timeLeft === 0 ? 'Protocol Complete' : 'Ready to Engage'}
              </span>
              {habit.energyImpact && (
                <span className="text-[11px] font-bold text-[#10b981] mt-2 bg-[#10b981]/10 px-2.5 py-0.5 rounded-full border border-[#10b981]/20">
                  {habit.energyImpact}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tactile Audio Frequency Toggles */}
        <div className="w-full max-w-sm flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => handleAudioModeToggle('binaural')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              audioMode === 'binaural'
                ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'bg-[#151922] border-[#232936] text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>40Hz Gamma Focus</span>
          </button>

          <button
            onClick={() => handleAudioModeToggle('darknoise')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              audioMode === 'darknoise'
                ? 'bg-[#6366f1]/15 border-[#6366f1] text-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-[#151922] border-[#232936] text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Dark Brown Noise</span>
          </button>
        </div>

        {/* Controls: Play/Pause, Reset, Complete */}
        <div className="flex items-center gap-4 w-full max-w-sm justify-center">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-[#151922] hover:bg-[#1d2330] border border-[#232936] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            title="Reset Protocol"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRunning}
            className="flex-1 py-3.5 px-6 rounded-2xl primary-gradient-cta flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span className="text-sm font-bold tracking-wide">Pause Protocol</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span className="text-sm font-bold tracking-wide">
                  {timeLeft === defaultSeconds ? 'Engage Protocol' : 'Resume'}
                </span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3 rounded-2xl bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] transition-colors"
            title="Complete & Log Now"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Celebration Banner when completed */}
        {completedCelebration && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center mb-4 achievement-glow">
              <Sparkles className="w-8 h-8 text-[#10b981] animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-[#f8fafc] mb-1">
              Protocol Conquered
            </h3>
            <p className="text-sm text-[#94a3b8] text-center mb-6">
              Neural circuitry calibrated. Streak elevated to {habit.streak + 1} days.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-6 py-3 rounded-2xl primary-gradient-cta font-bold text-sm"
            >
              Return to Orbit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
