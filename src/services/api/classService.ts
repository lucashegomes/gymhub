import type { Class, ApiResponse, PaginatedResponse } from "@/types";

export const classService = {
  getAll: async (_page = 1, _pageSize = 10): Promise<PaginatedResponse<Class>> => {
    return { data: [], total: 0, page: _page, pageSize: _pageSize, totalPages: 0 };
  },
  getById: async (_id: string): Promise<ApiResponse<Class | null>> => {
    return { data: null, success: true };
  },
  create: async (_data: Partial<Class>): Promise<ApiResponse<Class | null>> => {
    return { data: null, success: true, message: "Created" };
  },
  update: async (_id: string, _data: Partial<Class>): Promise<ApiResponse<Class | null>> => {
    return { data: null, success: true, message: "Updated" };
  },
  delete: async (_id: string): Promise<ApiResponse<null>> => {
    return { data: null, success: true, message: "Deleted" };
  },
};
