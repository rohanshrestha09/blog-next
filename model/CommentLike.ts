import { model, Schema } from 'mongoose';
import { ICommentLikeSchema } from '../server.interface';

const BlogLikeSchema = new Schema<ICommentLikeSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User missing'],
    },
    likes: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment missing'],
    },
  },
  { timestamps: true }
);

export default model<ICommentLikeSchema>('CommentLike', BlogLikeSchema);
