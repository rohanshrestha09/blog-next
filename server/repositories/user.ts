import { Prisma, PrismaClient } from '@prisma/client';
import { excludeFields, userFields } from 'server/lib/prisma';
import { isEmpty } from 'lodash';
import { User, UserCreate, UserQuery, UserUpdate } from 'server/models/user';
import { IUserQueryBuilder, IUserRepository } from 'server/ports/user';

const sessionSelect = <T>(condition: T) => ({
  ...excludeFields(userFields, [
    'email',
    'password',
    'dateOfBirth',
    'isVerified',
    'isSSO',
    'provider',
  ]),
  followedBy: condition,
  following: condition,
  _count: {
    select: {
      following: true,
      followedBy: true,
    },
  },
});

export const transformUser = (
  user: Partial<User> & { followedBy?: unknown[]; following?: unknown[] },
) => {
  const followedByViewer = !isEmpty(user.followedBy);

  const followsViewer = !isEmpty(user.following);

  delete user.followedBy;

  delete user.following;

  return {
    ...user,
    followsViewer,
    followedByViewer,
  } as User;
};

class UserQueryBuilder implements IUserQueryBuilder {
  constructor(
    private readonly userInstance: PrismaClient['user'],
    private readonly options: Prisma.UserFindManyArgs,
  ) {}

  withPagination(page: number, size: number) {
    this.options.skip = (page - 1) * (size || 20);

    this.options.take = size;

    return this;
  }

  withSort(sort: string, order: 'desc' | 'asc') {
    const countSort = ['followedBy'];

    if (countSort.includes(sort)) {
      this.options.orderBy = {
        [sort]: {
          _count: order,
        },
      };
    } else {
      this.options.orderBy = {
        [sort]: order,
      };
    }

    return this;
  }

  withSearch(search = '') {
    this.options.where = {
      ...this.options.where,
      name: {
        contains: search,
        mode: 'insensitive',
      },
    };

    return this;
  }

  following(userId: string, search = '') {
    this.options.where = {
      ...this.options.where,
      following: {
        some: { id: userId },
      },
      followedBy: search
        ? {
            some: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          }
        : undefined,
    };

    return this;
  }

  followedBy(userId: string, search = '') {
    this.options.where = {
      ...this.options.where,
      followedBy: {
        some: { id: userId },
      },
      following: search
        ? {
            some: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          }
        : undefined,
    };

    return this;
  }

  hasLikedBlog(slug: string): IUserQueryBuilder {
    this.options.where = {
      ...this.options.where,
      likedBlogs: {
        some: { slug },
      },
    };

    return this;
  }

  async execute(sessionId?: string): Promise<[User[], number]> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const count = await this.userInstance.count({
      ...this.options,
      select: true,
      include: undefined as never,
    });

    const data = await this.userInstance.findMany({
      ...this.options,
      select: sessionSelect(condition),
    });

    return [data.map((v) => transformUser(v)), count];
  }
}

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { email } });

    return !!user;
  }

  async findUserByID(id: string, sessionId?: string): Promise<User> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const data = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: sessionSelect(condition),
    });

    return transformUser(data);
  }

  async findSensitiveUserByID(id: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: excludeFields(userFields, ['password']),
    });
  }

  async findUserByEmail(email: string, sessionId?: string): Promise<User> {
    const condition = sessionId ? { where: { id: sessionId }, take: 1 } : false;

    const data = await this.prisma.user.findUniqueOrThrow({
      where: { email },
      select: sessionSelect(condition),
    });

    return transformUser(data);
  }

  async findSensitiveUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { email },
      select: excludeFields(userFields, ['password']),
    });
  }

  async findUserPasswordByEmail(email: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email },
      select: { password: true },
    });

    return user.password;
  }

  findAllUsers(options: UserQuery): IUserQueryBuilder {
    return new UserQueryBuilder(this.prisma.user, { where: options });
  }

  async findRandomUsers(options: UserQuery, size: number): Promise<IUserQueryBuilder> {
    const results = await this.prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM public."User" ORDER BY RANDOM() LIMIT ${size};`,
    );

    const ids = results.map((item) => item.id);

    return new UserQueryBuilder(this.prisma.user, { where: { ...options, id: { in: ids } } });
  }

  async createUser(data: UserCreate): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async updateUserByID(id: string, data: UserUpdate): Promise<void> {
    await this.prisma.user.update({ where: { id }, data });
  }

  async deleteUserByID(
    id: string,
    returning?: Partial<Record<keyof User, boolean>> | undefined,
  ): Promise<User> {
    return await this.prisma.user.delete({ where: { id }, select: returning });
  }

  async addFollower(id: string, followerId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        followedBy: {
          connect: {
            id: followerId,
          },
        },
      },
    });
  }

  async removeFollower(id: string, followerId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        followedBy: {
          disconnect: {
            id: followerId,
          },
        },
      },
    });
  }
}
