import { strict as assert } from "node:assert";
import { parseMonthlySpendingArguments } from "../lib/ai/tool-validation";

const validArguments = [
  '{"month":"2026-09","category":"GROCERIES"}',
  '{"month":"2026-09","category":null}',
];

const invalidArguments = [
  '{"month":',
  '{"month":"2026-13","category":"GROCERIES"}',
  '{"month":"2026-09","category":"PIZZA"}',
  '{"month":"2026-09","category":"GROCERIES","userId":"another-user"}',
  '{"month":"2026-09"}',
  '{"category":"GROCERIES"}',
  "[]",
];

for (const raw of validArguments) {
  const result = parseMonthlySpendingArguments(raw);

  assert.equal(result.month, "2026-09");
  console.log("PASS: Valid arguments accepted");
}

for (const raw of invalidArguments) {
  assert.throws(() => {
    parseMonthlySpendingArguments(raw);
  });

  console.log("PASS: Invalid arguments rejected");
}

console.log("All argument-validation tests passed.");
