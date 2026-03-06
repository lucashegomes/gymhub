export function applySearch<T>(data: T[], search: string, fields: (keyof T)[]): T[] {
  const query = search.trim().toLowerCase();

  if (!query || fields.length === 0) {
    return data;
  }

  return data.filter((item) =>
    fields.some((field) => {
      const value = item[field];

      if (value === null || value === undefined) {
        return false;
      }

      return String(value).toLowerCase().includes(query);
    })
  );
}

export function applySort<T>(data: T[], sortBy?: string, order: "asc" | "desc" = "asc"): T[] {
  if (!sortBy) {
    return data;
  }

  const direction = order === "desc" ? -1 : 1;

  return [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[sortBy];
    const bValue = (b as Record<string, unknown>)[sortBy];

    if (aValue === bValue) {
      return 0;
    }

    if (aValue === null || aValue === undefined) {
      return 1;
    }

    if (bValue === null || bValue === undefined) {
      return -1;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }

    return ((aValue as number) > (bValue as number) ? 1 : -1) * direction;
  });
}

export function applyPagination<T>(data: T[], page = 1, limit = data.length): T[] {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;

  return data.slice(start, start + safeLimit);
}
