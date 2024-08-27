export const jwtConfig = {
  secretKey: process.env.JWT_TOKEN as string,
  expiresIn: '30d',
};
