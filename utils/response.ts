export const httpResponse = <T>(message: string, data?: T) => {
  return { data, message };
};
