import type { Checkin, ApiResponse, PaginatedResponse } from "@/types";

export const checkinService = {
  getAll: async (_page = 1, _pageSize = 10): Promise<PaginatedResponse<Checkin>> => {
    return { data: [], total: 0, page: _page, pageSize: _pageSize, totalPages: 0 };
  },
  getById: async (_id: string): Promise<ApiResponse<Checkin | null>> => {
    return { data: null, success: true };
  },
  create: async (_data: Partial<Checkin>): Promise<ApiResponse<Checkin | null>> => {
    return { data: null, success: true, message: "Created" };
  },
  delete: async (_id: string): Promise<ApiResponse<null>> => {
    return { data: null, success: true, message: "Deleted" };
  },
};
