import { Schema, model, FilterQuery, PipelineStage, Types } from 'mongoose';
import { genre, IBlogModel, IBlogSchema } from '../server.interface';
import { blogLookup, userLookup } from '../utils/lookup';
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
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BlogSchema.statics.findUnique = async function ({
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
    ...blogLookup({ viewer, exclude }),
  ];

  const [data = null] = await this.aggregate(query);

  await User.populate(data, { path: 'author', select: 'fullname image' });

  return data;
};

BlogSchema.statics.findMany = async function (
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
    sort?: { field: 'likeCount' | 'createdAt'; order: 1 | -1 };
    sample?: boolean;
  },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [...blogLookup({ viewer, exclude })];

  if (sort) query.push({ $sort: { [sort.field]: sort.order } });

  if (match) query.unshift({ $match: match });

  if (search)
    query.unshift({
      $search: {
        index: 'blog-search',
        autocomplete: { query: search, path: 'title' },
      },
    });

  const [total] = await this.aggregate([...query, ...rest, { $count: 'count' }]);

  if (sample) query.push({ $sample: { size: limit || 20 } });

  const data = await this.aggregate([...query, ...rest, { $limit: limit || 20 }]);

  await User.populate(data, { path: 'author', select: 'fullname image' });

  const count = total?.count ?? 0;

  return { data, count };
};

BlogSchema.statics.findLikes = async function ({
  blog,
  viewer,
  exclude,
  limit,
}: {
  blog?: string;
  viewer?: string;
  exclude?: string[];
  limit?: number;
}) {
  const lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
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
        likes: 0,
        user: 0,
      },
    },
  ];

  const query = (
    lookupPipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
  ): PipelineStage[] => [
    { $match: { _id: blog } },
    {
      $lookup: {
        from: 'bloglikes',
        localField: '_id',
        foreignField: 'likes',
        as: 'likes',
        pipeline: lookupPipeline,
      },
    },
    { $project: { _id: 0 } },
  ];

  const [docs] = await this.aggregate([
    ...query([...lookupPipeline, { $limit: limit || 20 }]),
  ]).project({ likes: 1 });

  const [total] = await this.aggregate([...query([...lookupPipeline, { $count: 'count' }])]);

  const count = total?.likes[0]?.count ?? 0;

  const data = docs?.likes || [];

  return { data, count };
};

export default model<IBlogSchema, IBlogModel>('Blog', BlogSchema);
