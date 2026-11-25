import assert from "node:assert/strict";
import {
  initializeTestDatabase,
  createTestUser,
  createTestAccount,
  createRecurringExpense,
  cleanupTestData,
} from "./setup";

async function main() {
  const db = await initializeTestDatabase();
  let userId: string | undefined;

  try {
    // Confirm a clean experimental environment.
    assert.equal(await db.user.count(), 0);

    // Create synthetic test data.
    const user = await createTestUser(db);
    userId = user.id;

    const account = await createTestAccount(db, user.id);

    const recurring = await createRecurringExpense(db, user.id, account.id);

    // Calculate the expected next scheduled date.
    const expectedNextDate = new Date(recurring.nextRecurringDate);

    expectedNextDate.setDate(expectedNextDate.getDate() + 1);

    console.log("\n--- Baseline Test: Initial State ---");

    console.table({
      accountBalance: account.balance.toNumber(),
      recurringAmount: recurring.amount.toNumber(),
      scheduledDate: recurring.nextRecurringDate.toISOString(),
      transactionCount: await db.transaction.count(),
    });

    // Import Pocket's existing processor after verification.
    const { processRecurringTransactions } =
      await import("../../lib/process-recurring");

    // Execute the processor.
    const result = await processRecurringTransactions();

    // Retrieve the persisted database state.
    const updatedAccount = await db.account.findUniqueOrThrow({
      where: { id: account.id },
    });

    const updatedRecurring = await db.recurringTransaction.findUniqueOrThrow({
      where: { id: recurring.id },
    });

    const transactions = await db.transaction.findMany({
      where: { recurringTransactionId: recurring.id },
    });

    console.log("\n--- Baseline Test: Final State ---");

    console.table({
      seriesProcessed: result.seriesProcessed,
      occurrencesCreated: result.occurrencesCreated,
      accountBalance: updatedAccount.balance.toNumber(),
      transactionCount: transactions.length,
      nextRecurringDate: updatedRecurring.nextRecurringDate.toISOString(),
      lastProcessed: updatedRecurring.lastProcessed?.toISOString(),
    });

    // Verify processor results.
    assert.equal(result.seriesProcessed, 1);
    assert.equal(result.occurrencesCreated, 1);

    // Verify financial consistency.
    assert.equal(transactions.length, 1);
    assert.equal(updatedAccount.balance.toNumber(), 950);
    assert.equal(transactions[0].amount.toNumber(), 50);
    assert.equal(transactions[0].type, "EXPENSE");
    assert.equal(transactions[0].status, "COMPLETED");

    // Verify transaction scheduling.
    assert.equal(
      transactions[0].scheduledFor?.getTime(),
      recurring.nextRecurringDate.getTime(),
    );

    assert.equal(
      transactions[0].date.getTime(),
      recurring.nextRecurringDate.getTime(),
    );

    // Verify recurring schedule advancement.
    assert.equal(
      updatedRecurring.lastProcessed?.getTime(),
      recurring.nextRecurringDate.getTime(),
    );

    assert.equal(
      updatedRecurring.nextRecurringDate.getTime(),
      expectedNextDate.getTime(),
    );

    console.log("\nBASELINE TEST PASSED");
  } finally {
    try {
      if (userId) {
        await cleanupTestData(db, userId);
      }
    } finally {
      await db.$disconnect();
    }
  }
}

main().catch((error) => {
  console.error("\nBASELINE TEST FAILED");
  console.error(error);
  process.exitCode = 1;
});
