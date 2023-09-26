export const getPages = ({ skip, take, count }: { skip: number; take: number; count: number }) => {
  return {
    currentPage: skip + 1,
    totalPage: Math.ceil(count / take),
  };
};

export const queryKeys = (...keys: string[]) => ({
  all: [...keys] as const,
  lists: () => [...queryKeys(...keys).all, 'list'] as const,
  list: (filters: object) => [...queryKeys(...keys).lists(), filters] as const,
  details: () => [...queryKeys(...keys).all, 'detail'] as const,
  detail: (id: string | number) => [...queryKeys(...keys).details(), id] as const,
});
