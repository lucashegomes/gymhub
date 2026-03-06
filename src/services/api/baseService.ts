import type { ApiResponse, PaginatedResponse } from "@/types";

interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export abstract class BaseService<T extends BaseEntity> {
  protected readonly items = new Map<string, T>();

  protected constructor(private readonly searchableFields: (keyof T)[] = []) {}

  protected generateId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  protected normalizeSearchValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.join(" ").toLowerCase();
    }

    if (value === null || value === undefined) {
      return "";
    }

    return String(value).toLowerCase();
  }

  protected buildEntity(payload: Partial<T>): T {
    const now = new Date().toISOString();

    return {
      ...payload,
      id: payload.id ?? this.generateId(),
      createdAt: payload.createdAt ?? now,
      updatedAt: now,
    } as T;
  }

  protected updateEntity(entity: T, changes: Partial<T>): T {
    return {
      ...entity,
      ...changes,
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  async getAll(page = 1, pageSize = 10, search?: string): Promise<PaginatedResponse<T>> {
    const normalizedSearch = search?.trim().toLowerCase();
    const allItems = Array.from(this.items.values());

    const filtered = !normalizedSearch
      ? allItems
      : allItems.filter((item) =>
          this.searchableFields.some((field) =>
            this.normalizeSearchValue(item[field]).includes(normalizedSearch),
          ),
        );

    const start = (page - 1) * pageSize;
    const pagedData = filtered.slice(start, start + pageSize);

    return {
      data: pagedData,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  }

  async getById(id: string): Promise<ApiResponse<T | null>> {
    return {
      data: this.items.get(id) ?? null,
      success: true,
    };
  }

  async create(payload: Partial<T>): Promise<ApiResponse<T | null>> {
    const entity = this.buildEntity(payload);
    this.items.set(entity.id, entity);

    return {
      data: entity,
      success: true,
      message: "Created",
    };
  }

  async update(id: string, payload: Partial<T>): Promise<ApiResponse<T | null>> {
    const current = this.items.get(id);

    if (!current) {
      return {
        data: null,
        success: false,
        message: "Registro não encontrado",
      };
    }

    const updated = this.updateEntity(current, payload);
    this.items.set(id, updated);

    return {
      data: updated,
      success: true,
      message: "Updated",
    };
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const removed = this.items.delete(id);

    return {
      data: null,
      success: removed,
      message: removed ? "Deleted" : "Registro não encontrado",
    };
  }

  exists(id: string): boolean {
    return this.items.has(id);
  }

  clear(): void {
    this.items.clear();
  }

  getSnapshot(): T[] {
    return Array.from(this.items.values());
  }
}
