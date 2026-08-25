"use client";

import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { InstallAppButton, useInstallPrompt } from "@/components/pwa/install-app-button";
import { SettingsRow } from "@/components/settings/settings-row";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Bell,
  Download,
  LogOut,
  Moon,
  ShieldAlert,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { available: installAvailable } = useInstallPrompt();
  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="glass-panel flex items-center gap-4 p-6">
        <div className="tap-target h-16 w-16 shrink-0 overflow-hidden rounded-full">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <AvatarPlaceholder />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.name ?? user.email ?? user.phone}</p>
          {/* Per Backend Spec §5.2 — the patientCode is what a patient reads off to
              share with a doctor, so it stays visible here, not tucked in edit. */}
          <p className="text-sm text-ink-500">Patient code: {user.patientCode}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Account</p>
        <div className="glass-panel divide-y divide-black/5">
          <SettingsRow href="/profile/edit" icon={UserIcon} label="Edit profile" />
          <SettingsRow href="/profile/notifications" icon={Bell} label="Notifications" />
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Appearance</p>
        <div className="glass-panel flex items-center gap-3 px-4 py-3.5">
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <Moon size={18} aria-hidden="true" />
          </span>
          <span className="flex-1 font-medium text-ink-900">Dark mode</span>
          <Switch checked={theme === "dark"} onChange={toggleTheme} label="Dark mode" />
        </div>
      </div>

      {installAvailable && (
        <div>
          <p className="mb-2 px-1 text-sm font-medium text-ink-500">App</p>
          <InstallAppButton />
        </div>
      )}

      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Safety</p>
        <div className="glass-panel divide-y divide-black/5">
          <SettingsRow
            href="/profile/emergency-pass"
            icon={ShieldAlert}
            label="Emergency Health Pass"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-500">Data & privacy</p>
        <div className="glass-panel divide-y divide-black/5">
          <SettingsRow href="/profile/export-data" icon={Download} label="Export my data" />
          <SettingsRow
            href="/profile/delete-account"
            icon={Trash2}
            label="Delete account"
            destructive
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
          router.replace("/signup");
        }}
        className="tap-target glass-panel flex w-full items-center justify-center gap-2 py-3.5 font-medium text-ink-700"
      >
        <LogOut size={18} aria-hidden="true" />
        Log out
      </button>
    </div>
  );
}
