import type { ApiResponse, Course } from "@/types";
import { BaseService } from "./baseService";
import { teacherService } from "./teacherService";

export class CoursesService extends BaseService<Course> {
  constructor() {
    super(["name", "description"]);
  }

  override async create(data: Partial<Course>): Promise<ApiResponse<Course | null>> {
    if (!data.teacherId || !teacherService.exists(data.teacherId)) {
      return {
        data: null,
        success: false,
        message: "teacherId inválido: professor não encontrado",
      };
    }

    return super.create(data);
  }
}

export const courseService = new CoursesService();
