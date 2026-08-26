"use client";

import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";

export type CycleCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: Date;
  onSelect: (date: Date) => void;
  periodDates: Date[];
  predictedPeriodDates: Date[];
  fertileDates: Date[];
  ovulationDates: Date[];
  loggedDates: Date[];
};

// A from-scratch classNames map (no react-day-picker/style.css import) so
// every part of the grid is a Tailwind/token utility instead of the
// library's own generic styling — the only way to get the iOS-Health-app
// look the calendar was asked to match, dots and all.
export function CycleCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  periodDates,
  predictedPeriodDates,
  fertileDates,
  ovulationDates,
  loggedDates,
}: CycleCalendarProps) {
  return (
    <DayPicker
      mode="single"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={(date) => date && onSelect(date)}
      showOutsideDays={false}
      weekStartsOn={0}
      modifiers={{
        period: periodDates,
        predictedPeriod: predictedPeriodDates,
        fertile: fertileDates,
        ovulation: ovulationDates,
        logged: loggedDates,
      }}
      components={{ DayButton: CycleDayButton }}
      classNames={{
        root: "w-full",
        months: "relative w-full",
        month: "w-full space-y-3",
        month_caption: "flex h-9 items-center justify-center px-1",
        caption_label: "text-base font-bold text-ink-900",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between px-1",
        button_previous:
          "tap-target rounded-full text-ink-700 hover:bg-surface-60 disabled:opacity-30",
        button_next: "tap-target rounded-full text-ink-700 hover:bg-surface-60 disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 text-center text-xs font-medium text-ink-500 pb-2",
        weeks: "",
        week: "flex w-full",
        day: "flex-1 py-0.5",
        outside: "invisible",
        disabled: "opacity-30",
        hidden: "invisible",
      }}
    />
  );
}

function CycleDayButton(props: DayButtonProps) {
  const { day, modifiers, className, children, ...buttonProps } = props;
  void children;

  const isPeriod = Boolean(modifiers.period);
  const isPredicted = Boolean(modifiers.predictedPeriod) && !isPeriod;
  const isOvulation = Boolean(modifiers.ovulation);
  const isFertile = Boolean(modifiers.fertile) && !isOvulation;
  const isLogged = Boolean(modifiers.logged);
  const isSelected = Boolean(modifiers.selected);
  const isToday = Boolean(modifiers.today);

  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      className={cn(
        "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-transform active:scale-90",
        isPeriod && "bg-rose-500 text-white font-semibold",
        isOvulation && !isPeriod && "border-2 border-rose-500 text-rose-600 font-semibold",
        isFertile && !isPeriod && "bg-rose-50 text-rose-600",
        isPredicted && !isFertile && "border border-dashed border-rose-400/70 text-rose-600",
        !isPeriod && !isOvulation && !isFertile && !isPredicted && "text-ink-900 hover:bg-surface-60",
        isSelected && "ring-2 ring-primary-600 ring-offset-2 ring-offset-transparent",
        isToday && !isSelected && "outline outline-1 outline-primary-500/50",
        className,
      )}
      {...buttonProps}
    >
      {day.date.getDate()}
      {isLogged && !isPeriod && (
        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-600" />
      )}
    </DayButton>
  );
}

export function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}
