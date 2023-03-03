import { Schema, model, Model, FilterQuery, PipelineStage } from 'mongoose';
import { ICommentSchema } from '../server.interface';
import User from './User';

const CommentSchema = new Schema<ICommentSchema>(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog missing'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User missing'],
    },
    comment: {
      type: String,
      required: [true, 'Comment missing'],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

interface ICommentModel extends Model<ICommentSchema> {
  findMany(
    {
      match,
      limit,
      exclude,
    }: {
      match?: FilterQuery<any>;
      limit?: number;
      exclude?: string[];
    },
    ...rest: PipelineStage[]
  ): Promise<{ data: ICommentSchema[]; count: number }>;
}

CommentSchema.statics.findMany = async function (
  { match, limit, exclude }: { match?: FilterQuery<any>; limit?: number; exclude?: string[] },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [
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
      $fill: { output: { like: { value: 0 } } },
    },
    {
      $project: {
        ...exclude
          ?.map((field: string) => ({ [field]: 0 }))
          .reduce((prev, curr) => ({ ...prev, ...curr })),
        like_count: 0,
      },
    },
  ];

  if (match) query.unshift({ $match: match });

  const [total] = await this.aggregate([...query, ...rest, { $count: 'count' }]);

  const data = await this.aggregate([...query, ...rest, { $limit: limit || 20 }]);

  await User.populate(data, { path: 'user', select: 'fullname image' });

  const count = total?.count ?? 0;

  return { data, count };
};

export default model<ICommentSchema, ICommentModel>('Comment', CommentSchema);
