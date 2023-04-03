import { Schema, model, FilterQuery, PipelineStage, Types } from 'mongoose';
import { ICommentModel, ICommentSchema } from '../server.interface';
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
  },
  { timestamps: true }
);

CommentSchema.statics.findMany = async function (
  {
    match,
    viewer,
    limit,
    exclude,
  }: { match?: FilterQuery<any>; viewer?: string; limit?: number; exclude?: string[] },
  ...rest: PipelineStage[]
) {
  const query: PipelineStage[] = [
    {
      $lookup: {
        from: 'commentlikes',
        localField: '_id',
        foreignField: 'likes',
        as: 'like_count',
        pipeline: [{ $count: 'likeCount' }],
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ $arrayElemAt: ['$like_count', 0] }, '$$ROOT'] },
      },
    },
    {
      $lookup: {
        from: 'commentlikes',
        localField: '_id',
        foreignField: 'likes',
        as: 'hasLiked',
        pipeline: [{ $match: { user: new Types.ObjectId(viewer) } }],
      },
    },
    {
      $set: {
        likeCount: { $ifNull: ['$likeCount', 0] },
        hasLiked: { $gt: [{ $size: '$hasLiked' }, 0] },
      },
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

  const [{ count } = { count: 0 }] = await this.aggregate([...query, ...rest, { $count: 'count' }]);

  const data = await this.aggregate([...query, ...rest, { $limit: limit || 20 }]);

  await User.populate(data, { path: 'user', select: 'fullname image' });

  return { data, count };
};

export default model<ICommentSchema, ICommentModel>('Comment', CommentSchema);
