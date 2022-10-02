import mongoose, { Schema } from 'mongoose';
export const genre: string[] = [
  'Technology',
  'Science',
  'Programming',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Lifestyle',
  'Fitness',
  'DIY',
  'Sports',
  'Finance',
  'Gaming',
  'News',
  'Movie',
  'Personal',
  'Business',
  'Political',
];

const BlogSchema = new mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, required: [true, 'Author missing'] },
    authorName: { type: String, required: [true, 'Author name missing'] },
    authorImage: { type: Schema.Types.Mixed, required: [true, 'Author image missing'] },
    image: String,
    imageName: String,
    title: {
      type: String,
      index: true,
      required: [true, 'Title missing'],
    },
    content: {
      type: String,
      required: [true, 'Content missing'],
    },
    genre: {
      type: [String],
      required: [true, 'Atleast one genre required'],
      validate: [
        function arrayLimit(val: any) {
          return val.length <= 4;
        },
        'Only 4 genre allowed',
      ],
      enum: {
        values: genre as Array<String>,
        message: '{VALUE} not supported',
      },
    },
    likers: { type: [Schema.Types.ObjectId], default: [] },
    likesCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    comments: { type: [{ commenter: Schema.Types.ObjectId, comment: String }], default: [] },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
