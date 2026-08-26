"use client";

import { cn } from "@/lib/cn";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";

export type HealthCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: Date;
  onSelect: (date: Date) => void;
  // Days logged, bucketed by the mood color they should render as — a day
  // with a mood entry gets that color; a day logged without a mood entry
  // falls into "neutral". Buckets are pre-split by the caller so this
  // component stays a dumb renderer, same division of labor as CycleCalendar.
  goodDates: Date[];
  okDates: Date[];
  toughDates: Date[];
  neutralLoggedDates: Date[];
};

export function HealthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  goodDates,
  okDates,
  toughDates,
  neutralLoggedDates,
}: HealthCalendarProps) {
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
        good: goodDates,
        ok: okDates,
        tough: toughDates,
        neutralLogged: neutralLoggedDates,
      }}
      components={{ DayButton: HealthDayButton }}
      classNames={{
        root: "w-full",
        months: "relative w-full",
        month: "w-full space-y-3",
        month_caption: "flex h-9 items-center justify-center px-1",
        caption_label: "text-base font-bold text-ink-900",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between px-1",
        button_previous: "tap-target rounded-full text-ink-700 hover:bg-surface-60 disabled:opacity-30",
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

function HealthDayButton(props: DayButtonProps) {
  const { day, modifiers, className, children, ...buttonProps } = props;
  void children;

  const isGood = Boolean(modifiers.good);
  const isOk = Boolean(modifiers.ok);
  const isTough = Boolean(modifiers.tough);
  const isNeutralLogged = Boolean(modifiers.neutralLogged);
  const isLogged = isGood || isOk || isTough || isNeutralLogged;
  const isSelected = Boolean(modifiers.selected);
  const isToday = Boolean(modifiers.today);

  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      className={cn(
        "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-transform active:scale-90",
        isGood && "bg-success-500/20 text-success-600 font-semibold",
        isOk && "bg-amber-500/20 text-amber-700 font-semibold",
        isTough && "bg-coral-500/20 text-coral-600 font-semibold",
        isNeutralLogged && "bg-primary-100 text-primary-700 font-semibold",
        !isLogged && "text-ink-900 hover:bg-surface-60",
        isSelected && "ring-2 ring-primary-600 ring-offset-2 ring-offset-transparent",
        isToday && !isSelected && "outline outline-1 outline-primary-500/50",
        className,
      )}
      {...buttonProps}
    >
      {day.date.getDate()}
    </DayButton>
  );
}
