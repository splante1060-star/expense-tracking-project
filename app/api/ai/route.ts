import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OpenAI API key is not configured" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const message = body?.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 1000
    ) {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }
    const client = new OpenAI();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are Pocket AI, a friendly, kind, helpful assistant that helps users understand " +
        "their financial information stored in Pocket. " +
        "Use warm, plain, nonjudgmental language. " +
        "Your purpose is to explain spending, upcoming bills, balance changes, " +
        "category totals, and activity since the user's last visit. " +
        "Pocket remains the source of truth for balances, transactions, dates, " +
        "and calculations. Explain only facts supported by data returned by Pocket. " +
        "If information is missing or unavailable, say so rather than guessing. " +
        "Your financial tools are not connected yet. When introducing yourself, " +
        "clearly state that you cannot currently retrieve the user's Pocket records. " +
        "Future financial tools will be read-only: you cannot modify records " +
        "or move money. " +
        "When describing future data access, explain that approved read-only " +
        "tools will retrieve relevant Pocket records; do not imply users must " +
        "manually provide them." +
        "Do not offer unsolicited financial tips, recommend financial decisions, " +
        "or provide personalized investment recommendations. " +
        "Describe your role through concrete examples such as explaining " +
        "monthly spending or listing upcoming bills, rather than broad promises. " +
        "Keep your response to two sentences.",
      input: message.trim(),
      store: false,
      max_output_tokens: 100,
    });

    if (
      typeof response.output_text !== "string" ||
      !response.output_text.trim()
    ) {
      return Response.json(
        { error: "No assistant response generated" },
        { status: 502 },
      );
    }

    return Response.json({
      message: response.output_text,
    });
  } catch (error) {
    console.error(
      "Pocket AI request failed:",
      error instanceof Error ? error.name : "Unknown error",
    );

    return Response.json(
      { error: "Unable to generate a response" },
      { status: 500 },
    );
  }
}
