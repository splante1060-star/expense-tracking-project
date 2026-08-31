import { RecurringInterval } from "./generated/prisma/enums";

export function getNextRecurringDate(date: Date, interval: RecurringInterval) {
  const nextDate = new Date(date);

  switch (interval) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      return nextDate;
    case "MONTHLY":
      return addMonthsSafely(nextDate, 1);
    case "YEARLY":
      return addYearsSafely(nextDate, 1);
  }
}

function addMonthsSafely(date: Date, months: number) {
  const originalDay = date.getDate();

  const result = new Date(date);

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

function addYearsSafely(date: Date, years: number) {
  const originalMonth = date.getMonth();
  const originalDay = date.getDate();

  const result = new Date(date);

  result.setDate(1);
  result.setFullYear(result.getFullYear() + years);
  result.setMonth(originalMonth);

  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    originalMonth + 1,
    0,
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}
