import { Schema, model, Model, FilterQuery, PipelineStage, Types } from 'mongoose';
import { genre, IBlogSchema, IUserSchema } from '../server.interface';
import User from './User';

const BlogSchema = new Schema<IBlogSchema>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author missing'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    title: {
      type: String,
      required: [true, 'Title missing'],
    },
    content: {
      type: String,
      required: [true, 'Content missing'],
    },
    genre: {
      type: [String],
      required: [true, 'Atleast one genre required'],
      validate: [
        function (val: any) {
          return val.length <= 4;
        },
        'Only 4 genre allowed',
      ],
      enum: {
        values: genre as Array<String>,
        message: '{VALUE} not supported',
      },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

interface IBlogModel extends Model<IBlogSchema> {
  findUnique({ _id, exclude }: { _id: string; exclude?: string[] }): Promise<IBlogSchema>;
  findMany(
    {
      match,
      search,
      exclude,
      limit,
      sort,
      sample,
    }: {
      match?: FilterQuery<any>;
      search?: unknown;
      exclude?: string[];
      limit?: number;
      sort?: { field: string; order: 1 | -1 };
      sample?: boolean;
    },
    ...rest: PipelineStage[]
  ): Promise<{ data: IBlogSchema[]; count: number }>;
}

const blogLookup = [
  {
    $lookup: {
      from: 'users',
      localField: 'likes',
      foreignField: '_id',
      as: 'like_count',
      pipeline: [{ $count: 'like' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$like_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'comments',
      localField: 'comments',
      foreignField: '_id',
      as: 'comment_count',
      pipeline: [{ $count: 'comment' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$comment_count', 0] }, '$$ROOT'] },
    },
  },
  // {
  //   $fill: {
  //     output: {
  //       like: { value: 0 },
  //       comment: { value: 0 },
  //     },
  //   },
  // },
];

BlogSchema.statics.findUnique = async function ({
  _id,
  exclude,
}: {
  _id: string;
  exclude?: string[];
}) {
  const query: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(_id) } },
    ...blogLookup,
    {
      $project: {
        ...exclude
          ?.map((field: string) => ({ [field]: 0 }))
          .reduce((prev, curr) => ({ ...prev, ...curr })),
        like_count: 0,
        comment_count: 0,
      },
    },
  ];

  const [data = null] = await this.aggregate(query);

  await User.populate(data, { path: 'author', select: 'fullname image' });

  return data;
};

BlogSchema.statics.findMany = async function (
  {
    match,
    search,
    exclude,
    limit,
    sort,
    sample,
  }: {
    match?: FilterQuery<any>;
    search?: unknown;
    exclude?: string[];
    limit?: number;
    sort?: { field: 'like' | 'createdAt'; order: 1 | -1 };
    sample?: boolean;
  },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [
    ...blogLookup,
    {
      $project: {
        ...exclude
          ?.map((field: string) => ({ [field]: 0 }))
          .reduce((prev, curr) => ({ ...prev, ...curr })),
        like_count: 0,
        comment_count: 0,
      },
    },
  ];

  if (sort) query.push({ $sort: { [sort.field]: sort.order } });

  if (match) query.unshift({ $match: match });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: String(search), path: 'title' },
      },
    });

  const [total] = await this.aggregate([...query, ...rest, { $count: 'count' }]);

  if (sample) query.push({ $sample: { size: limit || 20 } });

  const data = await this.aggregate([...query, ...rest, { $limit: limit || 20 }]);

  await User.populate(data, { path: 'author', select: 'fullname image' });

  const count = total?.count ?? 0;

  return { data, count };
};

export default model<IBlogSchema, IBlogModel>('Blog', BlogSchema);
