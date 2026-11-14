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
