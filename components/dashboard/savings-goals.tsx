import Link from "next/link";
import GoalIcon from "@/components/goals/goal-icon";

type SavingsGoalItem = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: string;
};

type SavingsGoalsProps = {
  goals: SavingsGoalItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatTargetDate = (date: Date | null) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function SavingsGoals({ goals }: SavingsGoalsProps) {
  const visibleGoals = goals.slice(0, 2);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Savings Goals
        </h2>

        <Link
          href="/goals"
          className="text-xs font-semibold text-(--pocket-blue-medium) transition-colors hover:text-(--pocket-blue)"
        >
          View all →
        </Link>
      </div>

      {/* EMPTY STATE */}
      {visibleGoals.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            No savings goals yet
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Create a goal to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {visibleGoals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(
                    Math.round((goal.currentAmount / goal.targetAmount) * 100),
                    100,
                  )
                : 0;

            const targetDate = formatTargetDate(goal.targetDate);

            return (
              <div key={goal.id} className="flex gap-3 py-4 first:pt-1">
                {/* ICON */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--pocket-blue-light) text-(--pocket-blue)">
                  <GoalIcon name={goal.icon} size={22} />
                </div>

                {/* GOAL DETAILS */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {goal.name}
                    </p>

                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {percent}%
                    </span>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-(--pocket-blue) transition-all"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>
                      {formatCurrency(goal.currentAmount)} of{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>

                    {targetDate && <span>Target: {targetDate}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW GOAL */}
      <Link
        href="/goals"
        className="mt-2 flex h-10 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-sm font-semibold text-(--pocket-blue) transition-colors hover:bg-(--pocket-blue-soft)"
      >
        + New Goal
      </Link>
    </div>
  );
}
