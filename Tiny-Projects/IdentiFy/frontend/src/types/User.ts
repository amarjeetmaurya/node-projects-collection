// src/types/User.ts
export interface User {
  username: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string; // resolved S3 URL
}
