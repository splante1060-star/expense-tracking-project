export function paginateActivityResults<T>(records: T[], limit: number) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    throw new Error("Limit must be between 1 and 25");
  }

  const hasMore = records.length > limit;
  const items = records.slice(0, limit);

  return {
    items,
    returnedCount: items.length,
    hasMore,
  };
}
