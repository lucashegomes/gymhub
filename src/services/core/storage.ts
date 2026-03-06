const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const storage = {
  getCollection<T>(collectionKey: string): T[] {
    if (!isBrowser) {
      return [];
    }

    const rawCollection = window.localStorage.getItem(collectionKey);

    if (!rawCollection) {
      return [];
    }

    try {
      const parsedCollection = JSON.parse(rawCollection);
      return Array.isArray(parsedCollection) ? parsedCollection : [];
    } catch {
      return [];
    }
  },

  setCollection<T>(collectionKey: string, items: T[]): void {
    if (!isBrowser) {
      return;
    }

    window.localStorage.setItem(collectionKey, JSON.stringify(items));
  },
};
