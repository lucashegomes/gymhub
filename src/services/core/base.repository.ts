import { storage } from "./storage";

export interface BaseEntity {
  id: string;
}

export class BaseRepository<T extends BaseEntity> {
  constructor(private readonly collectionKey: string) {}

  findAll(): T[] {
    return storage.getCollection<T>(this.collectionKey);
  }

  findById(id: string): T | null {
    const items = this.findAll();
    return items.find((item) => item.id === id) ?? null;
  }

  create(data: T): T {
    const items = this.findAll();
    const updatedItems = [...items, data];

    storage.setCollection(this.collectionKey, updatedItems);

    return data;
  }

  update(id: string, data: Partial<T>): T {
    const items = this.findAll();
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      throw new Error(`Registro com id ${id} não encontrado.`);
    }

    const updatedItem = { ...items[itemIndex], ...data } as T;
    const updatedItems = [...items];
    updatedItems[itemIndex] = updatedItem;

    storage.setCollection(this.collectionKey, updatedItems);

    return updatedItem;
  }

  delete(id: string): void {
    const items = this.findAll();
    const updatedItems = items.filter((item) => item.id !== id);

    storage.setCollection(this.collectionKey, updatedItems);
  }
}
