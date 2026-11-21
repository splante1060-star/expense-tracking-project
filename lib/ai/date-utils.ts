export function getMonthDateRange(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Invalid month format. Expected YYYY-MM");
  }

  const [year, monthNumber] = month.split("-").map(Number);

  if (year < 100 || year > 9998) {
    throw new Error("Invalid year");
  }

  const startDate = new Date(year, monthNumber - 1, 1);
  const endDateExclusive = new Date(year, monthNumber, 1);

  return {
    startDate,
    endDateExclusive,
  };
}

const BILL_TIMEZONE = "America/New_York";

export function getEasternDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BILL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine Eastern date");
  }

  return `${year}-${month}-${day}`;
}

export function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

export function classifyBillDueDate(
  dueDate: string,
  asOfDate: string,
  windowDays: number,
): "overdue" | "today" | "upcoming" | null {
  const lastUpcomingDate = addCalendarDays(asOfDate, windowDays);

  if (dueDate > lastUpcomingDate) {
    return null;
  }

  if (dueDate < asOfDate) {
    return "overdue";
  }

  if (dueDate === asOfDate) {
    return "today";
  }

  return "upcoming";
}
