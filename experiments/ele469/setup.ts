import pg from "pg";
import { assertTestDatabase } from "./guard.mjs";
import { randomUUID } from "node:crypto";

export async function verifyTestDatabase() {
  assertTestDatabase();

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
            SELECT current_database(),
                   current_user,
                   inet_server_addr(),
                   inet_server_port()
        `);

    const identity = result.rows[0];

    if (
      identity.current_database !== "ele469_test" ||
      identity.current_user !== "ele469_user" ||
      identity.inet_server_addr !== "127.0.0.1" ||
      Number(identity.inet_server_port) !== 5433
    ) {
      throw new Error("Unexpected database identity.");
    }

    console.log("Experimental database verified.");
  } finally {
    await client.end();
  }
}

export async function initializeTestDatabase() {
  await verifyTestDatabase();

  const { db } = await import("../../lib/prisma");

  return db;
}

type TestDatabase = Awaited<ReturnType<typeof initializeTestDatabase>>;

export async function createTestUser(db: TestDatabase) {
  const identifier = randomUUID();

  return db.user.create({
    data: {
      clerkUserId: `ele469_${identifier}`,
      email: `ele469_${identifier}@example.test`,
      name: "ELE469 Test User",
    },
  });
}

export async function createTestAccount(
  db: TestDatabase,
  userId: string,
  balance: number = 1000,
) {
  return db.account.create({
    data: {
      name: "ELE469 Test Checking",
      type: "DEBIT",
      balance,
      userId,
    },
  });
}

export async function createRecurringExpense(
  db: TestDatabase,
  userId: string,
  accountId: string,
  amount: number = 50,
  scheduledDate: Date = new Date(Date.now() - 60 * 60 * 1000),
) {
  return db.recurringTransaction.create({
    data: {
      type: "EXPENSE",
      amount,
      description: "ELE469 Test Recurring Expense",
      category: "UTILITIES",
      interval: "DAILY",
      nextRecurringDate: scheduledDate,
      isActive: true,
      userId,
      accountId,
    },
  });
}

export async function cleanupTestData(db: TestDatabase, userId: string) {
  await verifyTestDatabase();

  const result = await db.user.deleteMany({
    where: {
      id: userId,
      clerkUserId: {
        startsWith: "ele469_",
      },
      email: {
        endsWith: "@example.test",
      },
    },
  });

  if (result.count !== 1) {
    throw new Error("Expected exactly one test user to be deleted.");
  }

  console.log("Synthetic test data removed.");
}
