import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import {
  processRecurringTransactionsJob,
  processAutoPayBillsJob,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processRecurringTransactionsJob, processAutoPayBillsJob],
});
