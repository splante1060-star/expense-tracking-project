import { inngest } from "./client";
import { processRecurringTransactions } from "@/lib/process-recurring";

export const processRecurringTransactionsJob = inngest.createFunction(
  {
    id: "process-recurring-transactions",
    triggers: {
      cron: "0 10 * * *",
    },
  },
  async ({ step }) => {
    return await step.run("process-recurring-transactions", async () => {
      return processRecurringTransactions();
    });
  },
);
