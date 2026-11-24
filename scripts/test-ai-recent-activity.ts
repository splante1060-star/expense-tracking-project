import assert from "node:assert/strict";

import { getRecentActivityDateRange } from "../lib/ai/date-utils";
import { paginateActivityResults } from "../lib/ai/pagination-utils";

const referenceDate = new Date("2026-11-23T17:00:00Z");

const { startDate, endDateExclusive } = getRecentActivityDateRange(
  30,
  referenceDate,
);

let passed = 0;

function isInWindow(date: string) {
  const value = new Date(date);

  return value >= startDate && value < endDateExclusive;
}

// TEST 1: Start of the 30-day window.
assert.equal(isInWindow("2026-10-25T04:00:00.000Z"), true);
console.log("PASS: First day of window included");
passed++;

// TEST 2: Immediately before the window.
assert.equal(isInWindow("2026-10-25T03:59:59.999Z"), false);
console.log("PASS: Before window excluded");
passed++;

// TEST 3: Last moment of November 23.
assert.equal(isInWindow("2026-11-24T04:59:59.999Z"), true);
console.log("PASS: Last moment of today included");
passed++;

// TEST 4: Midnight November 24.
assert.equal(isInWindow("2026-11-24T05:00:00.000Z"), false);
console.log("PASS: Tomorrow excluded");
passed++;

// TEST 5: Verify DST-aware boundaries.
assert.equal(startDate.toISOString(), "2026-10-25T04:00:00.000Z");

assert.equal(endDateExclusive.toISOString(), "2026-11-24T05:00:00.000Z");

console.log("PASS: Eastern DST boundaries");
passed++;

// TEST 6: Exactly 10 results.
const tenRecords = Array.from({ length: 10 }, (_, index) => index + 1);

const exactPage = paginateActivityResults(tenRecords, 10);

assert.equal(exactPage.returnedCount, 10);
assert.equal(exactPage.hasMore, false);

console.log("PASS: Exact limit has no more results");
passed++;

// TEST 7: Eleven results with limit 10.
const elevenRecords = Array.from({ length: 11 }, (_, index) => index + 1);

const extraPage = paginateActivityResults(elevenRecords, 10);

assert.equal(extraPage.returnedCount, 10);
assert.equal(extraPage.hasMore, true);
assert.deepEqual(extraPage.items, tenRecords);

console.log("PASS: Extra record sets hasMore");
passed++;

// TEST 8: Empty results.
const emptyPage = paginateActivityResults([], 10);

assert.equal(emptyPage.returnedCount, 0);
assert.equal(emptyPage.hasMore, false);
assert.deepEqual(emptyPage.items, []);

console.log("PASS: Empty activity results");
passed++;

// TEST 9: Reject invalid days.
assert.throws(
  () => getRecentActivityDateRange(366, referenceDate),
  /Days must be between 1 and 365/,
);

console.log("PASS: Invalid date range rejected");
passed++;

// TEST 10: Reject invalid limit.
assert.throws(
  () => paginateActivityResults([], 26),
  /Limit must be between 1 and 25/,
);

console.log("PASS: Invalid result limit rejected");
passed++;

console.log(`\n${passed}/10 tests passed`);
