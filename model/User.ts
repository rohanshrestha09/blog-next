import mongoose, { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema(
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
    image: String,
    imageName: String,
    bookmarks: [{ type: Schema.Types.ObjectId, default: [] }],
    blogs: [{ type: Schema.Types.ObjectId, default: [] }],
    liked: [{ type: Schema.Types.ObjectId, default: [] }],
    bio: String,
    following: [{ type: Schema.Types.ObjectId, default: [] }],
    followers: [{ type: Schema.Types.ObjectId, default: [] }],
    followingCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
