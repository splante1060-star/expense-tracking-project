import Link from "next/link";

type SpendingItem = {
  category: string;
  amount: number;
};

type MonthlySpendingProps = {
  spending: SpendingItem[];
  totalSpent: number;
  monthLabel: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCategory = (category: string) =>
  category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const categoryColors: Record<string, string> = {
  GROCERIES: "#0e3866", // Pocket blue
  DINING: "#7c6fb0", // muted purple
  SHOPPING: "#5f9f87", // soft green
  ENTERTAINMENT: "#d98568", // muted coral
  TRANSPORTATION: "#5f87b2", // soft blue
  TRAVEL: "#9b7bb5", // dusty lavender
  HOUSING: "#4f8f91", // muted teal
  UTILITIES: "#d6a557", // warm gold
  LOANS: "#9b7a70", // warm taupe
  INSURANCE: "#7189a6", // slate blue
  OTHER: "#94a3b8", // slate
};

export default function MonthlySpending({
  spending,
  totalSpent,
  monthLabel,
}: MonthlySpendingProps) {
  const donutGradient = spending
    .reduce(
      (result, item) => {
        const percent = totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;

        const start = result.position;
        const end = start + percent;

        result.segments.push(
          `${categoryColors[item.category] ?? "#94a3b8"} ${start}% ${end}%`,
        );

        result.position = end;

        return result;
      },
      {
        segments: [] as string[],
        position: 0,
      },
    )
    .segments.join(", ");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {monthLabel} Spending
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {formatCurrency(totalSpent)} spent this month
        </p>
      </div>

      {spending.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center">
          <p className="text-sm text-slate-500">
            No spending recorded for this month yet.
          </p>
        </div>
      ) : (
        <div>
          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-center">
            {/* DONUT */}
            <div className="flex shrink-0 justify-center md:w-1/2">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${donutGradient})`,
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-xs font-medium text-slate-500">
                    Total
                  </span>

                  <span className="mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
              </div>
            </div>

            {/* CATEGORY LEGEND */}
            <div className="min-w-0 flex-1 space-y-3">
              {spending.slice(0, 5).map((item) => {
                const percent =
                  totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0;

                return (
                  <div
                    key={item.category}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            categoryColors[item.category] ?? "#94a3b8",
                        }}
                      />

                      <span className="truncate text-sm text-slate-600">
                        {formatCategory(item.category)}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {Math.round(percent)}%
                      </span>

                      <span className="min-w-16 text-right text-sm font-semibold text-slate-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <Link
              href="/transactions"
              className="text-sm font-medium text-(--pocket-purple) transition-opacity hover:opacity-70"
            >
              View all spending →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
