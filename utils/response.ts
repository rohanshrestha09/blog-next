export const httpResponse = (message: string) => {
  return { message };
};

export const getResponse = <T>(message: string, data: T) => {
  return { data, message };
};

export const getAllResponse = <T>(
  message: string,
  {
    data,
    count,
    currentPage,
    totalPage,
  }: { data: T; count: number; currentPage: number; totalPage: number },
) => {
  return { data: { result: data, count, currentPage, totalPage }, message };
};
