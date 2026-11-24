import { auth } from "@clerk/nextjs/server";
import { financialTools } from "@/lib/ai/tool-definitions";
import { db } from "@/lib/prisma";

import {
  getMonthlyCategorySpending,
  getUpcomingBills,
  getBudgetStatus,
  getRecentAccountActivity,
} from "@/lib/ai/financial-tools";
import {
  PocketUserNotFoundError,
  resolvePocketUserId,
} from "@/lib/ai/user-context";
import {
  parseMonthlySpendingArguments,
  parseUpcomingBillsArguments,
  parseBudgetStatusArguments,
  parseRecentActivityArguments,
} from "@/lib/ai/tool-validation";

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

    const instructions = `
      You are Pocket AI, a friendly, kind, helpful assistant that helps users
      understand their financial information stored in Pocket.

      Use warm, plain, nonjudgmental language.

      POCKET IS THE SOURCE OF TRUTH:
      Pocket calculates. Pocket AI explains.

      Use Pocket's financial tools to retrieve actual financial information.
      Never invent, estimate, or modify financial amounts, transaction counts,
      dates, balances, or other account information.


      POCKET WEBSITE GUIDANCE:
      Pocket is a web-based personal finance application.
      When explaining how to perform an action manually, refer to Pocket
      as a website rather than a mobile app.

      Use the actual navigation sections available in Pocket, including
      Dashboard, Transactions, Bills, Budget, Goals, Reports, and Accounts.

      You may guide users through manual actions, but never claim to have
      performed an action or changed their financial records.

      Do not invent specific button names, fields, or interface steps
      that have not been verified.


      AVAILABLE READ-ONLY TOOLS:
      1. get_monthly_category_spending
      Retrieve completed expense totals and transaction counts for a specified
      month, optionally filtered by category. Use this for complete monthly
      spending totals rather than summing recent transaction lists.

      2. get_upcoming_bills
      Retrieve active bills and separate overdue bills from upcoming bills.
      Each bill is included only once using its stored due date.
      Do not describe these results as a complete forecast of recurring payments.
      Overdue totals and upcoming totals must be distinguished.

      3. get_budget_status
      Retrieve configured budgets for the current month, including limits,
      completed spending, remaining amounts, and budget statuses.
      Totals include only categories with configured budgets.
      Do not describe these totals as all spending across Pocket.
      A missing budget is not the same as a configured budget with zero spending.

      4. get_recent_account_activity
      Retrieve a limited, newest-first list of completed transactions.
      Use this for individual recent transactions, not complete spending totals.
      If hasMore is true, acknowledge that additional matching transactions exist.
      The isRecurring field refers to the recurring-transaction relationship;
      it does not necessarily identify transactions generated from recurring bills.
      Account-specific filtering is not yet available through the AI interface.


      FINANCIAL RESPONSE ACCURACY:
      Report exact amounts returned by Pocket's tools.
      Do not round away cents or invent supporting calculations.
      Do not invent transactions, budgets, due dates, or account details.
      Do not infer that missing records mean the user has no financial activity
      outside the requested filters or date range.
      Do not claim a result represents all transactions when it is limited.
      If no matching records exist, explain that no matching data was found.
      If a tool cannot answer the question, acknowledge the limitation.
      Do not calculate unsupported totals from partial information.


      DATE HANDLING:
      Interpret "this month" using the current month in America/New_York.
      Use the current date supplied in these instructions.
      For upcoming bills, use a 45-day window when no period is specified.
      For recent activity, default to 30 days and 10 transactions.
      If a requested period is unclear and cannot be reasonably interpreted,
      ask for clarification.

      
      SECURITY AND CAPABILITIES:
      All financial tools are read-only.
      You cannot create, update, or delete financial records.
      You cannot move money, perform transactions, or modify budgets or bills.
      You cannot retrieve live account balances or savings goals using these tools.
      Never claim access to information that the available tools do not provide.
      Do not provide personalized investment recommendations or unsolicited
      financial advice.

      Keep responses concise, normally one or two sentences, while accurately
      explaining the financial results.
      `;

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

    if (functionCalls.length > 3) {
      return Response.json(
        {
          error: "Too many function calls requested",
        },
        { status: 502 },
      );
    }

    let finalResponse = response;

    if (functionCalls.length > 0) {
      const supportedTools = [
        "get_monthly_category_spending",
        "get_upcoming_bills",
        "get_budget_status",
        "get_recent_account_activity",
      ];

      // check every requested function before executing any
      if (functionCalls.some((call) => !supportedTools.includes(call.name))) {
        return Response.json(
          { error: "Unsupported function call" },
          { status: 502 },
        );
      }

      const pocketUserId = await resolvePocketUserId(
        userId,
        async (clerkUserId) => {
          const pocketUser = await db.user.findUnique({
            where: { clerkUserId },
            select: { id: true },
          });

          return pocketUser?.id ?? null;
        },
      );

      const functionOutputs: {
        type: "function_call_output";
        call_id: string;
        output: string;
      }[] = [];

      try {
        for (const call of functionCalls) {
          let result: unknown;

          switch (call.name) {
            case "get_monthly_category_spending": {
              const args = parseMonthlySpendingArguments(call.arguments);

              result = await getMonthlyCategorySpending(args, pocketUserId);
              break;
            }

            case "get_upcoming_bills": {
              const args = parseUpcomingBillsArguments(call.arguments);

              result = await getUpcomingBills(args, pocketUserId);
              break;
            }

            case "get_budget_status": {
              const args = parseBudgetStatusArguments(call.arguments);

              result = await getBudgetStatus(args, pocketUserId);
              break;
            }

            case "get_recent_account_activity": {
              const args = parseRecentActivityArguments(call.arguments);

              result = await getRecentAccountActivity(args, pocketUserId);
              break;
            }

            default:
              throw new Error("Unsupported function call");
          }

          functionOutputs.push({
            type: "function_call_output",
            call_id: call.call_id,
            output: JSON.stringify(result),
          });
        }
      } catch (error) {
        console.error("Pocket AI financial tool failed:", error);

        return Response.json(
          { error: "Unable to complete financial request" },
          { status: 502 },
        );
      }

      // provide all requested calls and their corresponding verified Pocket results to OpenAI
      finalResponse = await client.responses.create({
        model: "gpt-4.1-mini",
        instructions: contextualInstructions,
        input: [...conversation, ...functionCalls, ...functionOutputs],
        tool_choice: "none",
        store: false,
        max_output_tokens: 450,
      });
    }

    const answer = finalResponse.output_text;

    if (!answer) {
      return Response.json({ error: "No response generated" }, { status: 502 });
    }

    return Response.json({ message: answer });
  } catch (error) {
    console.error("Pocket AI request failed:", error);

    if (error instanceof PocketUserNotFoundError) {
      return Response.json({ error: "Pocket user not found" }, { status: 404 });
    }

    return Response.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
