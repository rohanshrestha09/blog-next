import { model, Schema } from 'mongoose';
import { IBlogLikeSchema } from '../server.interface';

const BlogLikeSchema = new Schema<IBlogLikeSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User missing'],
    },
    likes: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog missing'],
    },
  },
  { timestamps: true }
);

export default model<IBlogLikeSchema>('BlogLike', BlogLikeSchema);
