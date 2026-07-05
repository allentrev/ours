import { Document } from "mongoose";

export interface UserDocument extends Document {
  clerkUserId: string;
  username: string;
  role: string;
  email: string;
  img: string;
  savedPosts: string[];
  bio?: string;
  facebook?: string;
  instagram?: string;
}
