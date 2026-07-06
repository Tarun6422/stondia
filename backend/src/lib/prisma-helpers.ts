export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function paginationParams(query: {
  page?: string;
  limit?: string;
}): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "12", 10)));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildSearchFilter(search: string | undefined, fields: string[]) {
  if (!search || !search.trim()) return {};
  const term = search.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: "insensitive" as const },
    })),
  };
}
