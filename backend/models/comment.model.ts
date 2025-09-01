import mongoose, { Schema } from "mongoose";
import { CommentDocument }  from "../types/comment.js";

const commentSchema = new Schema<CommentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model<CommentDocument> (
  "Comment",
  commentSchema
);

export default Comment;
