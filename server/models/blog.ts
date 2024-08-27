import { User } from './user';
import { Comment } from './comment';
import { Notification } from './notification';
import { GENRE } from 'server/enums/genre';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  imageName?: string | null;
  genre: typeof GENRE;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  bookmarkedBy?: User[];
  likedBy?: User[];
  comments?: Comment[];
  notifications?: Notification[];
}
