import { model, Schema } from 'mongoose';
import { IUserFollowSchema } from '../server.interface';

const UserFollowSchema = new Schema<IUserFollowSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User missing'],
    },
    follows: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follows missing'],
    },
  },
  { timestamps: true }
);

export default model<IUserFollowSchema>('UserFollow', UserFollowSchema);
