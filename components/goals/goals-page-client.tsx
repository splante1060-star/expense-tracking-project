"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddSavingsGoalForm from "./add-savings-goal-form";
import GoalIcon from "./goal-icon";

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: string;
};

type GoalsPageClientProps = {
  goals: SavingsGoal[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function GoalsPageClient({ goals }: GoalsPageClientProps) {
  const [showForm, setShowForm] = useState(false);

  const totalSaved = goals.reduce(
    (total, goal) => total + goal.currentAmount,
    0,
  );

  const totalTarget = goals.reduce(
    (total, goal) => total + goal.targetAmount,
    0,
  );

  const overallPercent =
    totalTarget > 0
      ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Savings Goals
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Save toward the things that matter most.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {showForm && <AddSavingsGoalForm onClose={() => setShowForm(false)} />}

      {/* OVERVIEW */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Savings Progress
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalSaved)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              of {formatCurrency(totalTarget)} saved
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-(--pocket-blue)">
            <GoalIcon name="GEM" size={21} />
          </div>
        </div>

        {totalTarget > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-500">Overall progress</span>

              <span className="font-semibold text-slate-700">
                {overallPercent}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-(--pocket-blue) transition-all"
                style={{
                  width: `${overallPercent}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* GOALS */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-(--pocket-blue)">
            <GoalIcon name="GEM" size={21} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No savings goals yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Create a goal for something you&apos;re saving toward and Pocket
            will help you track your progress.
          </p>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
          >
            <Plus size={16} />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(
                    Math.round((goal.currentAmount / goal.targetAmount) * 100),
                    100,
                  )
                : 0;

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {goal.name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatCurrency(goal.currentAmount)} of{" "}
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-(--pocket-blue)">
                    <GoalIcon name={goal.icon} size={20} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progress</span>

                  <span className="font-semibold text-slate-700">
                    {percent}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-(--pocket-blue)"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
