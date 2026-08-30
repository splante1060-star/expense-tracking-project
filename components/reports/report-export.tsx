"use client";

import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";

import type {
  BudgetPerformanceItem,
  SavingsProgressItem,
  SpendingComparisonItem,
  Summary,
  TopSpendingItem,
} from "@/components/reports/reports-page-client";
import ReportPdf from "./report-pdf";

type ReportExportProps = {
  userName: string;
  selectedMonth: string;
  selectedMonthLabel: string;
  summary: Summary;
  spendingComparison: SpendingComparisonItem[];
  budgetPerformance: BudgetPerformanceItem[];
  savingsProgress: SavingsProgressItem[];
  topSpending: TopSpendingItem[];
};

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeCsvValue(value: string | number | null | undefined) {
  const stringValue = String(value ?? "");

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export default function ReportExport({
  userName,
  selectedMonth,
  selectedMonthLabel,
  summary,
  spendingComparison,
  budgetPerformance,
  savingsProgress,
  topSpending,
}: ReportExportProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExportCsv = () => {
    const rows: (string | number | null)[][] = [
      ["Pocket Monthly Report"],
      ["Prepared for", userName],
      ["Report Month", selectedMonthLabel],
      [],

      ["Summary"],
      ["Income", summary.income],
      ["Spending", summary.spending],
      ["Net Cash Flow", summary.netCashFlow],
      ["Average Daily Spend", summary.averageDailySpend],

      [],

      ["Previous Month Summary"],
      ["Income", summary.previousIncome],
      ["Spending", summary.previousSpending],
      ["Net Cash Flow", summary.previousNetCashFlow],
      ["Average Daily Spend", summary.previousAverageDailySpend],

      [],

      ["Spending by Category"],
      ["Category", "Current Month", "Previous Month", "Change %"],
      ...spendingComparison.map((item) => [
        formatCategory(item.category),
        item.current,
        item.previous,
        item.change,
      ]),

      [],

      ["Budget Performance"],
      [
        "Category",
        "Budget",
        "Current Spent",
        "Current %",
        "Previous Spent",
        "Previous %",
        "Change",
      ],
      ...budgetPerformance.map((item) => [
        formatCategory(item.category),
        item.budgetAmount,
        item.currentSpent,
        item.currentPercent,
        item.previousSpent,
        item.previousPercent,
        item.change,
      ]),

      [],

      ["Savings Goals"],
      [
        "Goal",
        "Contributed This Month",
        "Current Amount",
        "Target Amount",
        "Target Date",
      ],
      ...savingsProgress.map((goal) => [
        goal.name,
        goal.contributedThisMonth,
        goal.currentAmount,
        goal.targetAmount,
        goal.targetDate ? formatDate(goal.targetDate) : "",
      ]),

      [],

      ["Top Spending"],
      ["Description", "Category", "Amount", "Date"],
      ...topSpending.map((item) => [
        item.description ?? "Untitled transaction",
        formatCategory(item.category),
        item.amount,
        formatDate(item.date),
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `pocket-report-${selectedMonth}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPdf = async () => {
    const blob = await pdf(
      <ReportPdf
        userName={userName}
        monthLabel={selectedMonthLabel}
        summary={summary}
        spendingComparison={spendingComparison}
        budgetPerformance={budgetPerformance}
        savingsProgress={savingsProgress}
        topSpending={topSpending}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pocket-report-${selectedMonth}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setShowExportMenu((current) => !current)}
        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            showExportMenu ? "rotate-180" : ""
          }`}
        />
      </button>

      {showExportMenu && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--pocket-green-light)">
              <FileSpreadsheet className="h-4 w-4 text-(--pocket-green-dark)" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">CSV</p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Transaction and report data for {selectedMonthLabel}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--pocket-blue-light)">
              <FileText className="h-4 w-4 text-(--pocket-blue)" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">PDF</p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Formatted monthly Pocket report
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
