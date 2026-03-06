import { useEffect, useMemo, useState } from "react";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useLocalStorageCrud<T extends { id: string }>(storageKey: string) {
  const [items, setItems] = useState<T[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const actions = useMemo(
    () => ({
      create: (payload: Omit<T, "id">) => {
        const newItem = { ...payload, id: createId() } as T;
        setItems((current) => [newItem, ...current]);
        return newItem;
      },
      update: (id: string, payload: Omit<T, "id">) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...payload, id } as T : item)));
      },
      remove: (id: string) => {
        setItems((current) => current.filter((item) => item.id !== id));
      },
    }),
    [],
  );

  return { items, ...actions };
}
