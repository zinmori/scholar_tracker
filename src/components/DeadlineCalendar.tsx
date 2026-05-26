"use client";

import { useState } from "react";
import { Application } from "@/types";
import { ChevronLeft, ChevronRight, GraduationCap, DollarSign, Calendar } from "lucide-react";

interface DeadlineCalendarProps {
  applications: Application[];
  onViewDetails: (app: Application) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const statusDotColors: Record<string, string> = {
  "En cours": "bg-slate-400 border-slate-500",
  Soumise: "bg-blue-500 border-blue-600",
  "En révision": "bg-amber-500 border-amber-600",
  Acceptée: "bg-emerald-500 border-emerald-600",
  Refusée: "bg-rose-500 border-rose-600",
  "En attente": "bg-zinc-400 border-zinc-500",
};

export default function DeadlineCalendar({ applications, onViewDetails }: DeadlineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust to start on Monday (Monday = 0, Sunday = 6)
  const startDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Get total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get total days in previous month
  const prevTotalDays = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from(
    { length: startDayOffset },
    (_, i) => prevTotalDays - startDayOffset + i + 1
  );

  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Total grid slots (usually 35 or 42)
  const remainingSlots = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getApplicationsForDay = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    
    return applications.filter((app) => {
      const appDate = new Date(app.deadline);
      return (
        appDate.getUTCFullYear() === year &&
        appDate.getUTCMonth() === month &&
        appDate.getUTCDate() === dayNum
      );
    });
  };

  const isToday = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Calendar Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-650" />
          <h3 className="text-sm font-bold text-slate-800">
            {MONTHS[month]} {year}
          </h3>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-55 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-55 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-l border-t border-slate-100">
        {/* Previous Month Days */}
        {prevMonthDays.map((day, idx) => (
          <div key={`prev-${idx}`} className="p-2 min-h-[90px] bg-slate-50/40 text-slate-400 text-[11px] font-medium select-none">
            {day}
          </div>
        ))}

        {/* Current Month Days */}
        {currentMonthDays.map((day) => {
          const dayApps = getApplicationsForDay(day, true);
          const currentIsToday = isToday(day, true);

          return (
            <div
              key={`curr-${day}`}
              className={`p-2 min-h-[90px] bg-white text-[11px] flex flex-col justify-between transition-colors relative hover:bg-slate-50/30 ${
                currentIsToday ? "bg-indigo-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px] ${
                    currentIsToday
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-800"
                  }`}
                >
                  {day}
                </span>
              </div>

              {/* Deadlines List */}
              <div className="mt-2 space-y-1 overflow-y-auto max-h-[60px] scrollbar-none">
                {dayApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onViewDetails(app)}
                    className="w-full text-left p-1 text-[9px] font-bold rounded-md border border-slate-150 hover:border-slate-300 bg-slate-50 hover:bg-white truncate flex items-center gap-1 transition-all group"
                    title={`${app.name} (${app.type})`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[app.status] || "bg-slate-400"}`}></span>
                    <span className="truncate flex-1 group-hover:text-indigo-650">{app.name}</span>
                    <span className="flex-shrink-0 opacity-60">
                      {app.type === "Université" ? (
                        <GraduationCap className="w-2.5 h-2.5" />
                      ) : (
                        <DollarSign className="w-2.5 h-2.5" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Next Month Days */}
        {nextMonthDays.map((day, idx) => (
          <div key={`next-${idx}`} className="p-2 min-h-[90px] bg-slate-50/40 text-slate-400 text-[11px] font-medium select-none">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
