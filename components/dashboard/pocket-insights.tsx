import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleAlert,
  Gem,
  Sparkles,
} from "lucide-react";

import type { PocketInsight } from "@/lib/pocket-insights";

type PocketInsightsProps = {
  insights: PocketInsight[];
};

const insightIcons = {
  SPENDING_TREND: ChartNoAxesCombined,
  BUDGET_WARNING: CircleAlert,
  UPCOMING_BILLS: CalendarDays,
  SAVINGS_PROGRESS: Gem,
};

export default function PocketInsights({ insights }: PocketInsightsProps) {
  return (
    <section className="rounded-2xl border border-(--pocket-blue-soft) bg-(--pocket-blue-light) p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <Sparkles size={18} className="relative z-10 text-(--pocket-blue)" />

          <span className="pocket-star pocket-star-one">✦</span>
          <span className="pocket-star pocket-star-two">✦</span>
          <span className="pocket-star pocket-star-three">✦</span>
        </div>
        <h2 className="font-semibold text-slate-900">Pocket noticed...</h2>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-slate-500">
          Pocket is still learning your spending patterns. Keep tracking and
          check back soon.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => {
            const Icon = insightIcons[insight.type];

            return (
              <div
                key={`${insight.type}-${index}`}
                className="flex items-start gap-3 md:border-r md:border-blue-100 md:pr-4 md:last:border-r-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-(--pocket-blue) shadow-sm">
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <p className="pt-1 text-sm leading-relaxed text-slate-700">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
