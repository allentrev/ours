import { Document , Schema} from "mongoose";

export interface CommentDocument extends Document {
    user: Schema.Types.ObjectId;
    post: Schema.Types.ObjectId;
    desc: string;
    // add other fields here as needed
}
