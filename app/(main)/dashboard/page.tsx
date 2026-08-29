import { currentUser } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getDashboardSummary } from "@/lib/dashboard-data";

import DashboardHeader from "@/components/dashboard/dash-header";
import SummaryCards from "@/components/dashboard/summary-cards";

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

  const firstName = user?.firstName ?? "there";

  const summary = dbUser
    ? await getDashboardSummary({ userId: dbUser.id, selectedMonth })
    : {
        availableToSpend: 0,
        spentThisMonth: 0,
        monthlyBudget: 0,
        upcomingBills: 0,
        currentSavings: 0,
        savingsTarget: 0,
      };

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
      {/* Spending overview */}
      {/* Upcoming bills */}
      {/* Budget status */}
      {/* Savings goals */}
      {/* Recent transactions */}
      {/* Pocket noticed */}
    </div>
  );
}
