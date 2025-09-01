import { Document } from "mongoose";

export interface CommentDocument extends Document {
    user: string;
    post: string;
    desc: string;
    // add other fields here as needed
}
