import { getMonthDateRange } from "@/lib/ai/date-utils";

const testMonths = [
  "2026-11",
  "2026-07",
  "2026-12",
  "2026-13",
  "2026-00",
  "2026-2",
  "November 2026",
];

console.log(
  "Runtime timezone:",
  Intl.DateTimeFormat().resolvedOptions().timeZone,
);

for (const month of testMonths) {
  try {
    const { startDate, endDateExclusive } = getMonthDateRange(month);

    console.log(`\n${month}:`);
    console.log("Start:", startDate.toString());
    console.log("End:", endDateExclusive.toString());
    console.log("Start ISO:", startDate.toISOString());
    console.log("End ISO:", endDateExclusive.toISOString());
  } catch (error) {
    console.log(`\n${month}:`, error instanceof Error ? error.message : error);
  }
}
