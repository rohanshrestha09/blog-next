import { Blog, Prisma, PrismaClient, User } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const generateFields = <
  T extends Prisma.UserFieldRefs | Prisma.BlogFieldRefs,
  V extends User | Blog,
>(
  fields: T,
) => {
  return Object.values(fields)
    .map((k) => ({ [k.name as keyof V]: true }))
    .reduce((initial, curr) => ({ ...initial, ...curr })) as { [x in keyof V]: boolean };
};

export const userFields = generateFields<Prisma.UserFieldRefs, User>(prisma.user.fields);

export const blogFields = generateFields<Prisma.BlogFieldRefs, Blog>(prisma.blog.fields);

export const exculdeFields = <T>(model: T, fields: (keyof T)[]) => {
  fields.forEach((field) => delete model[field]);

  return model;
};

export { type User, Provider } from '@prisma/client';
