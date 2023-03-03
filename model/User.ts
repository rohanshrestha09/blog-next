import { Schema, model, Types, Model, PipelineStage, FilterQuery } from 'mongoose';
import { IUserSchema } from '../server.interface';

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
    verified: { type: Boolean },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    bio: { type: String, default: null },
    website: { type: String, default: null, lowercase: true },
    followings: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

interface IUserModel extends Model<IUserSchema> {
  findUnique({ _id, exclude }: { _id: string; exclude?: string[] }): Promise<IUserSchema>;
  findMany(
    {
      match,
      search,
      exclude,
      limit,
      sample,
    }: {
      match?: FilterQuery<any>;
      search?: unknown;
      exclude?: string[];
      limit?: number;
      sample?: boolean;
    },
    ...rest: PipelineStage[]
  ): Promise<{ data: IUserSchema[]; count: number }>;
}

const userLookup = [
  {
    $lookup: {
      from: 'users',
      localField: 'followers',
      foreignField: '_id',
      as: 'follower_count',
      pipeline: [{ $count: 'follower' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$follower_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'followings',
      foreignField: '_id',
      as: 'following_count',
      pipeline: [{ $count: 'following' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$following_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $fill: {
      output: {
        follower: { value: 0 },
        following: { value: 0 },
      },
    },
  },
];

UserSchema.statics.findUnique = async function ({
  _id,
  exclude,
}: {
  _id: string;
  exclude?: string[];
}) {
  const query: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(_id) } },
    ...userLookup,
    {
      $project: {
        ...exclude
          ?.map((field: string) => ({ [field]: 0 }))
          .reduce((prev, curr) => ({ ...prev, ...curr })),
        follower_count: 0,
        following_count: 0,
      },
    },
  ];

  const [data = null] = await this.aggregate(query);

  return data;
};

UserSchema.statics.findMany = async function (
  {
    match,
    search,
    exclude,
    limit,
    sample,
  }: {
    match?: FilterQuery<any>;
    search?: unknown;
    exclude?: string[];
    limit?: number;
    sample?: boolean;
  },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [
    ...userLookup,
    {
      $project: {
        ...exclude
          ?.map((field: string) => ({ [field]: 0 }))
          .reduce((prev, curr) => ({ ...prev, ...curr })),
        follower_count: 0,
        following_count: 0,
      },
    },
  ];

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

export default model<IUserSchema, IUserModel>('User', UserSchema);
