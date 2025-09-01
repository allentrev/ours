import { Model } from "mongoose";
import { PostDocument } from "../types/post.js";

declare const Post: Model<PostDocument>;
export default Post;
