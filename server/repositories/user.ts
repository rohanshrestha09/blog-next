import { Prisma } from '@prisma/client';
import { prisma } from 'lib/prisma';
import { isEmpty } from 'lodash';
import { User, UserCreate, UserUpdate } from 'server/models/user';
import { IUserQueryBuilder, IUserRepository } from 'server/ports/user';

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
    private readonly userInstance: typeof prisma.user,
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
      followedBy: {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    };

    return this;
  }

  followedBy(userId: string, search = '') {
    this.options.where = {
      ...this.options.where,
      followedBy: {
        some: { id: userId },
      },
      following: {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    };

    return this;
  }

  async execute(): Promise<[User[], number]> {
    const data = await this.userInstance.findMany({ ...this.options });

    const count = await this.userInstance.count({ ...this.options, select: true });

    return [data, count];
  }

  async executeWithSession(userId?: string): Promise<[User[], number]> {
    const condition = userId ? { where: { id: userId }, take: 1 } : false;

    const count = await this.userInstance.count({ ...this.options, select: true });

    const data = await this.userInstance.findMany({
      ...this.options,
      select: {
        id: true,
        name: true,
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
        followedBy: condition,
        following: condition,
        _count: {
          select: {
            following: true,
            followedBy: true,
          },
        },
      },
    });

    return [data.map((v) => transformUser(v)), count];
  }
}

export class UserRepository implements IUserRepository {
  async findUserByID(id: string): Promise<User> {
    return await prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await prisma.user.findUniqueOrThrow({ where: { email } });
  }

  async findUserPasswordByEmail(email: string): Promise<string> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { password: true },
    });

    return user.password;
  }

  findAllUsers(options: Partial<User>): IUserQueryBuilder {
    return new UserQueryBuilder(prisma.user, {});
  }

  async createUser(data: UserCreate): Promise<User> {
    return await prisma.user.create({ data });
  }

  async updateUserByID(id: string, data: UserUpdate): Promise<void> {
    await prisma.user.update({ where: { id }, data });
  }

  async deleteUserByID(
    id: string,
    returning?: Partial<Record<keyof User, boolean>> | undefined,
  ): Promise<User> {
    return await prisma.user.delete({ where: { id }, select: returning });
  }
}
