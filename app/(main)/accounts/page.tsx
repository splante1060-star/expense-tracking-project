import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import AccountsPageClient from "@/components/accounts/accounts-page-client";

export default async function AccountsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/dashboard");
  }

  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  const serializedAccounts = accounts.map((account) => ({
    ...account,
    balance: account.balance.toNumber(),
  }));

  return <AccountsPageClient accounts={serializedAccounts} />;
}
