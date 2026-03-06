export const COLLECTION_KEYS = {
  students: "students",
  teachers: "teachers",
  courses: "courses",
  classes: "classes",
  checkins: "checkins",
} as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[keyof typeof COLLECTION_KEYS];

export function getCollection<T>(key: string): T[] {
  const collection = localStorage.getItem(key);

  if (!collection) {
    return [];
  }

  return JSON.parse(collection) as T[];
}

export function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function clearCollection(key: string): void {
  localStorage.removeItem(key);
}
