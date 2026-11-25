import assert from "node:assert/strict";
import {
  initializeTestDatabase,
  createTestUser,
  createTestAccount,
  createRecurringExpense,
  cleanupTestData,
} from "./setup";

const TRIALS = 10;
const INVOCATIONS = 5;
const INITIAL_BALANCE = 1000;
const EXPENSE_AMOUNT = 50;
const EXPECTED_BALANCE = INITIAL_BALANCE - EXPENSE_AMOUNT;

type ExecutionMode = "Repeated" | "Concurrent";

type TestDatabase = Awaited<ReturnType<typeof initializeTestDatabase>>;

type Processor =
  typeof import("../../lib/process-recurring").processRecurringTransactions;

type TrialResult = {
  scenario: ExecutionMode;
  trial: number;
  invocations: number;
  seriesSelected: number;
  occurrencesCreated: number;
  transactionCount: number;
  duplicateRecords: number;
  finalBalance: number;
  balanceError: number;
  scheduleCorrect: boolean;
  passed: boolean;
};

async function runTrial(
  db: TestDatabase,
  processRecurringTransactions: Processor,
  scenario: ExecutionMode,
  trial: number,
): Promise<TrialResult> {
  let userId: string | undefined;

  try {
    // Confirm a clean starting state.
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    // Create synthetic test data.
    const user = await createTestUser(db);
    userId = user.id;

    const account = await createTestAccount(db, user.id, INITIAL_BALANCE);

    const recurring = await createRecurringExpense(
      db,
      user.id,
      account.id,
      EXPENSE_AMOUNT,
    );

    // Calculate the expected next scheduled date.
    const expectedNextDate = new Date(recurring.nextRecurringDate);

    expectedNextDate.setDate(expectedNextDate.getDate() + 1);

    // Execute the processor.
    const results: Awaited<ReturnType<Processor>>[] = [];

    if (scenario === "Repeated") {
      for (let i = 0; i < INVOCATIONS; i++) {
        results.push(await processRecurringTransactions());
      }
    } else {
      const settled = await Promise.allSettled(
        Array.from({ length: INVOCATIONS }, () =>
          processRecurringTransactions(),
        ),
      );

      for (const result of settled) {
        if (result.status === "rejected") {
          throw result.reason;
        }

        results.push(result.value);
      }
    }

    // Retrieve the persisted database state.
    const updatedAccount = await db.account.findUniqueOrThrow({
      where: { id: account.id },
    });

    const updatedRecurring = await db.recurringTransaction.findUniqueOrThrow({
      where: { id: recurring.id },
    });

    const transactions = await db.transaction.findMany({
      where: {
        recurringTransactionId: recurring.id,
      },
    });

    // Aggregate processor results.
    const seriesSelected = results.reduce(
      (total, result) => total + result.seriesProcessed,
      0,
    );

    const occurrencesCreated = results.reduce(
      (total, result) => total + result.occurrencesCreated,
      0,
    );

    // Calculate correctness metrics.
    const finalBalance = updatedAccount.balance.toNumber();

    const balanceError = Math.abs(finalBalance - EXPECTED_BALANCE);

    const duplicateRecords = Math.max(0, transactions.length - 1);

    const scheduleCorrect =
      updatedRecurring.nextRecurringDate.getTime() ===
        expectedNextDate.getTime() &&
      updatedRecurring.lastProcessed?.getTime() ===
        recurring.nextRecurringDate.getTime();

    const transactionCorrect =
      transactions.length === 1 &&
      transactions[0].amount.toNumber() === EXPENSE_AMOUNT &&
      transactions[0].type === "EXPENSE" &&
      transactions[0].status === "COMPLETED" &&
      transactions[0].userId === user.id &&
      transactions[0].accountId === account.id &&
      transactions[0].scheduledFor?.getTime() ===
        recurring.nextRecurringDate.getTime() &&
      transactions[0].date.getTime() === recurring.nextRecurringDate.getTime();

    const passed =
      occurrencesCreated === 1 &&
      duplicateRecords === 0 &&
      balanceError === 0 &&
      scheduleCorrect &&
      transactionCorrect;

    return {
      scenario,
      trial,
      invocations: INVOCATIONS,
      seriesSelected,
      occurrencesCreated,
      transactionCount: transactions.length,
      duplicateRecords,
      finalBalance,
      balanceError,
      scheduleCorrect,
      passed,
    };
  } finally {
    if (userId) {
      await cleanupTestData(db, userId);
    }
  }
}

async function main() {
  const db = await initializeTestDatabase();

  try {
    const { processRecurringTransactions } =
      await import("../../lib/process-recurring");

    const allResults: TrialResult[] = [];

    const scenarios: ExecutionMode[] = ["Repeated", "Concurrent"];

    for (const scenario of scenarios) {
      console.log(`\n--- ${scenario} Executions ---`);

      for (let trial = 1; trial <= TRIALS; trial++) {
        const result = await runTrial(
          db,
          processRecurringTransactions,
          scenario,
          trial,
        );

        allResults.push(result);

        console.log(
          `${scenario} trial ${trial}: ` +
            `${result.passed ? "PASSED" : "FAILED"}`,
        );
      }
    }

    console.log("\n--- Individual Trial Results ---");
    console.table(allResults);

    const summary = scenarios.map((scenario) => {
      const results = allResults.filter(
        (result) => result.scenario === scenario,
      );

      return {
        scenario,
        trials: results.length,

        totalInvocations: results.reduce(
          (total, result) => total + result.invocations,
          0,
        ),

        totalSeriesSelected: results.reduce(
          (total, result) => total + result.seriesSelected,
          0,
        ),

        totalOccurrencesCreated: results.reduce(
          (total, result) => total + result.occurrencesCreated,
          0,
        ),

        totalDuplicateRecords: results.reduce(
          (total, result) => total + result.duplicateRecords,
          0,
        ),

        maxBalanceError: Math.max(
          ...results.map((result) => result.balanceError),
        ),

        scheduleErrors: results.filter((result) => !result.scheduleCorrect)
          .length,

        passedTrials: results.filter((result) => result.passed).length,

        passRate:
          (results.filter((result) => result.passed).length / results.length) *
          100,
      };
    });

    console.log("\n--- Experiment 1 Summary ---");
    console.table(summary);

    const allPassed = allResults.every((result) => result.passed);

    assert.equal(await db.user.count(), 0);
    assert.equal(await db.account.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    console.log("\nExperimental database cleanup verified.");

    console.log(allPassed ? "\nEXPERIMENT 1 PASSED" : "\nEXPERIMENT 1 FAILED");

    if (!allPassed) {
      process.exitCode = 1;
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nEXPERIMENT 1 FAILED");
  console.error(error);
  process.exitCode = 1;
});
