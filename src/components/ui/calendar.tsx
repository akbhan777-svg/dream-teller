import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  highlightedDates?: Date[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function Calendar({ highlightedDates = [], onDateClick, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isHighlighted = (day: number) => {
    return highlightedDates.some((d) => 
      d.getDate() === day && 
      d.getMonth() === currentMonth.getMonth() && 
      d.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className={cn("p-3 bg-[#1c1c21]/80 backdrop-blur-md rounded-xl border border-white/10 w-full max-w-[320px] mx-auto", className)}>
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-300">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-semibold tracking-wide">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-300">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map(day => (
          <div key={day} className="text-xs font-medium text-slate-500 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="p-2"></div>
        ))}
        {days.map((day) => {
          const highlighted = isHighlighted(day);
          return (
            <button
              key={day}
              onClick={() => onDateClick && onDateClick(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all relative group",
                highlighted 
                  ? "bg-dream-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.6)] font-bold hover:bg-dream-purple-light" 
                  : "text-slate-300 hover:bg-white/10"
              )}
            >
              {day}
              {highlighted && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-dream-pink" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  )
}
