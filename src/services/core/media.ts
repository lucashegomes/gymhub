const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export function resolveApiAssetUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const apiOrigin = API_BASE_URL.replace(/\/api$/, "");
  if (!apiOrigin) return value;
  if (!value.startsWith("/")) return `${apiOrigin}/${value}`;
  return `${apiOrigin}${value}`;
}

