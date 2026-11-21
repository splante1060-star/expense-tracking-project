import assert from "node:assert/strict";
import { Prisma } from "../lib/generated/prisma/client";
import { classifyBillDueDate, getEasternDateKey } from "../lib/ai/date-utils";

type MockBill = {
  name: string;
  amount: Prisma.Decimal;
  dueDate: Date;
  isActive: boolean;
  isRecurring: boolean;
};

const asOfDate = "2026-11-21";
const windowDays = 45;

// Simulates the active-only filtering performed by Prisma.
function mockFindActiveBills(bills: MockBill[]) {
  return bills
    .filter((bill) => bill.isActive)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Simulates the grouping and total calculation.
// Uses the same date helpers as getUpcomingBills().
function summarizeMockBills(bills: MockBill[]) {
  const activeBills = mockFindActiveBills(bills);

  const overdue: string[] = [];
  const upcoming: string[] = [];

  let overdueTotal = new Prisma.Decimal(0);
  let upcomingTotal = new Prisma.Decimal(0);

  for (const bill of activeBills) {
    const dueDate = getEasternDateKey(bill.dueDate);

    const status = classifyBillDueDate(dueDate, asOfDate, windowDays);

    if (status === null) continue;

    if (status === "overdue") {
      overdue.push(bill.name);
      overdueTotal = overdueTotal.plus(bill.amount);
    } else {
      upcoming.push(bill.name);
      upcomingTotal = upcomingTotal.plus(bill.amount);
    }
  }

  return {
    overdue,
    upcoming,
    overdueTotal: overdueTotal.toFixed(2),
    upcomingTotal: upcomingTotal.toFixed(2),
  };
}

let passed = 0;

// TEST 1: No bills
const empty = summarizeMockBills([]);

assert.deepEqual(empty.overdue, []);
assert.deepEqual(empty.upcoming, []);
assert.equal(empty.overdueTotal, "0.00");
assert.equal(empty.upcomingTotal, "0.00");

console.log("PASS: Empty bills return zero totals");
passed++;

// TEST 2: Inactive bills
const inactive = summarizeMockBills([
  {
    name: "Inactive Bill",
    amount: new Prisma.Decimal("500.00"),
    dueDate: new Date("2026-11-25T17:00:00Z"),
    isActive: false,
    isRecurring: false,
  },
  {
    name: "Active Bill",
    amount: new Prisma.Decimal("25.50"),
    dueDate: new Date("2026-11-25T17:00:00Z"),
    isActive: true,
    isRecurring: false,
  },
]);

assert.deepEqual(inactive.overdue, []);
assert.deepEqual(inactive.upcoming, ["Active Bill"]);
assert.equal(inactive.upcomingTotal, "25.50");

console.log("PASS: Inactive bills are excluded");
passed++;

// TEST 3: Decimal totals
const totals = summarizeMockBills([
  {
    name: "Bill A",
    amount: new Prisma.Decimal("0.10"),
    dueDate: new Date("2026-11-25T17:00:00Z"),
    isActive: true,
    isRecurring: false,
  },
  {
    name: "Bill B",
    amount: new Prisma.Decimal("0.20"),
    dueDate: new Date("2026-11-26T17:00:00Z"),
    isActive: true,
    isRecurring: true,
  },
]);

assert.equal(totals.upcomingTotal, "0.30");
assert.equal(totals.upcoming.length, 2);

console.log("PASS: Decimal totals preserve precision");
passed++;

console.log(`\n${passed}/3 mock tests passed`);
