import { beforeEach, describe, expect, it } from "vitest";
import { classService, courseService, checkinService, studentService, teacherService } from "./index";

describe("API services", () => {
  beforeEach(() => {
    studentService.clear();
    teacherService.clear();
    courseService.clear();
    classService.clear();
    checkinService.clear();
  });

  it("should validate teacherId when creating a course", async () => {
    const invalidResult = await courseService.create({
      name: "Pilates",
      description: "Pilates solo",
      teacherId: "missing-teacher",
      maxStudents: 15,
      duration: 50,
      status: "active",
    });

    expect(invalidResult.success).toBe(false);

    const teacher = await teacherService.create({
      name: "Marina",
      email: "marina@example.com",
      phone: "11999990000",
      cpf: "12345678901",
      specialties: ["Pilates"],
      status: "active",
      hireDate: "2024-01-10",
    });

    const validResult = await courseService.create({
      name: "Pilates",
      description: "Pilates solo",
      teacherId: teacher.data!.id,
      maxStudents: 15,
      duration: 50,
      status: "active",
    });

    expect(validResult.success).toBe(true);
  });

  it("should validate class relationships and capacity", async () => {
    const teacher = await teacherService.create({
      name: "Carlos",
      email: "carlos@example.com",
      phone: "11998887766",
      cpf: "98765432100",
      specialties: ["Crossfit"],
      status: "active",
      hireDate: "2024-02-20",
    });

    const course = await courseService.create({
      name: "Crossfit",
      description: "Treino funcional",
      teacherId: teacher.data!.id,
      maxStudents: 20,
      duration: 60,
      status: "active",
    });

    const missingTeacher = await classService.create({
      courseId: course.data!.id,
      teacherId: "missing-teacher",
      capacity: 10,
    });

    expect(missingTeacher.success).toBe(false);

    const aboveCapacity = await classService.create({
      courseId: course.data!.id,
      teacherId: teacher.data!.id,
      capacity: 30,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "09:00",
      room: "A1",
      status: "scheduled",
      date: "2025-01-10",
    });

    expect(aboveCapacity.success).toBe(false);

    const validClass = await classService.create({
      courseId: course.data!.id,
      teacherId: teacher.data!.id,
      capacity: 20,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "09:00",
      room: "A1",
      status: "scheduled",
      date: "2025-01-10",
    });

    expect(validClass.success).toBe(true);
  });

  it("should prevent duplicated checkin in the same class", async () => {
    const teacher = await teacherService.create({
      name: "Fernanda",
      email: "fernanda@example.com",
      phone: "11997776655",
      cpf: "45612378900",
      specialties: ["Yoga"],
      status: "active",
      hireDate: "2024-03-14",
    });

    const course = await courseService.create({
      name: "Yoga",
      description: "Aula de yoga",
      teacherId: teacher.data!.id,
      maxStudents: 10,
      duration: 45,
      status: "active",
    });

    const gymClass = await classService.create({
      courseId: course.data!.id,
      teacherId: teacher.data!.id,
      dayOfWeek: 3,
      startTime: "18:00",
      endTime: "18:45",
      room: "B2",
      status: "scheduled",
      date: "2025-02-01",
    });

    const student = await studentService.create({
      name: "João",
      email: "joao@example.com",
      phone: "11996665544",
      cpf: "32165498700",
      birthDate: "1995-05-01",
      plan: "premium",
      status: "active",
      enrollmentDate: "2024-06-01",
    });

    const firstCheckin = await checkinService.create({
      studentId: student.data!.id,
      classId: gymClass.data!.id,
      checkinTime: "2025-02-01T18:00:00.000Z",
      type: "class",
    });

    expect(firstCheckin.success).toBe(true);

    const duplicateCheckin = await checkinService.create({
      studentId: student.data!.id,
      classId: gymClass.data!.id,
      checkinTime: "2025-02-01T18:05:00.000Z",
      type: "class",
    });

    expect(duplicateCheckin.success).toBe(false);
  });
});
