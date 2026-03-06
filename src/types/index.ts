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
  integrationId?: string | null;
  planId?: string;
  planStartDate?: string;
  planEndDate?: string | null;
  guardians?: Array<{
    guardianStudentId: string;
    relationship: string;
  }>;
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
  teacherIds?: string[];
  capacity: number;
  description: string;
}

export interface Class {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  date: string;
  time: string;
  capacity: number;
  schedules?: Array<{
    weekday: number;
    startTime: string;
    endTime: string;
  }>;
}

export interface Checkin {
  id: string;
  studentId: string;
  classId: string;
  courseId?: string;
  checkinTime: string;
  source: CheckinSource;
  studentName?: string;
  courseName?: string;
  className?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  periodicity: "monthly" | "semiannual" | "annual";
  monthlyCheckinLimit: number;
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
