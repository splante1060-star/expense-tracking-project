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

function HighlightedMessage({
  message,
  highlights = [],
}: {
  message: string;
  highlights?: string[];
}) {
  if (highlights.length === 0) {
    return <>{message}</>;
  }

  const escapedHighlights = highlights.map((highlight) =>
    highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  const regex = new RegExp(`(${escapedHighlights.join("|")})`, "g");

  return (
    <>
      {message.split(regex).map((part, index) =>
        highlights.includes(part) ? (
          <strong key={index} className="font-semibold text-slate-900">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

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
        <div
          className={`grid gap-4 ${
            insights.length === 1
              ? "grid-cols-1"
              : insights.length === 2
                ? "md:grid-cols-2"
                : insights.length === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2"
          }`}
        >
          {insights.map((insight, index) => {
            const Icon = insightIcons[insight.type];

            return (
              <div
                key={`${insight.type}-${index}`}
                className={`flex min-w-0 items-start gap-3 ${
                  insights.length === 2 && index === 0
                    ? "md:border-r md:border-blue-100 md:pr-4"
                    : insights.length === 3 && index < 2
                      ? "md:border-r md:border-blue-100 md:pr-4"
                      : insights.length === 4 && index % 2 === 0
                        ? "md:border-r md:border-blue-100 md:pr-4"
                        : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-(--pocket-blue) shadow-sm">
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <p className="pt-1 text-sm leading-relaxed text-slate-700">
                  <HighlightedMessage
                    message={insight.message}
                    highlights={insight.highlights}
                  />
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
