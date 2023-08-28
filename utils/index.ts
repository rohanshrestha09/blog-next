export const getPages = ({ skip, take, count }: { skip: number; take: number; count: number }) => {
  return {
    currentPage: skip + 1,
    totalPage: Math.ceil(count / take),
  };
};
