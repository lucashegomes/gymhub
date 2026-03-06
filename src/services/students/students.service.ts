import type { Student } from './students.types';

export class StudentsService {
  list(): Promise<Student[]> {
    return Promise.resolve([]);
  }
}
