import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const userFields = {
  id: true,
  name: true,
  email: true,
  password: true,
  dateOfBirth: true,
  image: true,
  imageName: true,
  bio: true,
  website: true,
  provider: true,
  isSSO: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

export const exculdeFields = <T>(model: T, fields: (keyof T)[]) => {
  fields.forEach((field) => delete model[field]);

  return model;
};

export { type User } from '@prisma/client';
