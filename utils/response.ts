export const httpResponse = <T>(data: T, message: string) => {
  return { data, message }
}
