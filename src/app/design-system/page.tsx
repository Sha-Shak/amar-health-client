import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bell, Heart, Plus } from "lucide-react";

const primaryScale = [
  { step: 50, className: "bg-primary-50" },
  { step: 100, className: "bg-primary-100" },
  { step: 200, className: "bg-primary-200" },
  { step: 300, className: "bg-primary-300" },
  { step: 400, className: "bg-primary-400" },
  { step: 500, className: "bg-primary-500" },
  { step: 600, className: "bg-primary-600" },
  { step: 700, className: "bg-primary-700" },
  { step: 800, className: "bg-primary-800" },
  { step: 900, className: "bg-primary-900" },
];

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-14 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design system</h1>
          <p className="text-ink-700">Liquid Glass — tokens &amp; primitives</p>
        </div>
        <ThemeToggle />
      </header>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Color — primary scale</h2>
        <div className="flex flex-wrap gap-2">
          {primaryScale.map(({ step, className }) => (
            <div key={step} className="text-center">
              <div className={`h-14 w-14 rounded-2xl border border-black/5 ${className}`} />
              <span className="text-xs text-ink-500">{step}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-coral-500" />
            <span className="text-xs text-ink-500">coral-500</span>
          </div>
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-500" />
            <span className="text-xs text-ink-500">amber-500</span>
          </div>
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-ink-900" />
            <span className="text-xs text-ink-500">ink-900</span>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold mb-2">Typography</h2>
        <p className="text-2xl font-bold">Page title — 24px bold</p>
        <p className="text-lg font-semibold">Card title — semibold</p>
        <p className="text-base font-medium">Label — medium</p>
        <p className="text-base">Body text — regular, system font stack.</p>
      </section>

      {/* Glass tiers */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Glass tiers</h2>

        <div className="glass-panel p-6">
          <p className="font-semibold">.glass-panel</p>
          <p className="text-ink-700 text-sm">Default — cards, form containers, most surfaces.</p>
        </div>

        <div className="glass-panel-strong p-6">
          <p className="font-semibold">.glass-panel-strong</p>
          <p className="text-ink-700 text-sm">Elevated — nav, modals, the emergency banner.</p>
        </div>

        <div className="relative h-40 overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-primary-700 to-ink-900">
          <span className="absolute left-4 top-4 text-xs text-white/70">
            (photo placeholder — real photography wired in per-page)
          </span>
          <div className="photo-scrim absolute inset-0" />
          <div className="glass-on-photo absolute bottom-4 left-4 right-4 p-4">
            <p className="font-semibold">.glass-on-photo</p>
            <p className="text-sm text-white/80">Over a photo, behind the scrim.</p>
          </div>
        </div>
      </section>

      {/* Buttons & touch targets */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Buttons &amp; icon buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="glass">Secondary</Button>
          <button aria-label="Notifications" className="tap-target glass-panel rounded-full">
            <Bell size={18} aria-hidden="true" />
          </button>
          <button aria-label="Favorite" className="tap-target glass-panel rounded-full">
            <Heart size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Signature element preview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Signature element — floating nav</h2>
        <div className="relative h-24">
          <nav className="glass-panel-strong absolute inset-x-4 bottom-0 flex h-16 items-center justify-around rounded-[var(--radius-pill)] px-4">
            <span className="text-xs text-ink-700">Home</span>
            <span className="text-xs text-ink-700">Vault</span>
            <span className="w-12" />
            <span className="text-xs text-ink-700">Reminders</span>
            <span className="text-xs text-ink-700">Profile</span>
          </nav>
          <button
            aria-label="Ask AI Assistant"
            className="tap-target absolute left-1/2 bottom-6 -translate-x-1/2 h-14 w-14 rounded-full bg-primary-600 text-white shadow-[0_0_0_8px_rgb(13_148_136/0.15),0_12px_24px_-6px_rgb(13_148_136/0.6)]"
          >
            <Plus size={22} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
