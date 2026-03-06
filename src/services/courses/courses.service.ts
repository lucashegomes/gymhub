import type { Course } from './courses.types';

export class CoursesService {
  list(): Promise<Course[]> {
    return Promise.resolve([]);
  }
}
