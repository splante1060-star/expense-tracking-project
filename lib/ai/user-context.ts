export async function resolvePocketUserId(
  clerkUserId: string,
  findUser: (clerkUserId: string) => Promise<string | null>,
): Promise<string> {
  if (!clerkUserId.trim()) {
    throw new Error("Unauthorized");
  }

  const pocketUserId = await findUser(clerkUserId);

  if (!pocketUserId) {
    throw new PocketUserNotFoundError();
  }

  return pocketUserId;
}

export class PocketUserNotFoundError extends Error {
  constructor() {
    super("Pocket user not found");
    this.name = "PocketUserNotFoundError";
  }
}
