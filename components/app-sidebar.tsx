"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ArrowRightLeft,
  ReceiptText,
  PiggyBank,
  Gem,
  ChartNoAxesCombined,
  WalletCards,
  Settings,
  LockKeyhole,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: House,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowRightLeft,
  },
  {
    label: "Bills",
    href: "/bills",
    icon: ReceiptText,
  },
  {
    label: "Budget",
    href: "/budgets",
    icon: PiggyBank,
  },
  {
    label: "Goals",
    href: "/goals",
    icon: Gem,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: WalletCards,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-58 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-3">
      {" "}
      {/* LOGO */}
      <Link href="/dashboard" className="mb-5 flex justify-center">
        <Image
          src="/pocket-logo.png"
          alt="Pocket Logo"
          width={150}
          height={60}
          className="h-auto w-32 object-contain"
          priority
        />
      </Link>
      {/* NAVIGATION */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-(--pocket-blue-light) text-(--pocket-blue)"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-(--pocket-blue)" />
              )}

              <Icon size={19} strokeWidth={1.8} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* BOTTOM CARD */}
      <div className="mt-auto rounded-2xl bg-(--pocket-blue-light) p-3">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-(--pocket-blue) shadow-sm">
          <LockKeyhole size={18} />
        </div>

        <h3 className="text-xs font-semibold text-slate-900">
          Secure & Private
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Your data is encrypted and never shared.
        </p>

        <Link
          href="/settings"
          className="mt-2 inline-flex text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
        >
          Learn more →
        </Link>
      </div>
      <p className="mt-3 px-1 text-[11px] text-slate-400">
        Made by Sophie Plante ♡
      </p>
    </aside>
  );
}
