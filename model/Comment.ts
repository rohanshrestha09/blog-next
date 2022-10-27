import { Schema, model, models, Model } from 'mongoose';
import { ICommentSchema } from '../interface/schema';

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
    likers: { type: [Schema.Types.ObjectId], default: [] },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (models.Comment as Model<ICommentSchema>) ||
  model<ICommentSchema>('Comment', CommentSchema);
