// ===== Core Entity Types =====

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  plan: string;
  status: "active" | "inactive" | "suspended";
  enrollmentDate: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  specialties: string[];
  status: "active" | "inactive";
  hireDate: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacher?: Teacher;
  maxStudents: number;
  duration: number; // in minutes
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  courseId: string;
  course?: Course;
  teacherId: string;
  teacher?: Teacher;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  status: "scheduled" | "cancelled" | "completed";
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checkin {
  id: string;
  studentId: string;
  student?: Student;
  classId?: string;
  class?: Class;
  checkinTime: string;
  checkoutTime?: string;
  type: "class" | "gym";
  createdAt: string;
}

// ===== API Types =====

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
