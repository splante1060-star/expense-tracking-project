import assert from "node:assert/strict";

import {
  initializeTestDatabase,
  createTestUser,
  createTestAccount,
  createRecurringExpense,
  cleanupTestData,
} from "./setup";

import {
  installFailureTrigger,
  removeFailureTrigger,
} from "./failure-injection";

const TRIALS = 10;
const INITIAL_BALANCE = 1000;
const EXPENSE_AMOUNT = 50;

type TestDatabase = Awaited<ReturnType<typeof initializeTestDatabase>>;

type Processor =
  typeof import("../../lib/process-recurring").processRecurringTransactions;

type TrialResult = {
  trial: number;
  failureDetected: boolean;
  balanceAfterFailure: number;
  transactionsAfterFailure: number;
  rollbackCorrect: boolean;
  previousWorkPreserved: boolean;
  recoveredOccurrences: number;
  finalBalance: number;
  finalTransactionCount: number;
  duplicateRecords: number;
  balanceError: number;
  scheduleCorrect: boolean;
  passed: boolean;
};

async function getDatabaseState(
  db: TestDatabase,
  accountId: string,
  recurringId: string,
) {
  const account = await db.account.findUniqueOrThrow({
    where: { id: accountId },
  });

  const recurring = await db.recurringTransaction.findUniqueOrThrow({
    where: { id: recurringId },
  });

  const transactions = await db.transaction.findMany({
    where: {
      recurringTransactionId: recurringId,
    },
    orderBy: {
      scheduledFor: "asc",
    },
  });

  return {
    balance: account.balance.toNumber(),
    recurring,
    transactions,
  };
}

async function runTrial(
  db: TestDatabase,
  processRecurringTransactions: Processor,
  trial: number,
): Promise<TrialResult> {
  let userId: string | undefined;
  let triggerInstalled = false;

  try {
    // Confirm a clean starting state.
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.account.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    // Create synthetic test data.
    const user = await createTestUser(db);
    userId = user.id;

    const account = await createTestAccount(db, user.id, INITIAL_BALANCE);

    // Create two overdue daily occurrences.
    const firstDate = new Date(Date.now() - 25 * 60 * 60 * 1000);

    const secondDate = new Date(firstDate);
    secondDate.setDate(secondDate.getDate() + 1);

    const thirdDate = new Date(secondDate);
    thirdDate.setDate(thirdDate.getDate() + 1);

    // Verify exactly two occurrences are due.
    const now = new Date();

    assert.ok(firstDate <= now);
    assert.ok(secondDate <= now);
    assert.ok(thirdDate > now);

    const recurring = await createRecurringExpense(
      db,
      user.id,
      account.id,
      EXPENSE_AMOUNT,
      firstDate,
    );

    // Install the controlled failure mechanism.
    await installFailureTrigger(account.id);
    triggerInstalled = true;

    // Execute Pocket's processor and expect failure.
    let failureDetected = false;

    try {
      await processRecurringTransactions();
    } catch (error) {
      if (String(error).includes("ELE469_SIMULATED_FAILURE")) {
        failureDetected = true;
      } else {
        throw error;
      }
    }

    // Observe the database immediately after failure.
    const failedState = await getDatabaseState(db, account.id, recurring.id);

    const rollbackCorrect =
      failedState.balance === 950 &&
      failedState.transactions.length === 1 &&
      failedState.recurring.nextRecurringDate.getTime() ===
        secondDate.getTime() &&
      failedState.recurring.lastProcessed?.getTime() === firstDate.getTime();

    const firstTransaction = failedState.transactions[0];

    const previousWorkPreserved =
      failedState.transactions.length === 1 &&
      firstTransaction.amount.toNumber() === EXPENSE_AMOUNT &&
      firstTransaction.type === "EXPENSE" &&
      firstTransaction.status === "COMPLETED" &&
      firstTransaction.accountId === account.id &&
      firstTransaction.userId === user.id &&
      firstTransaction.scheduledFor?.getTime() === firstDate.getTime() &&
      firstTransaction.date.getTime() === firstDate.getTime();

    // Remove the failure condition.
    await removeFailureTrigger();
    triggerInstalled = false;

    // Simulate a retry by re-executing the processor.
    const recoveryResult = await processRecurringTransactions();

    // Observe the recovered database state.
    const recoveredState = await getDatabaseState(db, account.id, recurring.id);

    const finalBalance = recoveredState.balance;

    const balanceError = Math.abs(
      finalBalance - (INITIAL_BALANCE - 2 * EXPENSE_AMOUNT),
    );

    const finalTransactionCount = recoveredState.transactions.length;

    const uniqueOccurrences = new Set(
      recoveredState.transactions.map((transaction) =>
        transaction.scheduledFor?.getTime(),
      ),
    );

    const duplicateRecords = finalTransactionCount - uniqueOccurrences.size;

    const scheduleCorrect =
      recoveredState.recurring.nextRecurringDate.getTime() ===
        thirdDate.getTime() &&
      recoveredState.recurring.lastProcessed?.getTime() ===
        secondDate.getTime();

    const transactionsCorrect =
      finalTransactionCount === 2 &&
      recoveredState.transactions.every((transaction, index) => {
        const expectedDate = index === 0 ? firstDate : secondDate;

        return (
          transaction.amount.toNumber() === EXPENSE_AMOUNT &&
          transaction.type === "EXPENSE" &&
          transaction.status === "COMPLETED" &&
          transaction.accountId === account.id &&
          transaction.userId === user.id &&
          transaction.scheduledFor?.getTime() === expectedDate.getTime() &&
          transaction.date.getTime() === expectedDate.getTime()
        );
      });

    const originalTransactionPreserved =
      previousWorkPreserved &&
      recoveredState.transactions[0]?.id === firstTransaction.id;

    const passed =
      failureDetected &&
      rollbackCorrect &&
      originalTransactionPreserved &&
      recoveryResult.seriesProcessed === 1 &&
      recoveryResult.occurrencesCreated === 1 &&
      balanceError === 0 &&
      duplicateRecords === 0 &&
      scheduleCorrect &&
      transactionsCorrect;

    return {
      trial,
      failureDetected,
      balanceAfterFailure: failedState.balance,
      transactionsAfterFailure: failedState.transactions.length,
      rollbackCorrect,
      previousWorkPreserved: originalTransactionPreserved,
      recoveredOccurrences: recoveryResult.occurrencesCreated,
      finalBalance,
      finalTransactionCount,
      duplicateRecords,
      balanceError,
      scheduleCorrect,
      passed,
    };
  } finally {
    try {
      if (triggerInstalled) {
        await removeFailureTrigger();
      }
    } finally {
      if (userId) {
        await cleanupTestData(db, userId);
      }
    }
  }
}

async function main() {
  const db = await initializeTestDatabase();

  try {
    const { processRecurringTransactions } =
      await import("../../lib/process-recurring");

    const allResults: TrialResult[] = [];

    console.log("\n--- Failure Handling and Recovery ---");

    for (let trial = 1; trial <= TRIALS; trial++) {
      const result = await runTrial(db, processRecurringTransactions, trial);

      allResults.push(result);

      console.log(
        `Failure recovery trial ${trial}: ` +
          `${result.passed ? "PASSED" : "FAILED"}`,
      );
    }

    console.log("\n--- Individual Trial Results ---");
    console.table(allResults);

    const passedTrials = allResults.filter((result) => result.passed).length;

    const summary = {
      trials: allResults.length,

      failuresDetected: allResults.filter((result) => result.failureDetected)
        .length,

      successfulRollbacks: allResults.filter((result) => result.rollbackCorrect)
        .length,

      previousWorkPreserved: allResults.filter(
        (result) => result.previousWorkPreserved,
      ).length,

      totalRecoveredOccurrences: allResults.reduce(
        (total, result) => total + result.recoveredOccurrences,
        0,
      ),

      totalFinalTransactions: allResults.reduce(
        (total, result) => total + result.finalTransactionCount,
        0,
      ),

      totalDuplicateRecords: allResults.reduce(
        (total, result) => total + result.duplicateRecords,
        0,
      ),

      maxBalanceError: Math.max(
        ...allResults.map((result) => result.balanceError),
      ),

      scheduleErrors: allResults.filter((result) => !result.scheduleCorrect)
        .length,

      passedTrials,

      passRate: (passedTrials / allResults.length) * 100,
    };

    console.log("\n--- Experiment 2 Summary ---");
    console.table(summary);

    // Verify complete experimental data cleanup.
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.account.count(), 0);
    assert.equal(await db.transaction.count(), 0);
    assert.equal(await db.recurringTransaction.count(), 0);

    console.log("\nExperimental database cleanup verified.");

    const allPassed = passedTrials === TRIALS;

    console.log(allPassed ? "\nEXPERIMENT 2 PASSED" : "\nEXPERIMENT 2 FAILED");

    if (!allPassed) {
      process.exitCode = 1;
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nEXPERIMENT 2 FAILED");
  console.error(error);
  process.exitCode = 1;
});
