import assert from "node:assert/strict";

import {
  addCalendarDays,
  classifyBillDueDate,
  getEasternDateKey,
} from "../lib/ai/date-utils";

const asOfDate = "2026-11-21";
const windowDays = 45;

const cases = [
  {
    name: "Past due bill",
    dueDate: "2026-11-20",
    expected: "overdue",
  },
  {
    name: "Bill due today",
    dueDate: "2026-11-21",
    expected: "today",
  },
  {
    name: "Bill due tomorrow",
    dueDate: "2026-11-22",
    expected: "upcoming",
  },
  {
    name: "Bill exactly 45 days away",
    dueDate: "2027-01-05",
    expected: "upcoming",
  },
  {
    name: "Bill 46 days away",
    dueDate: "2027-01-06",
    expected: null,
  },
  {
    name: "Older overdue bill remains included",
    dueDate: "2026-09-20",
    expected: "overdue",
  },
] as const;

let passed = 0;

for (const testCase of cases) {
  const actual = classifyBillDueDate(testCase.dueDate, asOfDate, windowDays);

  assert.equal(actual, testCase.expected);
  console.log(`PASS: ${testCase.name}`);
  passed++;
}

assert.equal(addCalendarDays(asOfDate, windowDays), "2027-01-05");
console.log("PASS: 45-day calendar boundary");
passed++;

assert.equal(getEasternDateKey(new Date("2026-11-21T02:00:00Z")), "2026-11-20");
console.log("PASS: UTC timestamp converts to Eastern date");
passed++;

assert.equal(getEasternDateKey(new Date("2026-11-21T17:00:00Z")), "2026-11-21");
console.log("PASS: Eastern daytime conversion");
passed++;

console.log(`\n${passed}/${cases.length + 3} tests passed`);
