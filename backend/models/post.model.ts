import mongoose, { Schema } from "mongoose";
import { randomBytes } from "crypto";
import slugifyPkg from "slugify";   // import the package
import readingTime from "reading-time";
import { PostDocument } from "../types/post.js";

// Fix for NodeNext ESM: get callable function
const slugify = slugifyPkg.default || slugifyPkg;

/* -------------------- Post Schema -------------------- */
const postSchema = new Schema<PostDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cover: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    desc: { type: String, default: "" },
    category: { type: String, default: "general" },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    seoTitle: { type: String },
    seoDesc: { type: String },
    readingTime: { type: Number },
    isFeatured: { type: Boolean, default: false },
    visit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* -------------------- Pre-validation hook: generate unique slug -------------------- */
postSchema.pre("validate", async function (next) {
  if (!this.slug) {
    let slug = randomBytes(6).toString("base64url"); // e.g. "a3f9c2b1d4e5"

    const Post = mongoose.model("Post");
    // ensure uniqueness just in case
    while (await Post.exists({ slug })) {
      slug = randomBytes(6).toString("base64url");
    }

    this.slug = slug;
  }
  next();
});

/* -------------------- Pre-save hook: calculate reading time -------------------- */
postSchema.pre("save", function (next) {
  if (this.content) {
    const stats = readingTime(this.content);
    this.readingTime = Math.ceil(stats.minutes);
  }
  next();
});

/* -------------------- Indexes for fast lookup -------------------- */
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

/* -------------------- Export Post model -------------------- */
const Post = mongoose.model<PostDocument>("Post", postSchema);

export default Post;
