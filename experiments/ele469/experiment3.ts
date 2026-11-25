import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

import {
  initializeTestDatabase,
  createTestUser,
  cleanupTestData,
} from "./setup";

const WORKLOADS = [1, 10, 50, 100, 500, 1000];

const TRIALS = 10;
const INITIAL_BALANCE = 1000;
const EXPENSE_AMOUNT = 50;
const EXPECTED_BALANCE = INITIAL_BALANCE - EXPENSE_AMOUNT;

type TestDatabase = Awaited<ReturnType<typeof initializeTestDatabase>>;

type Processor =
  typeof import("../../lib/process-recurring").processRecurringTransactions;

type TrialResult = {
  workload: number;
  trial: number;
  durationMs: number;
  throughput: number;
  seriesProcessed: number;
  occurrencesCreated: number;
  transactionCount: number;
  duplicateRecords: number;
  maxBalanceError: number;
  scheduleErrors: number;
  passed: boolean;
};

async function createWorkload(
  db: TestDatabase,
  userId: string,
  workload: number,
) {
  const scheduledDate = new Date(Date.now() - 60 * 60 * 1000);

  const expectedNextDate = new Date(scheduledDate);

  expectedNextDate.setDate(expectedNextDate.getDate() + 1);

  const accounts = Array.from({ length: workload }, (_, index) => ({
    id: randomUUID(),
    name: `ELE469 Test Account ${index + 1}`,
    type: "DEBIT" as const,
    balance: INITIAL_BALANCE,
    userId,
  }));

  await db.account.createMany({
    data: accounts,
  });

  const recurringSeries = accounts.map((account) => ({
    id: randomUUID(),
    type: "EXPENSE" as const,
    amount: EXPENSE_AMOUNT,
    description: "ELE469 Performance Test",
    category: "UTILITIES" as const,
    interval: "DAILY" as const,
    nextRecurringDate: scheduledDate,
    isActive: true,
    userId,
    accountId: account.id,
  }));

  await db.recurringTransaction.createMany({
    data: recurringSeries,
  });

  return {
    scheduledDate,
    expectedNextDate,
    accounts,
    recurringSeries,
  };
}

async function runTrial(
  db: TestDatabase,
  processRecurringTransactions: Processor,
  workload: number,
  trial: number,
): Promise<TrialResult> {
  let userId: string | undefined;

  try {
    // Confirm a clean experimental environment.
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.account.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    const user = await createTestUser(db);
    userId = user.id;

    // Generate the workload before starting the timer.
    const { scheduledDate, expectedNextDate, recurringSeries } =
      await createWorkload(db, user.id, workload);

    // Measure only processor execution.
    const startTime = performance.now();

    const result = await processRecurringTransactions();

    const durationMs = performance.now() - startTime;

    // Retrieve persisted database state.
    const accounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const updatedSeries = await db.recurringTransaction.findMany({
      where: { userId: user.id },
    });

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
    });

    // Evaluate account balance consistency.
    const maxBalanceError = Math.max(
      0,
      ...accounts.map((account) =>
        Math.abs(account.balance.toNumber() - EXPECTED_BALANCE),
      ),
    );

    // Evaluate recurring schedule consistency.
    const scheduleErrors = updatedSeries.filter(
      (series) =>
        series.nextRecurringDate.getTime() !== expectedNextDate.getTime() ||
        series.lastProcessed?.getTime() !== scheduledDate.getTime(),
    ).length;

    // Detect duplicate occurrences.
    const uniqueOccurrences = new Set(
      transactions.map(
        (transaction) =>
          `${transaction.recurringTransactionId}:` +
          `${transaction.scheduledFor?.getTime()}`,
      ),
    );

    const duplicateRecords = transactions.length - uniqueOccurrences.size;

    // Map each recurring series to its expected account.
    const expectedAccounts = new Map<string, string>(
      recurringSeries.map((series) => [series.id, series.accountId]),
    );

    // Validate every transaction record.
    const transactionsCorrect = transactions.every(
      (transaction) =>
        transaction.amount.toNumber() === EXPENSE_AMOUNT &&
        transaction.type === "EXPENSE" &&
        transaction.status === "COMPLETED" &&
        transaction.userId === user.id &&
        transaction.recurringTransactionId !== null &&
        expectedAccounts.get(transaction.recurringTransactionId) ===
          transaction.accountId &&
        transaction.scheduledFor?.getTime() === scheduledDate.getTime() &&
        transaction.date.getTime() === scheduledDate.getTime(),
    );

    // Calculate processing throughput.
    const throughput = result.occurrencesCreated / (durationMs / 1000);

    const passed =
      result.seriesProcessed === workload &&
      result.occurrencesCreated === workload &&
      accounts.length === workload &&
      updatedSeries.length === workload &&
      transactions.length === workload &&
      duplicateRecords === 0 &&
      maxBalanceError === 0 &&
      scheduleErrors === 0 &&
      transactionsCorrect;

    return {
      workload,
      trial,
      durationMs,
      throughput,
      seriesProcessed: result.seriesProcessed,
      occurrencesCreated: result.occurrencesCreated,
      transactionCount: transactions.length,
      duplicateRecords,
      maxBalanceError,
      scheduleErrors,
      passed,
    };
  } finally {
    if (userId) {
      await cleanupTestData(db, userId);
    }
  }
}

function calculateStatistics(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);

  const mean =
    values.reduce((total, value) => total + value, 0) / values.length;

  const middle = Math.floor(sorted.length / 2);

  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  const variance =
    values.reduce((total, value) => total + Math.pow(value - mean, 2), 0) /
    (values.length - 1);

  return {
    mean,
    median,
    standardDeviation: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function exportCSV(filename: string, rows: object[]) {
  assert.ok(rows.length > 0);

  const headers = Object.keys(rows[0]);

  const lines = rows.map((row) => {
    const record = row as Record<string, unknown>;

    return headers.map((header) => String(record[header])).join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");

  writeFileSync(`experiments/ele469/${filename}`, csv + "\n", "utf8");

  console.log(`Results exported to ${filename}`);
}

async function main() {
  const db = await initializeTestDatabase();

  try {
    const { processRecurringTransactions } =
      await import("../../lib/process-recurring");

    const allResults: TrialResult[] = [];

    // Perform unmeasured warm-up trials.
    console.log("\n--- Warm-up Trials ---");

    for (const workload of WORKLOADS) {
      const result = await runTrial(
        db,
        processRecurringTransactions,
        workload,
        0,
      );

      assert.ok(result.passed, `Warm-up failed for workload ${workload}`);

      console.log(`Workload ${workload}: warm-up completed`);
    }

    // Execute measured performance trials.
    console.log("\n--- Performance Trials ---");

    for (let trial = 1; trial <= TRIALS; trial++) {
      // Rotate workload order between trial rounds.
      const offset = (trial - 1) % WORKLOADS.length;

      const orderedWorkloads = [
        ...WORKLOADS.slice(offset),
        ...WORKLOADS.slice(0, offset),
      ];

      for (const workload of orderedWorkloads) {
        const result = await runTrial(
          db,
          processRecurringTransactions,
          workload,
          trial,
        );

        allResults.push(result);

        console.log(
          `Workload ${workload} | ` +
            `Trial ${trial} | ` +
            `${result.durationMs.toFixed(2)} ms | ` +
            `${result.throughput.toFixed(2)} occ/s | ` +
            `${result.passed ? "PASSED" : "FAILED"}`,
        );
      }
    }

    // Aggregate statistics by workload size.
    const summary = WORKLOADS.map((workload) => {
      const results = allResults.filter(
        (result) => result.workload === workload,
      );

      const statistics = calculateStatistics(
        results.map((result) => result.durationMs),
      );

      const totalOccurrences = results.reduce(
        (total, result) => total + result.occurrencesCreated,
        0,
      );

      const totalDurationMs = results.reduce(
        (total, result) => total + result.durationMs,
        0,
      );

      const passedTrials = results.filter((result) => result.passed).length;

      return {
        workload,
        trials: results.length,

        meanMs: Number(statistics.mean.toFixed(3)),

        medianMs: Number(statistics.median.toFixed(3)),

        stdDevMs: Number(statistics.standardDeviation.toFixed(3)),

        minMs: Number(statistics.min.toFixed(3)),

        maxMs: Number(statistics.max.toFixed(3)),

        throughput: Number(
          (totalOccurrences / (totalDurationMs / 1000)).toFixed(3),
        ),

        totalOccurrences,

        duplicateRecords: results.reduce(
          (total, result) => total + result.duplicateRecords,
          0,
        ),

        maxBalanceError: Math.max(
          ...results.map((result) => result.maxBalanceError),
        ),

        scheduleErrors: results.reduce(
          (total, result) => total + result.scheduleErrors,
          0,
        ),

        passedTrials,

        passRate: (passedTrials / results.length) * 100,
      };
    });

    console.log("\n--- Experiment 3 Summary ---");
    console.table(summary);

    // Export individual and aggregated results.
    exportCSV("experiment3-trials.csv", allResults);

    exportCSV("experiment3-summary.csv", summary);

    // Verify complete experimental data cleanup.
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.account.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    console.log("\nExperimental database cleanup verified.");

    const allPassed = allResults.every((result) => result.passed);

    console.log(allPassed ? "\nEXPERIMENT 3 PASSED" : "\nEXPERIMENT 3 FAILED");

    if (!allPassed) {
      process.exitCode = 1;
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nEXPERIMENT 3 FAILED");
  console.error(error);
  process.exitCode = 1;
});
