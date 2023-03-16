import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';

export interface IUserSchema {
  fullname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  provider: {
    type: string;
    enum: {
      values: String[];
      message: string;
    };
  };
  isSSO: boolean;
  isVerified: boolean;
  image: string;
  imageName: string;
  bio: string;
  website: string;
  followingCount: number;
  followerCount: number;
  followsViewer: boolean;
  followedByViewer: boolean;
}

export interface IUserFollowSchema {
  user: Types.ObjectId;
  follows: Types.ObjectId;
}

export interface IBlogSchema {
  author: Types.ObjectId;
  image: string;
  imageName: string;
  title: string;
  content: string;
  genre: {
    type: StringConstructor[];
    required: [true, string];
    validate: [(val: any) => boolean, string];
    enum: { values: String[]; message: string };
  };
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
}

export interface IBlogLikeSchema {
  user: Types.ObjectId;
  likes: Types.ObjectId;
}

export interface IBlogBookmarkSchema {
  user: Types.ObjectId;
  bookmarks: Types.ObjectId;
}

export interface ICommentSchema {
  blog: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  likeCount: number;
  hasLiked: boolean;
}

export interface ICommentLikeSchema {
  user: Types.ObjectId;
  likes: Types.ObjectId;
}

export interface INotificationSchema {
  type: {
    type: StringConstructor;
    required: [true, string];
    enum: { values: String[]; message: string };
  };
  user: Types.ObjectId;
  listener: Types.ObjectId[];
  blog: Types.ObjectId;
  comment: Types.ObjectId;
  description: string;
  status: {
    type: StringConstructor;
    enum: { values: String[]; message: string };
    default: NOTIFICATION_STATUS.UNREAD;
  };
}

export interface IUserModel extends Model<IUserSchema> {
  findUnique({
    _id,
    viewer,
    exclude,
  }: {
    _id: string;
    viewer?: string;
    exclude?: string[];
  }): Promise<IUserSchema>;

  findMany(
    {
      match,
      viewer,
      search,
      exclude,
      limit,
      sample,
    }: {
      match?: FilterQuery<any>;
      viewer?: string;
      search?: unknown;
      exclude?: string[];
      limit?: number;
      sample?: boolean;
    },
    ...rest: PipelineStage[]
  ): Promise<{ data: IUserSchema[]; count: number }>;

  findFollowers(
    {
      user,
      viewer,
      search,
      exclude,
      limit,
    }: {
      user?: string;
      search?: unknown;
      viewer?: string;
      exclude?: string[];
      limit?: number;
      sample?: boolean;
    },
    field: 'followers' | 'followings'
  ): Promise<{ data: IUserSchema[]; count: number }>;

  findFollowingBlogs({
    user,
    viewer,
    exclude,
    limit,
    sort,
  }: {
    user?: string;
    viewer?: string;
    exclude?: string[];
    limit?: number;
    sort: { field: string; order: 1 | -1 };
  }): Promise<{ data: IBlogSchema[]; count: number }>;

  findBookmarks({
    match,
    user,
    viewer,
    exclude,
    search,
    limit,
  }: {
    match: FilterQuery<any>;
    user?: string;
    viewer?: string;
    exclude?: string[];
    search?: unknown;
    limit?: number;
  }): Promise<{ data: IBlogSchema[]; count: number }>;
}

export interface ICommentModel extends Model<ICommentSchema> {
  findMany({
    match,
    viewer,
    limit,
    exclude,
  }: {
    match?: FilterQuery<any>;
    viewer?: string;
    limit?: number;
    exclude?: string[];
  }): Promise<{ data: ICommentSchema[]; count: number }>;
}

export interface IBlogModel extends Model<IBlogSchema> {
  findUnique({
    _id,
    viewer,
    exclude,
  }: {
    _id: string;
    viewer?: string;
    exclude?: string[];
  }): Promise<IBlogSchema>;
  findMany(
    {
      match,
      viewer,
      search,
      exclude,
      limit,
      sort,
      sample,
    }: {
      match?: FilterQuery<any>;
      viewer?: string;
      search?: unknown;
      exclude?: string[];
      limit?: number;
      sort?: { field: string; order: 1 | -1 };
      sample?: boolean;
    },
    ...rest: PipelineStage[]
  ): Promise<{ data: IBlogSchema[]; count: number }>;

  findLikes({
    blog,
    viewer,
    exclude,
    limit,
  }: {
    blog?: string;
    viewer?: string;
    exclude?: string[];
    limit?: number;
  }): Promise<{ data: IUserSchema[]; count: number }>;
}

export const genre: string[] = [
  'Technology',
  'Science',
  'Programming',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Lifestyle',
  'Fitness',
  'DIY',
  'Sports',
  'Finance',
  'Gaming',
  'News',
  'Movie',
  'Personal',
  'Business',
  'Political',
];

export enum NOTIFICATION {
  FOLLOW_USER = 'followUser',
  LIKE_BLOG = 'likeBlog',
  LIKE_COMMENT = 'likeComment',
  POST_COMMENT = 'postComment',
  POST_BLOG = 'postBlog',
}

export enum NOTIFICATION_STATUS {
  READ = 'read',
  UNREAD = 'unread',
}
