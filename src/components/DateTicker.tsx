import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFormattedDate } from '../utils/storage';
import { sound } from '../utils/audio';

interface DateTickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  dayCompletions: Record<string, { completed: number; total: number }>;
}

export const DateTicker: React.FC<DateTickerProps> = ({
  selectedDate,
  onSelectDate,
  dayCompletions,
}) => {
  const [weekOffset, setWeekOffset] = React.useState(0);

  // Generate 7 days for the current week slice
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    // Anchor to current day with offset
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + (weekOffset * 7) + i);
      const dateStr = getFormattedDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isToday = getFormattedDate(today) === dateStr;
      list.push({ dateStr, dayName, dayNum, isToday, fullDate: d });
    }
    return list;
  }, [weekOffset]);

  const todayStr = getFormattedDate(new Date());

  const handlePrevWeek = () => {
    sound.playClick();
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    sound.playClick();
    setWeekOffset((prev) => prev + 1);
  };

  const handleResetToday = () => {
    sound.playClick();
    setWeekOffset(0);
    onSelectDate(todayStr);
  };

  const currentSelectionFormatted = React.useMemo(() => {
    const parts = selectedDate.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="bg-[#151922] border border-[#232936] rounded-2xl p-3 sm:p-4 mb-5 shadow-sm">
      {/* Top Header: Current selected day display & navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#38bdf8]" />
          <span className="text-sm font-bold text-[#f8fafc] tracking-tight">
            {currentSelectionFormatted}
          </span>
          {selectedDate === todayStr ? (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              Live Today
            </span>
          ) : (
            <button
              onClick={handleResetToday}
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#1d2330] hover:bg-[#272a31] text-[#94a3b8] hover:text-[#f8fafc] border border-[#232936] transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-lg hover:bg-[#1d2330] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            aria-label="Previous days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-lg hover:bg-[#1d2330] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            aria-label="Next days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Strip Scroller */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          const stats = dayCompletions[day.dateStr];
          const hasFullCompletion = stats && stats.total > 0 && stats.completed >= stats.total;
          const hasPartialCompletion = stats && stats.completed > 0 && stats.completed < stats.total;

          return (
            <button
              key={day.dateStr}
              onClick={() => {
                sound.playClick();
                onSelectDate(day.dateStr);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1d2330] to-[#252a38] border border-[#6366f1]/60 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : 'bg-[#0e121a]/70 hover:bg-[#1d2330]/50 border border-[#232936]/60'
              }`}
            >
              {/* Day name (e.g. MON) */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? 'text-[#38bdf8]' : 'text-[#64748b]'
                }`}
              >
                {day.dayName}
              </span>

              {/* Day number (e.g. 14) */}
              <span
                className={`text-base font-extrabold tabular-nums my-0.5 ${
                  isSelected
                    ? 'text-[#f8fafc]'
                    : day.isToday
                    ? 'text-[#38bdf8]'
                    : 'text-[#94a3b8]'
                }`}
              >
                {day.dayNum}
              </span>

              {/* Activity indicator dot */}
              <div className="h-1.5 flex items-center justify-center mt-0.5">
                {hasFullCompletion ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
                ) : hasPartialCompletion ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#232936]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
