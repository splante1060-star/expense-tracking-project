import { currentUser } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getDashboardSummary, getDashboardDetails } from "@/lib/dashboard-data";

import DashboardHeader from "@/components/dashboard/dash-header";
import SummaryCards from "@/components/dashboard/summary-cards";
import MonthlySpending from "@/components/dashboard/monthly-spending";
import UpcomingBills from "@/components/dashboard/upcoming-bills";

type DashboardPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await currentUser();
  const dbUser = await checkUser();

  const { month } = await searchParams;

  const now = new Date();

  const selectedMonth =
    month && /^\d{4}-\d{2}$/.test(month)
      ? new Date(`${month}-01T12:00:00`)
      : new Date(now.getFullYear(), now.getMonth(), 1);

  const monthLabel = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
  });

  const firstName = user?.firstName ?? "there";

  const [summary, details] = dbUser
    ? await Promise.all([
        getDashboardSummary({
          userId: dbUser.id,
          selectedMonth,
        }),
        getDashboardDetails({
          userId: dbUser.id,
          selectedMonth,
        }),
      ])
    : [
        {
          availableToSpend: 0,
          spentThisMonth: 0,
          monthlyBudget: 0,
          upcomingBills: 0,
          currentSavings: 0,
          savingsTarget: 0,
        },
        {
          monthlySpending: [],
          totalSpent: 0,
          upcomingBills: [],
          totalBills: 0,
        },
      ];

  return (
    <div className="space-y-6">
      <DashboardHeader firstName={firstName} selectedMonth={selectedMonth} />

      <SummaryCards
        availableToSpend={summary.availableToSpend}
        spentThisMonth={summary.spentThisMonth}
        monthlyBudget={summary.monthlyBudget}
        upcomingBills={summary.upcomingBills}
        currentSavings={summary.currentSavings}
        savingsTarget={summary.savingsTarget}
      />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <MonthlySpending
          spending={details.monthlySpending}
          totalSpent={details.totalSpent}
          monthLabel={monthLabel}
        />

        <UpcomingBills
          bills={details.upcomingBills}
          totalBills={details.totalBills}
        />
      </div>
      {/* Budget status */}
      {/* Savings goals */}
      {/* Recent transactions */}
      {/* Pocket noticed */}
    </div>
  );
}
