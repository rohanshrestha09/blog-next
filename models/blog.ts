import { User } from './user';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  imageName?: string | null;
  genre: string[];
  isPublished: boolean;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  _count?: {
    likedBy?: number;
    comments?: number;
  };
}
