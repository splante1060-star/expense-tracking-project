import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type {
  BudgetPerformanceItem,
  SavingsProgressItem,
  SpendingComparisonItem,
  Summary,
  TopSpendingItem,
} from "@/components/reports/reports-page-client";

import logoUrl from "@/public/pocket-logo.png";
import { categoryColors } from "@/lib/category-colors";

type ReportPdfProps = {
  userName: string;
  monthLabel: string;
  summary: Summary;
  spendingComparison: SpendingComparisonItem[];
  budgetPerformance: BudgetPerformanceItem[];
  savingsProgress: SavingsProgressItem[];
  topSpending: TopSpendingItem[];
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#334155",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 92,
    objectFit: "contain",
  },

  headerDivider: {
    width: 1,
    height: 38,
    marginHorizontal: 16,
    backgroundColor: "#dbe5ee",
  },

  headerContent: {
    justifyContent: "center",
  },

  eyebrow: {
    marginBottom: 4,
    fontSize: 8,
    fontWeight: 700,
    color: "#536f98",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0a1f36",
  },

  monthBadge: {
    borderRadius: 12,
    backgroundColor: "#eef5fa",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  monthText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0e3866",
  },

  preparedFor: {
    marginTop: 8,
    fontSize: 8,
    color: "#64748b",
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 10,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },

  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
  },

  summaryLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 5,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },

  table: {
    width: "100%",
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  columnWide: {
    width: "40%",
    paddingHorizontal: 5,
  },

  column: {
    width: "20%",
    paddingHorizontal: 5,
    textAlign: "right",
  },

  tableHeaderText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
  },

  bodyText: {
    fontSize: 9,
    color: "#334155",
  },

  footer: {
    marginTop: 6,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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

export default function ReportPdf({
  userName,
  monthLabel,
  summary,
  spendingComparison,
  budgetPerformance,
  savingsProgress,
  topSpending,
}: ReportPdfProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoUrl.src} style={styles.logo} />

            <View style={styles.headerDivider} />

            <View style={styles.headerContent}>
              <Text style={styles.eyebrow}>Track • Plan • Save</Text>

              <Text style={styles.title}>Monthly Financial Report</Text>

              <Text style={styles.preparedFor}>Prepared for {userName}</Text>
            </View>
          </View>

          <View style={styles.monthBadge}>
            <Text style={styles.monthText}>{monthLabel}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryGrid}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: "#edf7f2",
                borderColor: "#d7ebe2",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#477d69" }]}>
              Income
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(summary.income)}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: "#fbf1ed",
                borderColor: "#f1ddd5",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#b9664d" }]}>
              Spending
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(summary.spending)}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: "#eef5fa",
                borderColor: "#dbe8f1",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#0e3866" }]}>
              Net Cash Flow
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(summary.netCashFlow)}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: "#f2eff8",
                borderColor: "#e4def0",
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: "#62568f" }]}>
              Avg. Daily Spend
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(summary.averageDailySpend)}
            </Text>
          </View>
        </View>

        {/* SPENDING BY CATEGORY */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#0e3866" }]}>
            Spending by Category
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnWide, styles.tableHeaderText]}>
                Category
              </Text>

              <Text style={[styles.column, styles.tableHeaderText]}>
                Current
              </Text>

              <Text style={[styles.column, styles.tableHeaderText]}>
                Previous
              </Text>

              <Text style={[styles.column, styles.tableHeaderText]}>
                Change
              </Text>
            </View>

            {spendingComparison.map((item) => {
              const color = categoryColors[item.category] ?? "#94a3b8";

              return (
                <View key={item.category} style={styles.tableRow}>
                  <View
                    style={[
                      styles.columnWide,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: color,
                        marginRight: 7,
                      }}
                    />

                    <Text style={styles.bodyText}>
                      {formatCategory(item.category)}
                    </Text>
                  </View>

                  <Text style={[styles.column, styles.bodyText]}>
                    {formatCurrency(item.current)}
                  </Text>

                  <Text
                    style={[
                      styles.column,
                      styles.bodyText,
                      { color: "#94a3b8" },
                    ]}
                  >
                    {formatCurrency(item.previous)}
                  </Text>

                  <Text
                    style={[
                      styles.column,
                      styles.bodyText,
                      {
                        fontWeight: 700,
                        color:
                          item.previous === 0 && item.current > 0
                            ? "#7c6fb0"
                            : item.change > 0
                              ? "#a6534b"
                              : item.change < 0
                                ? "#477d69"
                                : "#94a3b8",
                      },
                    ]}
                  >
                    {item.previous === 0 && item.current > 0
                      ? "NEW"
                      : item.change === 0
                        ? "—"
                        : `${item.change > 0 ? "+" : ""}${item.change.toFixed(0)}%`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* BUDGET PERFORMANCE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#0e3866" }]}>
            Budget Performance
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnWide, styles.tableHeaderText]}>
                Category
              </Text>

              <Text style={[styles.column, styles.tableHeaderText]}>
                Budget
              </Text>

              <Text style={[styles.column, styles.tableHeaderText]}>Spent</Text>

              <Text style={[styles.column, styles.tableHeaderText]}>Used</Text>
            </View>

            {budgetPerformance.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View
                  style={[
                    styles.columnWide,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        categoryColors[item.category] ?? "#94a3b8",
                      marginRight: 7,
                    }}
                  />

                  <Text style={styles.bodyText}>
                    {formatCategory(item.category)}
                  </Text>
                </View>

                <Text style={[styles.column, styles.bodyText]}>
                  {formatCurrency(item.budgetAmount)}
                </Text>

                <Text style={[styles.column, styles.bodyText]}>
                  {formatCurrency(item.currentSpent)}
                </Text>

                <Text
                  style={[
                    styles.column,
                    styles.bodyText,
                    {
                      fontWeight: 700,
                      color:
                        item.currentPercent >= 100
                          ? "#a6534b"
                          : item.currentPercent >= 75
                            ? "#b9664d"
                            : "#0e3866",
                    },
                  ]}
                >
                  {Math.round(item.currentPercent)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* SAVINGS GOALS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#0e3866" }]}>
            Savings Goals Progress
          </Text>

          {savingsProgress.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.min(
                    (goal.contributedThisMonth / goal.targetAmount) * 100,
                    100,
                  )
                : 0;

            return (
              <View
                key={goal.id}
                style={{
                  paddingVertical: 7,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f1f5f9",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.bodyText, { fontWeight: 700 }]}>
                    {goal.name}
                  </Text>

                  <Text style={[styles.bodyText, { color: "#64748b" }]}>
                    {formatCurrency(goal.currentAmount)} /{" "}
                    {formatCurrency(goal.targetAmount)} overall
                  </Text>
                </View>

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 8,
                    color: "#64748b",
                  }}
                >
                  {formatCurrency(goal.contributedThisMonth)} contributed this
                  month
                </Text>

                <View
                  style={{
                    marginTop: 7,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: "#edf2f7",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${percent}%`,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: "#5f9f87",
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      width: 30,
                      marginLeft: 8,
                      textAlign: "right",
                      fontSize: 8,
                      fontWeight: 700,
                      color: "#477d69",
                    }}
                  >
                    {Math.round(percent)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* TOP SPENDING */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#0e3866" }]}>
            Top Spending
          </Text>

          {topSpending.map((item) => (
            <View
              key={item.id}
              style={[styles.tableRow, { alignItems: "center" }]}
            >
              <View
                style={[
                  styles.columnWide,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    backgroundColor: `${categoryColors[item.category] ?? "#94a3b8"}18`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        categoryColors[item.category] ?? "#94a3b8",
                    }}
                  />
                </View>

                <Text style={[styles.bodyText, { fontWeight: 700 }]}>
                  {item.description ?? "Untitled transaction"}
                </Text>
              </View>

              <Text
                style={[styles.column, styles.bodyText, { color: "#64748b" }]}
              >
                {formatCategory(item.category)}
              </Text>

              <Text
                style={[
                  styles.column,
                  styles.bodyText,
                  {
                    fontWeight: 700,
                    color: "#0f172a",
                  },
                ]}
              >
                {formatCurrency(item.amount)}
              </Text>

              <Text
                style={[styles.column, styles.bodyText, { color: "#64748b" }]}
              >
                {formatDate(item.date)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer]}>
          Reports are based on completed transactions only.
        </Text>
      </Page>
    </Document>
  );
}
