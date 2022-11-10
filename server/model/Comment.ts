import { Schema, model, Types } from 'mongoose';

interface ICommentSchema {
  blog: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  likers: Types.ObjectId[];
  likesCount: number;
}

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

export default model<ICommentSchema>('Comment', CommentSchema);
