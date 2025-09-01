import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../types/user.js";

const userSchema = new Schema<UserDocument>(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String,
    },
    savedPosts: [
      {
        type: String,
        ref: "PostId",                  
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
