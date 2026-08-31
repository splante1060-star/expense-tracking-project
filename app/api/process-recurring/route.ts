import { NextResponse } from "next/server";
import { processRecurringTransactions } from "@/lib/process-recurring";

export async function POST() {
  try {
    const result = await processRecurringTransactions();

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to process recurring transactions:", error);

    return NextResponse.json(
      {
        sucess: false,
        error: "Failed to process recurring transactions",
      },
      { status: 500 },
    );
  }
}
