import type { Teacher } from './teachers.types';

export class TeachersService {
  list(): Promise<Teacher[]> {
    return Promise.resolve([]);
  }
}
