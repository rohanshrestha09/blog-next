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
    image: { type: String, required: [true, 'Image missing'] },
    imageName: { type: String, required: [true, 'Image missing'] },
    title: {
      type: String,
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
    likes: { type: Number, default: 0 },
    viewers: { type: [Schema.Types.ObjectId], default: [] },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    comments: { type: [{ commenter: Schema.Types.ObjectId, comment: String }], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
