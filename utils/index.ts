export const getPages = ({ skip, take, count }: { skip: number; take: number; count: number }) => {
  return {
    currentPage: skip + 1,
    totalPage: Math.ceil(count / take),
  };
};

export const queryKeys = (key: string) => ({
  all: [key] as const,
  lists: () => [...queryKeys(key).all, 'list'] as const,
  list: (filters: object) => [...queryKeys(key).lists(), filters] as const,
  details: () => [...queryKeys(key).all, 'detail'] as const,
  detail: (id: string | number) => [...queryKeys(key).details(), id] as const,
});
