import type { Teacher } from "@/types";
import { BaseService } from "./baseService";

export class TeachersService extends BaseService<Teacher> {
  constructor() {
    super(["name", "email", "cpf", "specialties"]);
  }
}

export const teacherService = new TeachersService();
