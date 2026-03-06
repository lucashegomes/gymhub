import type { ApiResponse, Checkin } from "@/types";
import { BaseService } from "./baseService";
import { classService } from "./classService";
import { studentService } from "./studentService";

export class CheckinsService extends BaseService<Checkin> {
  constructor() {
    super(["type"]);
  }

  override async create(data: Partial<Checkin>): Promise<ApiResponse<Checkin | null>> {
    if (!data.studentId || !studentService.exists(data.studentId)) {
      return {
        data: null,
        success: false,
        message: "studentId inválido: aluno não encontrado",
      };
    }

    if (!data.classId || !classService.exists(data.classId)) {
      return {
        data: null,
        success: false,
        message: "classId inválido: aula não encontrada",
      };
    }

    const duplicate = this.getSnapshot().some(
      (checkin) => checkin.studentId === data.studentId && checkin.classId === data.classId,
    );

    if (duplicate) {
      return {
        data: null,
        success: false,
        message: "Check-in duplicado não permitido para a mesma aula",
      };
    }

    return super.create(data);
  }
}

export const checkinService = new CheckinsService();
