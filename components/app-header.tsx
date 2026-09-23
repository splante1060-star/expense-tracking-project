"use client";

import NotificationBell from "@/components/notification-bell";
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
        <NotificationBell />

        {/* CLERK USER MENU */}
        <UserButton />
      </div>
    </header>
  );
}
