import { useCallback, useEffect, useMemo, useState } from "react";

const RESOURCE_BY_KEY: Record<string, string> = {
  "gymhub:students": "students",
  "gymhub:teachers": "teachers",
  "gymhub:courses": "courses",
  "gymhub:classes": "classes",
  "gymhub:checkins": "checkins",
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function resolveResource(storageKey: string): string {
  const resource = RESOURCE_BY_KEY[storageKey];

  if (!resource) {
    throw new Error(`Resource not mapped for storageKey: ${storageKey}`);
  }

  return resource;
}

function normalizePayload(storageKey: string, payload: Record<string, unknown>) {
  if (storageKey !== "gymhub:checkins") {
    return payload;
  }

  const value = payload.checkinTime;
  if (typeof value !== "string" || value.trim() === "") {
    return payload;
  }

  // HTML datetime-local returns local time without timezone.
  // Convert to ISO so API persists consistent timestamp.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return payload;
  }

  return {
    ...payload,
    checkinTime: date.toISOString(),
  };
}

export function useLocalStorageCrud<T extends { id: string }>(storageKey: string) {
  const [items, setItems] = useState<T[]>([]);
  const resource = resolveResource(storageKey);

  const refresh = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/${resource}?page=1&pageSize=1000`);

    if (!response.ok) {
      throw new Error(`Failed to load ${resource}: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { data: T[] };
    setItems(payload.data || []);
  }, [resource]);

  useEffect(() => {
    refresh().catch((error) => {
      console.error(error);
      setItems([]);
    });
  }, [refresh]);

  const actions = useMemo(
    () => ({
      create: async (payload: Omit<T, "id">) => {
        try {
          const body = normalizePayload(storageKey, payload as Record<string, unknown>);

          const response = await fetch(`${API_BASE_URL}/${resource}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`Failed to create ${resource}: HTTP ${response.status}`);
          }

          const result = (await response.json()) as { data: T };
          setItems((current) => [result.data, ...current]);
          return result.data;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
      update: async (id: string, payload: Omit<T, "id">) => {
        try {
          const body = normalizePayload(storageKey, payload as Record<string, unknown>);

          const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`Failed to update ${resource}: HTTP ${response.status}`);
          }

          const result = (await response.json()) as { data: T };
          setItems((current) => current.map((item) => (item.id === id ? result.data : item)));
          return result.data;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
      remove: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`Failed to delete ${resource}: HTTP ${response.status}`);
          }

          setItems((current) => current.filter((item) => item.id !== id));
        } catch (error) {
          console.error(error);
        }
      },
    }),
    [resource, storageKey],
  );

  return { items, ...actions, refresh };
}
