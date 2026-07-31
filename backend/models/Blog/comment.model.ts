import mongoose, { Schema } from "mongoose";
import { CommentDocument }  from "../../types/blog.types.js";

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

const CommentModel = mongoose.model<CommentDocument> (
  "Comment",
  commentSchema
);

export default CommentModel;
