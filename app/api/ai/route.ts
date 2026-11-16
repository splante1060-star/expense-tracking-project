import { auth } from "@clerk/nextjs/server";
import { financialTools } from "@/lib/ai/tool-definitions";
import { db } from "@/lib/prisma";
import { getMonthlyCategorySpending } from "@/lib/ai/financial-tools";
import { CategoryType } from "@/lib/generated/prisma/enums";

import OpenAI from "openai";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

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
    const messages = body?.messages;

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 10 ||
      !messages.every(
        (message) =>
          message !== null &&
          typeof message === "object" &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0 &&
          message.content.length <= 1000,
      ) ||
      messages[messages.length - 1].role !== "user"
    ) {
      return Response.json(
        { error: "Invalid conversation history" },
        { status: 400 },
      );
    }

    const conversation: ConversationMessage[] = messages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

    const client = new OpenAI();

    const instructions =
      "You are Pocket AI, a friendly, kind, helpful assistant that helps users understand " +
      "their financial information stored in Pocket. " +
      "Use warm, plain, nonjudgmental language. " +
      "Pocket is the source of truth for financial records, dates, and calculations. " +
      "You have access to one read-only financial tool: get_monthly_category_spending. " +
      "This tool retrieves completed expense totals and transaction counts for a specified month, " +
      "optionally filtered by category. " +
      "When a user asks about their actual monthly spending, use the tool to retrieve the data. " +
      "For a question about overall spending, set category to null. " +
      "For category-specific spending, use the appropriate category. " +
      "Never invent financial amounts, transaction counts, or other account information. " +
      "Only report financial values supported by the tool result. " +
      "If the user does not specify a month, interpret 'this month' using the current month " +
      "in America/New_York. If the requested period is unclear, ask for clarification. " +
      "Do not assume the user has transactions for a requested month. " +
      "You cannot currently retrieve account balances, upcoming bills, individual transactions, " +
      "budgets, savings goals, or other financial details outside the available tool. " +
      "If asked for unavailable information, explain the limitation without guessing. " +
      "Your tools are strictly read-only. You cannot create, update, or delete financial records, " +
      "move money, or perform transactions. " +
      "Do not offer unsolicited financial tips, recommend financial decisions, " +
      "or provide personalized investment recommendations. " +
      "When introducing yourself, explain that you can answer questions about monthly spending " +
      "using Pocket's records. Do not claim access to unsupported features. " +
      "Keep responses concise, usually one or two sentences.";

    const currentEasternDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const contextualInstructions =
      instructions +
      ` Current date in America/New_York: ${currentEasternDate}.`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: contextualInstructions,
      input: conversation,
      tools: financialTools,
      store: false,
      max_output_tokens: 300,
    });

    const functionCalls = response.output.filter(
      (item) => item.type === "function_call",
    );

    if (functionCalls.length > 1) {
      return Response.json(
        {
          error: "Too many function calls requested",
        },
        { status: 502 },
      );
    }

    let finalResponse = response;

    if (functionCalls.length === 1) {
      const call = functionCalls[0];

      // only execute functions explicitly approved by Pocket
      if (call.name !== "get_monthly_category_spending") {
        return Response.json(
          { error: "Unsupported function call" },
          { status: 502 },
        );
      }

      // parse and validate model-generated arguments
      let args: unknown;

      try {
        args = JSON.parse(call.arguments);
      } catch {
        return Response.json(
          { error: "invalid function arguments" },
          { status: 502 },
        );
      }

      if (
        typeof args !== "object" ||
        args === null ||
        Array.isArray(args) ||
        !("month" in args) ||
        typeof args.month !== "string" ||
        !("category" in args) ||
        !(
          args.category === null ||
          (typeof args.category === "string" &&
            Object.values(CategoryType).includes(args.category as CategoryType))
        ) ||
        Object.keys(args).some((key) => key !== "month" && key !== "category")
      ) {
        return Response.json(
          { error: "Invalid function arguments" },
          { status: 502 },
        );
      }

      // resolve the Pocket user from the authenticated Clerk session
      // userId comes from the existing auth() call above
      const pocketUser = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });

      if (!pocketUser) {
        return Response.json(
          { error: "Pocket user not found" },
          { status: 404 },
        );
      }

      // Pocket calculates the spending total
      const result = await getMonthlyCategorySpending(
        {
          month: args.month,
          category: args.category as CategoryType | null,
        },
        pocketUser.id,
      );

      // send verified result back for a final explanation
      finalResponse = await client.responses.create({
        model: "gpt-4.1-mini",
        instructions: contextualInstructions,
        input: [
          ...conversation,
          call,
          {
            type: "function_call_output",
            call_id: call.call_id,
            output: JSON.stringify(result),
          },
        ],
        tool_choice: "none",
        store: false,
        max_output_tokens: 300,
      });
    }

    const answer = finalResponse.output_text;

    if (!answer) {
      return Response.json({ error: "No response generated" }, { status: 502 });
    }

    return Response.json({ message: answer });
  } catch (error) {
    console.error("Pocket AI request failed:", error);

    return Response.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
