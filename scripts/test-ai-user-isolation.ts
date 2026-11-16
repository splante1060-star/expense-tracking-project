import { strict as assert } from "node:assert";
import { resolvePocketUserId } from "../lib/ai/user-context";

const mockUsers: Record<string, string> = {
  "clerk-user-a": "pocket-user-a",
  "clerk-user-b": "pocket-user-b",
};

const mockSpending: Record<string, string> = {
  "pocket-user-a": "100.00",
  "pocket-user-b": "500.00",
};

async function findUser(clerkUserId: string) {
  return mockUsers[clerkUserId] ?? null;
}

async function main() {
  const authenticatedClerkId = "clerk-user-a";

  const resolvedPocketId = await resolvePocketUserId(
    authenticatedClerkId,
    findUser,
  );

  const spending = mockSpending[resolvedPocketId];

  assert.equal(resolvedPocketId, "pocket-user-a");
  assert.equal(spending, "100.00");

  console.log("PASS: User A retrieves their own data");

  // A different Pocket user exists, but wasn't selected.
  assert.notEqual(resolvedPocketId, "pocket-user-b");
  assert.notEqual(spending, "500.00");

  console.log("PASS: User B's data is not retrieved");

  await assert.rejects(resolvePocketUserId("", findUser), /Unauthorized/);

  console.log("PASS: Missing authenticated identity rejected");

  await assert.rejects(
    resolvePocketUserId("unknown-user", findUser),
    /Pocket user not found/,
  );

  console.log("PASS: Unknown user rejected");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
