import { Blog, Comment, Notification, Prisma, PrismaClient, User } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const generateFields = <
  T extends
    | Prisma.UserFieldRefs
    | Prisma.BlogFieldRefs
    | Prisma.CommentFieldRefs
    | Prisma.NotificationFieldRefs,
  V extends User | Blog | Comment | Notification,
>(
  fields: T,
) => {
  return Object.values(fields)
    .map((k) => ({ [k.name as keyof V]: true }))
    .reduce((initial, curr) => ({ ...initial, ...curr })) as Record<keyof V, boolean>;
};

export const userFields = generateFields<Prisma.UserFieldRefs, User>(prisma.user.fields);

export const blogFields = generateFields<Prisma.BlogFieldRefs, Blog>(prisma.blog.fields);

export const commentFields = generateFields<Prisma.CommentFieldRefs, Comment>(
  prisma.comment.fields,
);

export const notificationFields = generateFields<Prisma.NotificationFieldRefs, Notification>(
  prisma.notification.fields,
);

export const selectFields = <T extends Record<string, unknown>>(model: T, fields: (keyof T)[]) => {
  const modifiedFields = { ...model };

  Object.keys(modifiedFields).forEach((key) => {
    if (!fields.includes(key)) delete modifiedFields[key];
  });

  return modifiedFields;
};

export const excludeFields = <T>(model: T, fields: (keyof T)[]) => {
  const modifiedFields = { ...model };

  fields.forEach((field) => delete modifiedFields[field]);

  return modifiedFields;
};
