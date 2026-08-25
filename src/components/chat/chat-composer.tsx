"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel-strong flex items-end gap-2 p-2"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Describe how you're feeling…"
        rows={1}
        className="max-h-24 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-ink-500"
      />
      <button
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
        className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-40"
      >
        <Send size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
