import { Request, Response } from "express";

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

    if (cat) query.category = cat;

    if (searchQuery) query.title = { $regex: searchQuery, $options: "i" };

    if (author) {
      const user = (await User.findOne({ username: author }).select("_id")) as
        | UserDocument
        | null;

      if (!user) {
        res.status(404).json({ message: "No post found!" });
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

    if (featured) query.isFeatured = true;

    const posts: PostDocument[] = await Post.find(query)
      .populate("user", "username")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);
    const hasMore = page * limit < totalPosts;

    res.status(200).json({ posts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// ---------------------- GET SINGLE POST ----------------------
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { visit: 1 } },
      { new: true }
    ).populate("user", "username img");

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// ---------------------- CREATE POST ----------------------
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.currentUser!;
    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    console.log("create Post, body,user,role");
    console.log(req.body);
    console.log(user);
    console.log(role);  

    const newPost = new Post({
      user: user._id,
      ...req.body, // title, content, img, category, tags
    }) as PostDocument;

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// ---------------------- UPDATE POST ----------------------
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.currentUser!;
    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    const { title, desc, content } = req.body;

    if (role === "admin") {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { title, desc, content },
        { new: true }
      );
      if (!updatedPost) return res.status(404).json("Post not found!");
      return res.status(200).json(updatedPost);
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { title, desc, content },
      { new: true }
    );

    if (!updatedPost) return res.status(403).json("You can only edit your own posts!");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// ---------------------- DELETE POST ----------------------
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.currentUser!;
    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
      await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json("Post has been deleted");
    }

    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      user: user._id,
    });

    if (!deletedPost) return res.status(403).json("You can delete only your posts!");

    res.status(200).json("Post has been deleted");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// ---------------------- FEATURE POST ----------------------
export const featurePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.currentUser!;
    const role = req.auth?.sessionClaims?.metadata?.role || "user";
    const postId = req.body.postId as string;

    if (role !== "admin") return res.status(403).json("You cannot feature posts!");

    const post = (await Post.findById(postId)) as PostDocument | null;
    if (!post) return res.status(404).json("Post not found!");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { isFeatured: !post.isFeatured },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to feature post" });
  }
};
