import { Schema, model, Types, Model, PipelineStage, FilterQuery } from 'mongoose';
import { IUserModel, IUserSchema } from '../server.interface';
import { blogLookup, userLookup } from '../utils/lookup';

const UserSchema = new Schema<IUserSchema>(
  {
    fullname: {
      type: String,
      required: [true, 'Please input your fullname.'],
    },
    email: {
      type: String,
      required: [true, 'Please input your email.'],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please input password.'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide Date of Birth.'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    provider: {
      type: String,
      default: 'email',
      enum: {
        values: ['email', 'google'] as Array<String>,
        message: '{VALUE} not supported',
      },
    },
    isSSO: { type: Boolean, default: false },
    isVerified: { type: Boolean },
    bio: { type: String, default: null },
    website: { type: String, default: null, lowercase: true },
  },
  { timestamps: true }
);

UserSchema.statics.findUnique = async function ({
  _id,
  viewer,
  exclude,
}: {
  _id: string;
  viewer?: string;
  exclude?: string[];
}) {
  const query: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(_id) } },
    ...userLookup({ viewer, exclude }),
  ];

  const [data = null] = await this.aggregate(query);

  return data;
};

UserSchema.statics.findMany = async function (
  {
    match,
    viewer,
    search,
    exclude,
    limit,
    sample,
  }: {
    match?: FilterQuery<any>;
    search?: unknown;
    viewer?: string;
    exclude?: string[];
    limit?: number;
    sample?: boolean;
  },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [...userLookup({ viewer, exclude })];

  if (match) query.unshift({ $match: match });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-user-search',
        autocomplete: { query: search, path: 'fullname' },
      },
    });

  const [total] = await this.aggregate([...query, ...rest, { $count: 'count' }]);

  if (sample) query.push({ $sample: { size: limit || 20 } });

  const data = await this.aggregate([...query, ...rest, { $limit: limit || 20 }]);

  const count = total?.count ?? 0;

  return { data, count };
};

UserSchema.statics.findFollowers = async function (
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
  },
  field: 'followers' | 'followings'
) {
  const lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [
    { $match: { [field === 'followers' ? 'follows' : 'user']: user } },
    {
      $lookup: {
        from: 'users',
        localField: field === 'followers' ? 'user' : 'follows',
        foreignField: '_id',
        as: 'users',
      },
    },
    { $set: { _id: '$user._id' } },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ $arrayElemAt: ['$users', 0] }, '$$ROOT'] },
      },
    },
    ...userLookup({ viewer, exclude }),
    {
      $project: {
        users: 0,
        user: 0,
        follows: 0,
      },
    },
  ];

  if (search)
    lookupPipeline.unshift({
      $search: {
        index: 'blog-user-search',
        autocomplete: { query: search, path: 'fullname' },
      },
    });

  const query = (
    lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
  ): PipelineStage[] => [
    { $match: { _id: user } },
    {
      $lookup: {
        from: 'userfollows',
        localField: '_id',
        foreignField: field === 'followers' ? 'follows' : 'user',
        as: field,
        pipeline: lookupPipeline,
      },
    },
    { $unwind: `$${field}` },
    { $replaceWith: `$${field}` },
  ];

  const data = await this.aggregate([...query([...lookupPipeline, { $limit: limit || 20 }])]);

  const [total] = await this.aggregate([...query([...lookupPipeline, { $count: 'count' }])]);

  const count = total?.count ?? 0;

  return { data, count };
};

UserSchema.statics.findFollowingBlogs = async function ({
  user,
  viewer,
  exclude,
  sort,
  limit,
}: {
  user?: string;
  viewer?: string;
  exclude?: string[];
  limit?: number;
  sort: { field: string; order: 1 | -1 };
}) {
  const lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [
    {
      $lookup: {
        from: 'blogs',
        localField: 'follows',
        foreignField: 'author',
        as: 'blogs',
      },
    },
    { $set: { _id: '$blog._id' } },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ $arrayElemAt: ['$blogs', 0] }, '$$ROOT'] },
      },
    },
    ...blogLookup({ viewer, exclude }),
    { $sort: { [sort.field]: sort.order } },
    {
      $project: {
        blogs: 0,
        follows: 0,
        user: 0,
      },
    },
  ];

  const query = (
    lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
  ): PipelineStage[] => [
    { $match: { _id: user } },
    {
      $lookup: {
        from: 'userfollows',
        localField: '_id',
        foreignField: 'user',
        as: 'followings',
        pipeline: lookupPipeline,
      },
    },
    { $unwind: '$followings' },
    { $replaceWith: '$followings' },
  ];

  const data = await this.aggregate([...query([...lookupPipeline, { $limit: limit || 20 }])]);

  const [total] = await this.aggregate([...query([...lookupPipeline, { $count: 'count' }])]);

  const count = total?.count ?? 0;

  await this.populate(data, { path: 'author', select: 'fullname image' });

  return { data, count };
};

UserSchema.statics.findBookmarks = async function ({
  match,
  user,
  viewer,
  search,
  exclude,
  limit,
}: {
  match: FilterQuery<any>;
  user?: string;
  viewer?: string;
  search?: unknown;
  exclude?: string[];
  limit?: number;
}) {
  const lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [
    {
      $lookup: {
        from: 'blogs',
        localField: 'bookmarks',
        foreignField: '_id',
        as: 'blogs',
        pipeline: [{ $match: match }],
      },
    },
    { $set: { _id: '$blog._id' } },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ $arrayElemAt: ['$blogs', 0] }, '$$ROOT'] },
      },
    },
    ...blogLookup({ viewer, exclude }),
    {
      $project: {
        blogs: 0,
        bookmarks: 0,
        user: 0,
      },
    },
  ];

  if (search)
    lookupPipeline.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: search, path: 'title' },
      },
    });

  const query = (
    lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
  ): PipelineStage[] => [
    { $match: { _id: user } },
    {
      $lookup: {
        from: 'blogbookmarks',
        localField: '_id',
        foreignField: 'user',
        as: 'bookmarks',
        pipeline: lookupPipeline,
      },
    },
    { $unwind: '$bookmarks' },
    { $replaceWith: '$bookmarks' },
  ];

  const data = await this.aggregate([...query([...lookupPipeline, { $limit: limit || 20 }])]);

  const [total] = await this.aggregate([...query([...lookupPipeline, { $count: 'count' }])]);

  await this.populate(data, { path: 'author', select: 'fullname image' });

  const count = total?.count ?? 0;

  return { data, count };
};

export default model<IUserSchema, IUserModel>('User', UserSchema);
