export interface QueryBuilder<T> {
  withPagination(page: number, size: number): QueryBuilder<T>;
  withSort(sort: string, order: 'desc' | 'asc'): QueryBuilder<T>;
  withSearch(search?: string): QueryBuilder<T>;
  execute(): Promise<[T[], number]>;
  executeWithSession(userId?: string): Promise<[T[], number]>;
}
