import type { Student } from "@/types";
import { BaseService } from "./baseService";

export class StudentsService extends BaseService<Student> {
  constructor() {
    super(["name", "email", "cpf", "phone"]);
  }
}

export const studentService = new StudentsService();
