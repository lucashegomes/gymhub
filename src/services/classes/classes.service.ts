import type { ClassItem } from './classes.types';

export class ClassesService {
  list(): Promise<ClassItem[]> {
    return Promise.resolve([]);
  }
}
