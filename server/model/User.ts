import { Schema, model, Types } from 'mongoose';

interface IUserSchema {
  fullname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  image: string;
  imageName: string;
  bookmarks: Types.ObjectId[];
  blogs: Types.ObjectId[];
  bio: string;
  website: string;
  following: Types.ObjectId[];
  followingCount: number;
  followers: Types.ObjectId[];
  followersCount: number;
}

const UserSchema = new Schema<IUserSchema>(
  {
    fullname: {
      type: String,
      required: [true, 'Please input your fullname.'],
    },
    email: {
      type: String,
      required: [true, 'Please input your email.'],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please input password.'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide Date of Birth.'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    bookmarks: { type: [Schema.Types.ObjectId], default: [] },
    blogs: { type: [Schema.Types.ObjectId], default: [] },
    bio: { type: String, default: null },
    website: { type: String, default: null, lowercase: true },
    following: { type: [Schema.Types.ObjectId], default: [] },
    followers: { type: [Schema.Types.ObjectId], default: [] },
    followingCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IUserSchema>('User', UserSchema);
