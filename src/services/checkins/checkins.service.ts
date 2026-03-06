import type { Checkin } from './checkins.types';

export class CheckinsService {
  list(): Promise<Checkin[]> {
    return Promise.resolve([]);
  }
}
