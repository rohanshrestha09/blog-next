import { model, Schema } from 'mongoose';
import { IBlogBookmarkSchema } from '../server.interface';

const BlogBookmark = new Schema<IBlogBookmarkSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User missing'],
    },
    bookmarks: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog missing'],
    },
  },
  { timestamps: true }
);

export default model<IBlogBookmarkSchema>('BlogBookmark', BlogBookmark);
