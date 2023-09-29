import { Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { blogFields, prisma, userFields, exculdeFields, Blog, User } from '.';

const transformBlog = (
  blog: Blog & {
    likedBy?: User[];
    bookmarkedBy?: User[];
  },
) => {
  const hasLiked = !isEmpty(blog.likedBy);

  const hasBookmarked = !isEmpty(blog.bookmarkedBy);

  delete blog.likedBy;

  delete blog.bookmarkedBy;

  return {
    ...blog,
    hasLiked,
    hasBookmarked,
  };
};

export const blogExtensions = {
  async findUniqueWithSession({
    session,
    where,
    select,
  }: {
    session: Session;
    where: Prisma.BlogWhereUniqueInput;
    select?: Prisma.BlogSelect;
  }) {
    const condition = session?.userId ? { where: { id: session.userId } } : false;

    const blog = await prisma.blog.findUnique({
      where,
      select: {
        ...select,
        ...blogFields,
        author: {
          select: exculdeFields(userFields, ['password', 'email']),
        },
        likedBy: condition,
        bookmarkedBy: condition,
        _count: {
          select: {
            likedBy: true,
            comments: true,
          },
        },
      },
    });

    return blog && transformBlog(blog);
  },

  async findManyWithSession({
    session,
    where,
    select,
    skip,
    take,
    orderBy,
  }: {
    session: Session;
    where?: Prisma.BlogWhereInput;
    select?: Prisma.BlogSelect;
    skip?: number;
    take?: number;
    orderBy?:
      | Prisma.BlogOrderByWithRelationAndSearchRelevanceInput
      | Prisma.BlogOrderByWithRelationAndSearchRelevanceInput[];
  }) {
    const condition = session?.userId ? { where: { id: session.userId } } : false;

    const blogs = await prisma.blog.findMany({
      where,
      select: {
        ...select,
        ...blogFields,
        author: {
          select: exculdeFields(userFields, ['password', 'email']),
        },
        likedBy: condition,
        bookmarkedBy: condition,
        _count: {
          select: {
            likedBy: true,
            comments: true,
          },
        },
      },
      skip,
      take,
      orderBy,
    });

    return blogs && blogs.map(transformBlog);
  },
};

export const transformUser = (user: User & { followedBy?: User[]; following?: User[] }) => {
  const followedByViewer = !isEmpty(user.followedBy);

  const followsViewer = !isEmpty(user.following);

  delete user.followedBy;

  delete user.following;

  return {
    ...user,
    followsViewer,
    followedByViewer,
  };
};

export const userExtensions = {
  async findUniqueWithSession({
    session,
    where,
    select,
  }: {
    session: Session;
    where: Prisma.UserWhereUniqueInput;
    select?: Prisma.UserSelect;
  }) {
    const condition = session?.userId ? { where: { id: session.userId } } : false;

    const user = await prisma.user.findUnique({
      where,
      select: {
        ...select,
        ...exculdeFields(userFields, ['password', 'email']),
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

    return user && transformUser(user);
  },

  async findManyWithSession({
    session,
    where,
    select,
    skip,
    take,
    orderBy,
  }: {
    session: Session;
    where?: Prisma.UserWhereInput;
    select?: Prisma.UserSelect;
    skip?: number;
    take?: number;
    orderBy?:
      | Prisma.UserOrderByWithRelationAndSearchRelevanceInput
      | Prisma.UserOrderByWithRelationAndSearchRelevanceInput[];
  }) {
    const condition = session?.userId ? { where: { id: session.userId } } : false;

    const users = await prisma.user.findMany({
      where,
      select: {
        ...select,
        ...exculdeFields(userFields, ['password', 'email']),
        followedBy: condition,
        following: condition,
        _count: {
          select: {
            following: true,
            followedBy: true,
          },
        },
      },
      take,
      skip,
      orderBy,
    });

    return users && users.map(transformUser);
  },
};
