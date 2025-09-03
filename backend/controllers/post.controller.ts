import { Request, Response } from "express";
import ImageKit from "imagekit";

import Post from "../models/post.model.js";
import { PostDocument } from "../types/post.js";

import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";

// ---------------------- GET POSTS ----------------------
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 2;

    const query: Record<string, any> = {};

    const cat = req.query.cat as string | undefined;
    const author = req.query.author as string | undefined;
    const searchQuery = req.query.search as string | undefined;
    const sortQuery = req.query.sort as string | undefined;
    const featured = req.query.featured as string | undefined;

    if (cat) {
      query.category = cat;
    }

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
      const user = (await User.findOne({ username: author }).select("_id")) as
        | UserDocument
        | null;

      if (!user) {
        res.status(404).json("No post found!");
        return;
      }

      query.user = user._id;
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };

    if (sortQuery) {
      switch (sortQuery) {
        case "newest":
          sortObj = { createdAt: -1 };
          break;
        case "oldest":
          sortObj = { createdAt: 1 };
          break;
        case "popular":
          sortObj = { visit: -1 };
          break;
        case "trending":
          sortObj = { visit: -1 };
          query.createdAt = {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          };
          break;
        default:
          break;
      }
    }

    if (featured) {
      query.isFeatured = true;
    }

    const posts: PostDocument[] = await Post.find(query)
      .populate("user", "username")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;

    res.status(200).json({ posts, hasMore });
  } catch (err) {
    res.status(500).json({ error: "PostController getPosts Failed to fetch posts" });
  }
};

// ---------------------- GET POST ----------------------
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "user",
      "username img"
    );
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// ---------------------- CREATE POST ----------------------
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found!");
      return;
    }

    let slug = (req.body.title as string).replace(/ /g, "-").toLowerCase();
    let existingPost = await Post.findOne({ slug });
    let counter = 2;

    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await Post.findOne({ slug });
      counter++;
    }

    const newPost = new Post({ user: user._id, slug, ...req.body }) as PostDocument;
    const post = await newPost.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

// ---------------------- DELETE POST ----------------------
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json("Post has been deleted");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      user: user._id,
    });

    if (!deletedPost) {
      res.status(403).json("You can delete only your posts!");
      return;
    }

    res.status(200).json("Post has been deleted");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// ---------------------- FEATURE POST ----------------------
export const featurePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;
    const postId = req.body.postId as string;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    if (role !== "admin") {
      res.status(403).json("You cannot feature posts!");
      return;
    }

    const post = (await Post.findById(postId)) as PostDocument | null;

    if (!post) {
      res.status(404).json("Post not found!");
      return;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { isFeatured: !post.isFeatured },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Failed to feature post" });
  }
};

// ---------------------- IMAGEKIT AUTH ----------------------
const imagekit = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT as string,
  publicKey: process.env.IK_PUBLIC_KEY as string,
  privateKey: process.env.IK_PRIVATE_KEY as string,
});

export const uploadAuth = async (req: Request, res: Response): Promise<void> => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
};
