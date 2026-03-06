export interface BaseEntity {
  id: string;
}

export interface QueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BaseRepository<T extends BaseEntity> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}

export const mockDelay = async (delayMs = 200): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

export abstract class BaseService<T extends BaseEntity> {
  protected constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly searchableFields: (keyof T)[]
  ) {}

  async getAll(params?: QueryParams): Promise<PaginatedResult<T>> {
    await mockDelay();

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;

    let items = await this.repository.getAll();
    items = this.applySearch(items, params?.search);
    items = this.applySort(items, params?.sortBy, params?.sortOrder ?? "asc");

    const { data, total, totalPages } = this.applyPagination(items, page, pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id: string): Promise<T | null> {
    await mockDelay();
    return this.repository.getById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    await mockDelay();
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await mockDelay();

    const updatedItem = await this.repository.update(id, data);

    if (!updatedItem) {
      throw new Error(`Entity with id ${id} not found`);
    }

    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    await mockDelay();
    await this.repository.delete(id);
  }

  protected applySearch(items: T[], search?: string): T[] {
    if (!search?.trim()) {
      return items;
    }

    const normalizedSearch = search.toLowerCase();

    return items.filter((item) =>
      this.searchableFields.some((field) => {
        const value = item[field];

        if (value === null || value === undefined) {
          return false;
        }

        return String(value).toLowerCase().includes(normalizedSearch);
      })
    );
  }

  protected applySort(items: T[], sortBy?: string, sortOrder: "asc" | "desc" = "asc"): T[] {
    if (!sortBy) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = a[sortBy as keyof T];
      const bValue = b[sortBy as keyof T];

      if (aValue === bValue) {
        return 0;
      }

      if (aValue === undefined || aValue === null) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (bValue === undefined || bValue === null) {
        return sortOrder === "asc" ? 1 : -1;
      }

      const compareResult = String(aValue).localeCompare(String(bValue), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      return sortOrder === "asc" ? compareResult : -compareResult;
    });
  }

  protected applyPagination(
    items: T[],
    page = 1,
    pageSize = 10
  ): Pick<PaginatedResult<T>, "data" | "total" | "totalPages"> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const total = items.length;
    const totalPages = Math.ceil(total / safePageSize) || 1;
    const startIndex = (safePage - 1) * safePageSize;
    const endIndex = startIndex + safePageSize;

    return {
      data: items.slice(startIndex, endIndex),
      total,
      totalPages,
    };
  }
}
