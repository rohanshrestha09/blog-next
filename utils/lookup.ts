import { PipelineStage, Types } from 'mongoose';

export const blogLookup = ({
  viewer,
  exclude,
}: {
  viewer?: string;
  exclude?: string[];
}): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => [
  {
    $lookup: {
      from: 'bloglikes',
      localField: '_id',
      foreignField: 'likes',
      as: 'like_count',
      pipeline: [{ $count: 'likeCount' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$like_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'blog',
      as: 'comment_count',
      pipeline: [{ $count: 'commentCount' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$comment_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'bloglikes',
      localField: '_id',
      foreignField: 'likes',
      as: 'hasLiked',
      pipeline: [{ $match: { user: new Types.ObjectId(viewer) } }],
    },
  },
  {
    $lookup: {
      from: 'blogbookmarks',
      localField: '_id',
      foreignField: 'bookmarks',
      as: 'hasBookmarked',
      pipeline: [{ $match: { user: new Types.ObjectId(viewer) } }],
    },
  },
  {
    $set: {
      likeCount: { $ifNull: ['$likeCount', 0] },
      commentCount: { $ifNull: ['$commentCount', 0] },
      hasLiked: { $gt: [{ $size: '$hasLiked' }, 0] },
      hasBookmarked: { $gt: [{ $size: '$hasBookmarked' }, 0] },
    },
  },
  {
    $project: {
      ...exclude
        ?.map((field: string) => ({ [field]: 0 }))
        .reduce((prev, curr) => ({ ...prev, ...curr })),
      like_count: 0,
      comment_count: 0,
    },
  },
];

export const userLookup = ({
  viewer,
  exclude,
}: {
  viewer?: string;
  exclude?: string[];
}): Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[] => [
  {
    $lookup: {
      from: 'userfollows',
      localField: '_id',
      foreignField: 'follows',
      as: 'follower_count',
      pipeline: [{ $count: 'followerCount' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$follower_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'userfollows',
      localField: '_id',
      foreignField: 'user',
      as: 'following_count',
      pipeline: [{ $count: 'followingCount' }],
    },
  },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: [{ $arrayElemAt: ['$following_count', 0] }, '$$ROOT'] },
    },
  },
  {
    $lookup: {
      from: 'userfollows',
      localField: '_id',
      foreignField: 'user',
      as: 'followsViewer',
      pipeline: [{ $match: { follows: new Types.ObjectId(viewer) } }],
    },
  },
  {
    $lookup: {
      from: 'userfollows',
      localField: '_id',
      foreignField: 'follows',
      as: 'followedByViewer',
      pipeline: [{ $match: { user: new Types.ObjectId(viewer) } }],
    },
  },
  {
    $set: {
      followerCount: { $ifNull: ['$followerCount', 0] },
      followingCount: { $ifNull: ['$followingCount', 0] },
      followsViewer: { $gt: [{ $size: '$followsViewer' }, 0] },
      followedByViewer: { $gt: [{ $size: '$followedByViewer' }, 0] },
    },
  },
  {
    $project: {
      ...exclude
        ?.map((field: string) => ({ [field]: 0 }))
        .reduce((prev, curr) => ({ ...prev, ...curr })),
      follower_count: 0,
      following_count: 0,
    },
  },
];
