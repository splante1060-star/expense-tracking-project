"use client";

import { Bell } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function AppHeader() {
  const { user } = useUser();

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const firstName = user?.firstName ?? "there";

  return (
    <header className="flex h-16 items-center justify-end px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <p className="hidden text-sm text-slate-600 sm:block">
          {greeting}, {firstName} ☀️
        </p>

        {/* NOTIFICATIONS */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-(--pocket-purple)" />
        </button>

        {/* CLERK USER MENU */}
        <UserButton />
      </div>
    </header>
  );
}
