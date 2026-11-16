import { strict as assert } from "node:assert";

type AggregateResult = {
  _sum: {
    amount: { toFixed: (places: number) => string } | null;
  };
  _count: {
    _all: number;
  };
};

async function calculateSpending(aggregate: () => Promise<AggregateResult>) {
  const result = await aggregate();

  return {
    total: result._sum.amount?.toFixed(2) ?? "0.00",
    transactionCount: result._count._all,
  };
}

async function main() {
  // Test 1: Successful query with no matching transactions.
  const emptyResult = await calculateSpending(async () => ({
    _sum: { amount: null },
    _count: { _all: 0 },
  }));

  assert.deepEqual(emptyResult, {
    total: "0.00",
    transactionCount: 0,
  });

  console.log("PASS: Empty query returns zero spending");

  // Test 2: Database query throws an error.
  await assert.rejects(
    calculateSpending(async () => {
      throw new Error("Simulated database failure");
    }),
    /Simulated database failure/,
  );

  console.log("PASS: Database failure propagates as an error");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
