import type { Class, Course, Student, Teacher } from "@/types";

const STORAGE_KEYS = {
  students: "students",
  teachers: "teachers",
  courses: "courses",
  classes: "classes",
} as const;

const now = () => new Date().toISOString();

function buildStudents(): Student[] {
  const timestamp = now();

  return [
    {
      id: "student-1",
      name: "Maria Silva",
      email: "maria.silva@gymhub.com",
      phone: "11999990001",
      cpf: "12345678901",
      birthDate: "1995-03-15",
      plan: "Premium",
      status: "active",
      enrollmentDate: "2025-01-10",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "student-2",
      name: "João Santos",
      email: "joao.santos@gymhub.com",
      phone: "11999990002",
      cpf: "12345678902",
      birthDate: "1990-07-22",
      plan: "Básico",
      status: "active",
      enrollmentDate: "2025-02-05",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "student-3",
      name: "Ana Costa",
      email: "ana.costa@gymhub.com",
      phone: "11999990003",
      cpf: "12345678903",
      birthDate: "1988-11-30",
      plan: "Premium",
      status: "inactive",
      enrollmentDate: "2024-06-20",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "student-4",
      name: "Pedro Lima",
      email: "pedro.lima@gymhub.com",
      phone: "11999990004",
      cpf: "12345678904",
      birthDate: "2000-01-05",
      plan: "Básico",
      status: "suspended",
      enrollmentDate: "2025-03-01",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "student-5",
      name: "Carla Menezes",
      email: "carla.menezes@gymhub.com",
      phone: "11999990005",
      cpf: "12345678905",
      birthDate: "1997-09-14",
      plan: "Premium",
      status: "active",
      enrollmentDate: "2025-01-25",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function buildTeachers(): Teacher[] {
  const timestamp = now();

  return [
    {
      id: "teacher-1",
      name: "Ricardo Almeida",
      email: "ricardo.almeida@gymhub.com",
      phone: "11988880001",
      cpf: "98765432101",
      specialties: ["Musculação", "Hipertrofia"],
      status: "active",
      hireDate: "2022-03-10",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "teacher-2",
      name: "Fernanda Souza",
      email: "fernanda.souza@gymhub.com",
      phone: "11988880002",
      cpf: "98765432102",
      specialties: ["Funcional", "Pilates"],
      status: "active",
      hireDate: "2021-09-01",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "teacher-3",
      name: "Bruno Carvalho",
      email: "bruno.carvalho@gymhub.com",
      phone: "11988880003",
      cpf: "98765432103",
      specialties: ["Cross Training", "Condicionamento"],
      status: "inactive",
      hireDate: "2020-01-15",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function buildCourses(): Course[] {
  const timestamp = now();

  return [
    {
      id: "course-1",
      name: "Musculação Iniciante",
      description: "Treino de adaptação para novos alunos.",
      teacherId: "teacher-1",
      maxStudents: 20,
      duration: 60,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "course-2",
      name: "Funcional HIIT",
      description: "Treinos intervalados de alta intensidade.",
      teacherId: "teacher-2",
      maxStudents: 15,
      duration: 45,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "course-3",
      name: "Pilates Solo",
      description: "Aulas de pilates para fortalecimento e mobilidade.",
      teacherId: "teacher-2",
      maxStudents: 12,
      duration: 50,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "course-4",
      name: "Cross Training",
      description: "Circuitos intensos para condicionamento físico.",
      teacherId: "teacher-3",
      maxStudents: 18,
      duration: 55,
      status: "inactive",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function buildClasses(): Class[] {
  const timestamp = now();

  return [
    {
      id: "class-1",
      courseId: "course-1",
      teacherId: "teacher-1",
      dayOfWeek: 1,
      startTime: "07:00",
      endTime: "08:00",
      room: "Sala A",
      status: "scheduled",
      date: "2026-04-06",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "class-2",
      courseId: "course-1",
      teacherId: "teacher-1",
      dayOfWeek: 3,
      startTime: "19:00",
      endTime: "20:00",
      room: "Sala A",
      status: "scheduled",
      date: "2026-04-08",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "class-3",
      courseId: "course-2",
      teacherId: "teacher-2",
      dayOfWeek: 2,
      startTime: "18:00",
      endTime: "18:45",
      room: "Sala B",
      status: "scheduled",
      date: "2026-04-07",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "class-4",
      courseId: "course-2",
      teacherId: "teacher-2",
      dayOfWeek: 4,
      startTime: "07:30",
      endTime: "08:15",
      room: "Sala B",
      status: "scheduled",
      date: "2026-04-09",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "class-5",
      courseId: "course-3",
      teacherId: "teacher-2",
      dayOfWeek: 5,
      startTime: "10:00",
      endTime: "10:50",
      room: "Studio 1",
      status: "scheduled",
      date: "2026-04-10",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "class-6",
      courseId: "course-4",
      teacherId: "teacher-3",
      dayOfWeek: 6,
      startTime: "09:00",
      endTime: "09:55",
      room: "Box",
      status: "cancelled",
      date: "2026-04-11",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

export function seedInitialData(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  if (window.localStorage.length > 0) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(buildStudents()));
  window.localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(buildTeachers()));
  window.localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(buildCourses()));
  window.localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(buildClasses()));
}

export { STORAGE_KEYS };
