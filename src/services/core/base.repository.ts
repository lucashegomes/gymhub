export abstract class BaseRepository<TEntity> {
  abstract list(): Promise<TEntity[]>;
}
