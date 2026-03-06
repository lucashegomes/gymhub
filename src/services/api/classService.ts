import type { ApiResponse, Class } from "@/types";
import { BaseService } from "./baseService";
import { courseService } from "./courseService";
import { teacherService } from "./teacherService";

export type ClassPayload = Partial<Class> & { capacity?: number };

export class ClassesService extends BaseService<Class> {
  constructor() {
    super(["room", "date"]);
  }

  override async create(data: ClassPayload): Promise<ApiResponse<Class | null>> {
    if (!data.teacherId || !teacherService.exists(data.teacherId)) {
      return {
        data: null,
        success: false,
        message: "teacherId inválido: professor não encontrado",
      };
    }

    if (!data.courseId || !courseService.exists(data.courseId)) {
      return {
        data: null,
        success: false,
        message: "courseId inválido: curso não encontrado",
      };
    }

    if (data.capacity !== undefined) {
      const courseResponse = await courseService.getById(data.courseId);
      const courseCapacity = courseResponse.data?.maxStudents;

      if (courseCapacity !== undefined && data.capacity > courseCapacity) {
        return {
          data: null,
          success: false,
          message: "capacity inválido: capacidade da aula maior que a do curso",
        };
      }
    }

    return super.create(data);
  }
}

export const classService = new ClassesService();
