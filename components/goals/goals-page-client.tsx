"use client";

import { useState } from "react";
import { CalendarDays, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteSavingsGoal } from "@/actions/savings-goal";
import type { GoalIconName } from "@/lib/goal-icons";
import { useRouter } from "next/navigation";
import AddSavingsGoalForm from "./add-savings-goal-form";
import AddFundsForm from "./add-funds-form";
import GoalIcon from "./goal-icon";

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: GoalIconName;
};

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "SAVINGS";
  balance: number;
};

type GoalsPageClientProps = {
  goals: SavingsGoal[];
  accounts: Account[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function GoalsPageClient({
  goals,
  accounts,
}: GoalsPageClientProps) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [fundingGoalId, setFundingGoalId] = useState<string | null>(null);

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

  const handleDelete = async (goal: SavingsGoal) => {
    const confirmed = window.confirm(`Delete the ${goal.name} savings goal?`);

    if (!confirmed) return;

    await deleteSavingsGoal(goal.id);

    setOpenMenu(null);
    router.refresh();
  };

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
          onClick={() => {
            setEditingGoal(null);
            setFundingGoalId(null);
            setShowForm((current) => !current);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-green) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-green-dark)"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {showForm && (
        <AddSavingsGoalForm
          goal={editingGoal}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      )}
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

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--pocket-green-light) text-(--pocket-green)">
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
                className="h-full rounded-full bg-(--pocket-green) transition-all"
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-(--pocket-green)">
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
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-green) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-green-dark)"
          >
            <Plus size={16} />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <>
          {openMenu && (
            <button
              type="button"
              aria-label="Close goal menu"
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => {
              const percent =
                goal.targetAmount > 0
                  ? Math.min(
                      Math.round(
                        (goal.currentAmount / goal.targetAmount) * 100,
                      ),
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

                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--pocket-green-light) text-(--pocket-green)">
                        <GoalIcon name={goal.icon} size={20} />
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(openMenu === goal.id ? null : goal.id)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Goal options"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === goal.id && (
                          <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGoal(goal);
                                setFundingGoalId(null);
                                setShowForm(true);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(goal)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-(--pocket-green)"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Progress{" "}
                      <span className="font-semibold text-slate-700">
                        {percent}%
                      </span>
                    </span>

                    {goal.targetDate && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <CalendarDays size={13} />
                        <span>
                          Target{" "}
                          {new Date(goal.targetDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {fundingGoalId === goal.id ? (
                      <div className="h-1 rounded-full bg-(--pocket-green)" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFundingGoalId(goal.id)}
                        disabled={accounts.length === 0}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-(--pocket-green-light) text-sm font-semibold text-(--pocket-green-dark) transition-colors hover:bg-(--pocket-green) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={15} />
                        Add Funds
                      </button>
                    )}

                    {accounts.length === 0 && (
                      <p className="mt-2 text-center text-xs text-slate-400">
                        Add a checking or savings account first.
                      </p>
                    )}
                  </div>

                  {fundingGoalId === goal.id && (
                    <div className="mt-4">
                      <AddFundsForm
                        goalId={goal.id}
                        goalName={goal.name}
                        accounts={accounts}
                        onClose={() => setFundingGoalId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
