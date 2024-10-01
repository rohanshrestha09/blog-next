import { PROVIDER } from 'enums';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  image?: string | null;
  imageName?: string | null;
  bio?: string | null;
  website?: string | null;
  provider: (typeof PROVIDER)[keyof typeof PROVIDER];
  isSSO: boolean;
  isVerified: boolean;
  followsViewer?: boolean;
  followedByViewer?: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    following?: number;
    followedBy?: number;
  };
}
