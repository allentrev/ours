import { Document, Types } from "mongoose";

export interface PostDocument extends Document {
  user: Types.ObjectId;       // reference to the user who created the post
  img: string;                // cover image URL
  title: string;              
  slug: string;               // unique URL-friendly slug
  desc?: string;              
  category: string;
  content: string;
  tags?: string[];            // optional tags for search
  seoTitle?: string;          
  seoDesc?: string;           
  readingTime?: number;       // in minutes
  isFeatured: boolean;        // default false
  visit: number;              // hit count
  createdAt: Date;
  updatedAt: Date;
}
