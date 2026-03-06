export type StudentStatus = "active" | "inactive" | "suspended";
export type CheckinSource = "manual" | "wellhub";

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  planType: string;
  status: StudentStatus;
}

export interface Teacher {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  specialty: string;
  pricePerClass: number;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  capacity: number;
  description: string;
}

export interface Class {
  id: string;
  courseId: string;
  teacherId: string;
  date: string;
  time: string;
  capacity: number;
}

export interface Checkin {
  id: string;
  studentId: string;
  classId: string;
  checkinTime: string;
  source: CheckinSource;
}

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
