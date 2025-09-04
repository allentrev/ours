import { Document, Schema } from "mongoose";

export interface PostDocument extends Document {
    user: Schema.Types.ObjectId;
    img: string;
    title: string;
    slug: string;
    desc: string;
    category: string;
    content: string;
    isFeatured: boolean;
    visit: number;
    // add other fields here as needed
}
