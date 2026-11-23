import assert from "node:assert/strict";
import { Prisma } from "../lib/generated/prisma/client";

type BudgetStatus = "on_track" | "getting_close" | "over_budget";

type MockBudget = {
  category: string;
  amount: Prisma.Decimal;
  spent: Prisma.Decimal;
};

// Simulates the calculations in getBudgetStatus().
function calculateMockBudget(budget: MockBudget) {
  const remaining = budget.amount.minus(budget.spent);

  const percentUsed = budget.amount.gt(0)
    ? Math.round(budget.spent.div(budget.amount).mul(100).toNumber())
    : 0;

  const status: BudgetStatus =
    percentUsed > 100
      ? "over_budget"
      : percentUsed >= 75
        ? "getting_close"
        : "on_track";

  return {
    category: budget.category,
    limit: budget.amount.toFixed(2),
    spent: budget.spent.toFixed(2),
    remaining: remaining.toFixed(2),
    percentUsed,
    status,
  };
}

function summarizeMockBudgets(budgets: MockBudget[]) {
  let totalBudget = new Prisma.Decimal(0);
  let totalSpent = new Prisma.Decimal(0);

  const results = budgets.map((budget) => {
    totalBudget = totalBudget.plus(budget.amount);
    totalSpent = totalSpent.plus(budget.spent);

    return calculateMockBudget(budget);
  });

  return {
    budgets: results,
    budgetCount: results.length,
    totalBudget: totalBudget.toFixed(2),
    totalSpent: totalSpent.toFixed(2),
    totalRemaining: totalBudget.minus(totalSpent).toFixed(2),
  };
}

function makeBudget(
  category: string,
  amount: string,
  spent: string,
): MockBudget {
  return {
    category,
    amount: new Prisma.Decimal(amount),
    spent: new Prisma.Decimal(spent),
  };
}

let passed = 0;

// TEST 1: Below 75% is on track.
const onTrack = calculateMockBudget(makeBudget("GROCERIES", "100.00", "74.00"));

assert.equal(onTrack.percentUsed, 74);
assert.equal(onTrack.status, "on_track");
console.log("PASS: Below 75% is on track");
passed++;

// TEST 2: Exactly 75% is getting close.
const gettingClose = calculateMockBudget(
  makeBudget("GROCERIES", "100.00", "75.00"),
);

assert.equal(gettingClose.percentUsed, 75);
assert.equal(gettingClose.status, "getting_close");
console.log("PASS: 75% is getting close");
passed++;

// TEST 3: Exactly 100% is still getting close.
const fullyUsed = calculateMockBudget(makeBudget("DINING", "100.00", "100.00"));

assert.equal(fullyUsed.percentUsed, 100);
assert.equal(fullyUsed.remaining, "0.00");
assert.equal(fullyUsed.status, "getting_close");
console.log("PASS: 100% matches Pocket status rules");
passed++;

// TEST 4: Over budget produces negative remaining.
const overBudget = calculateMockBudget(
  makeBudget("SHOPPING", "100.00", "125.50"),
);

assert.equal(overBudget.remaining, "-25.50");
assert.equal(overBudget.percentUsed, 126);
assert.equal(overBudget.status, "over_budget");
console.log("PASS: Over budget and negative remaining");
passed++;

// TEST 5: Percentage rounds before classification.
const rounded = calculateMockBudget(
  makeBudget("ENTERTAINMENT", "100.00", "74.60"),
);

assert.equal(rounded.percentUsed, 75);
assert.equal(rounded.status, "getting_close");
console.log("PASS: Percentage rounding matches Pocket");
passed++;

// TEST 6: Configured budget with zero spending.
const zeroSpending = calculateMockBudget(
  makeBudget("GROCERIES", "95.00", "0.00"),
);

assert.equal(zeroSpending.remaining, "95.00");
assert.equal(zeroSpending.percentUsed, 0);
assert.equal(zeroSpending.status, "on_track");
console.log("PASS: Configured budget with zero spending");
passed++;

// TEST 7: Missing budgets return an empty summary.
const empty = summarizeMockBudgets([]);

assert.deepEqual(empty.budgets, []);
assert.equal(empty.budgetCount, 0);
assert.equal(empty.totalBudget, "0.00");
assert.equal(empty.totalSpent, "0.00");
assert.equal(empty.totalRemaining, "0.00");
console.log("PASS: Empty budgets return zero totals");
passed++;

// TEST 8: Decimal arithmetic preserves cents.
const decimalTotals = summarizeMockBudgets([
  makeBudget("GROCERIES", "0.50", "0.10"),
  makeBudget("DINING", "0.50", "0.20"),
]);

assert.equal(decimalTotals.totalBudget, "1.00");
assert.equal(decimalTotals.totalSpent, "0.30");
assert.equal(decimalTotals.totalRemaining, "0.70");
console.log("PASS: Decimal totals preserve precision");
passed++;

console.log(`\n${passed}/8 mock tests passed`);
