export abstract class BaseService<TEntity> {
  abstract list(): Promise<TEntity[]>;
}
