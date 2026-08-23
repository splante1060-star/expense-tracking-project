import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  ChartNoAxesCombined,
  Target,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full px-10 pt-0 pb-12 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* -- LEFT COLUMN -- */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 mb-6">
            Your money. Your plan. Your future.
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
            A simpler way to <br />
            <span className="text-blue-600">track</span>,{" "}
            <span className="text-purple-600">plan</span>, and{" "}
            <span className="text-green-600">save</span> for what matters.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Pocket helps you understand your spending, plan for upcoming
            expenses, and build realistic savings goals so you can feel
            confident about your financial future.
          </p>

          {/* FEATURES */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <ChartNoAxesCombined size={28} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                Track Spending
              </h3>

              <p className="mt-1 text-xs leading-snug text-slate-600">
                See where your money goes.
              </p>
            </div>

            <div>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <CalendarDays size={28} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                Plan Ahead
              </h3>

              <p className="mt-1 text-xs leading-snug text-slate-600">
                Stay on top of upcoming bills.
              </p>
            </div>

            <div>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Target size={28} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                Reach Goals
              </h3>

              <p className="mt-1 text-xs leading-snug text-slate-600">
                Save for what matters most.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-purple-600 px-6 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-lg"
            >
              Create Your Account
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/sign-in"
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full border-2 border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50"
            >
              Log in
            </Link>
          </div>

          {/* SECURITY NOTE */}
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <LockKeyhole size={16} />
            <p>Your financial information stays private and protected.</p>
          </div>
        </div>

        {/* -- RIGHT COLUMN -- */}
        <div className="relative mt-10 lg:mt-0">
          <div className="absolute -inset-8 -z-10 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
            <Image
              src="/pocket-dashboard-mock.png"
              alt="Preview of the Pocket personal finance dashboard"
              width={1200}
              height={900}
              className="h-auto w-full rounded-2xl object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
