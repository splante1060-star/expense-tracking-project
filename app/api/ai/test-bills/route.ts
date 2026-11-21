import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";
import { getUpcomingBills } from "@/lib/ai/financial-tools";

export async function GET(request: NextRequest) {
  // This endpoint must never be available in production.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Pocket user not found" },
      { status: 404 },
    );
  }

  const rawWindowDays = request.nextUrl.searchParams.get("windowDays");

  const windowDays = rawWindowDays === null ? 45 : Number(rawWindowDays);

  try {
    const result = await getUpcomingBills({ windowDays }, user.id);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Window must be between 1 and 90 days"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Upcoming bills test error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve bills" },
      { status: 500 },
    );
  }
}
