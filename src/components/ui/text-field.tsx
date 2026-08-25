import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-[var(--radius-sm)] border border-black/5 bg-surface-70 px-4 py-3 text-ink-900",
          "placeholder:text-ink-500 outline-none transition-shadow",
          "focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30",
          error && "border-coral-500/50 focus:ring-coral-500/30",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-coral-600">
          {error}
        </p>
      )}
    </div>
  );
});
