import { Model } from "mongoose";
import { CommentDocument } from "../types/comment.js";

declare const Comment: Model<CommentDocument>;
export default Comment;
