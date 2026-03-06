import type { Student, ApiResponse, PaginatedResponse } from "@/types";

// Stub service — replace with httpClient calls when backend is ready

export const studentService = {
  getAll: async (_page = 1, _pageSize = 10): Promise<PaginatedResponse<Student>> => {
    // TODO: return httpClient.get("/students", { page, pageSize })
    return { data: [], total: 0, page: _page, pageSize: _pageSize, totalPages: 0 };
  },

  getById: async (_id: string): Promise<ApiResponse<Student | null>> => {
    return { data: null, success: true };
  },

  create: async (_student: Partial<Student>): Promise<ApiResponse<Student | null>> => {
    return { data: null, success: true, message: "Created" };
  },

  update: async (_id: string, _student: Partial<Student>): Promise<ApiResponse<Student | null>> => {
    return { data: null, success: true, message: "Updated" };
  },

  delete: async (_id: string): Promise<ApiResponse<null>> => {
    return { data: null, success: true, message: "Deleted" };
  },
};
