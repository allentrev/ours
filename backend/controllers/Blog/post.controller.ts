// controllers/Blog/post.controller.ts

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  FilterQuery,
} from "mongoose";

import {
  PostModel,
} from "../../models/Blog/post.model.js";

import User from "../../models/user.model.js";

import {
  AppError,
} from "../../lib/AppError.js";

import {
  successResponse,
  createdResponse,
} from "../../lib/apiResponse.js";

import type {
  PostListRecord,
  PostRecord,
  PostType,
  RecipeData,
  ReviewData,
  TodoData,
} from "../../types/blog.types.js";

import {
  POST_TYPES,
} from "../../types/blog.types.js";

import readingTime from "reading-time";


/* -------------------------------------------------------------------------- */
/* Request types                                                              */
/* -------------------------------------------------------------------------- */

interface PostWriteInput {
  type?: PostType;

  cover?: string;
  title?: string;
  desc?: string;
  category?: string;
  content?: string;

  tags?: string[];
  dishes?: string[];

  recipe?: RecipeData;
  review?: ReviewData;
  todo?: TodoData;

  isFeatured?: boolean;
}

interface CreatePostRequestBody {
  post?: PostWriteInput;
}

interface UpdatePostRequestBody {
  post?: PostWriteInput & {
    slug?: string;
  };
}

interface DeletePostResult {
  slug: string;
}
/* -------------------- Response types -------------------- */

interface GetPostsResult {
  posts: PostListRecord[];
  hasMore: boolean;
}


const modName =
  "/controllers/Blog/post/";

/* -------------------- GET POSTS -------------------- */

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const funcName = "getPosts";

  try {
    const requestedPage =
      Number.parseInt(
        String(
          req.query.page ?? "1"
        ),
        10
      );

    const requestedLimit =
      Number.parseInt(
        String(
          req.query.limit ?? "2"
        ),
        10
      );

    const page =
      Number.isFinite(
        requestedPage
      ) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isFinite(
        requestedLimit
      ) &&
      requestedLimit > 0
        ? Math.min(
            requestedLimit,
            50
          )
        : 2;

    const category =
      typeof req.query.cat ===
      "string"
        ? req.query.cat.trim()
        : "";

    const author =
      typeof req.query.author ===
      "string"
        ? req.query.author.trim()
        : "";

    const search =
      typeof req.query.search ===
      "string"
        ? req.query.search.trim()
        : "";

    const sort =
      typeof req.query.sort ===
      "string"
        ? req.query.sort.trim()
        : "newest";

    const type = 
      typeof req.query.type === "string"
        ? req.query.type.trim()
        : "";

    const featured =
      req.query.featured ===
      "true";

    const query:
      FilterQuery<PostRecord> = {};

    if (category) {
      query.category =
        category;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (type) {
      if (!POST_TYPES.includes(type as PostType)) {
        throw new AppError(
          400,
          "Invalid post type."
        );
      }

      query.type = type;
    }
    
    if (author) {
      const user =
        await User.findOne({
          username: author,
        })
          .select("_id")
          .lean();

      if (!user) {
        const result:
          GetPostsResult = {
            posts: [],
            hasMore: false,
          };

        return successResponse(
          res,
          result,
          "No posts found."
        );
      }

      query.user = user._id;
    }

    if (featured) {
      query.isFeatured = true;
    }

    let sortObject: Record<
      string,
      1 | -1
    > = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortObject = {
          createdAt: 1,
        };
        break;

      case "popular":
        sortObject = {
          visit: -1,
        };
        break;

      case "trending":
        sortObject = {
          visit: -1,
        };

        query.createdAt = {
          $gte: new Date(
            Date.now() -
              7 *
                24 *
                60 *
                60 *
                1000
          ),
        };
        break;

      case "newest":
      default:
        sortObject = {
          createdAt: -1,
        };
        break;
    }

    const skip =
      (page - 1) * limit;

    const [
      posts,
      totalPosts,
    ] = await Promise.all([
      PostModel.find(query)
        .populate(
          "user",
          "username"
        )
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean<PostListRecord[]>(),

      PostModel.countDocuments(
        query
      ),
    ]);

    const result:
      GetPostsResult = {
        posts,
        hasMore:
          page * limit <
          totalPosts,
      };

    return successResponse(
      res,
      result,
      "Posts retrieved successfully."
    );
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    next(error);
  }
};

/* -------------------- GET SINGLE POST -------------------- */

export const getPost = async (
  req: Request<{
    slug: string;
  }>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const funcName = "getPost";

  try {
    const slug =
      req.params.slug.trim();

    if (!slug) {
      throw new AppError(
        400,
        "Post slug is required."
      );
    }

    const post =
      await PostModel.findOneAndUpdate(
        {
          slug,
        },
        {
          $inc: {
            visit: 1,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "username img"
        )
        .lean<PostListRecord>();

    if (!post) {
      throw new AppError(
        404,
        "Post not found."
      );
    }

    return successResponse(
      res,
      post,
      "Post retrieved successfully."
    );
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    next(error);
  }
};

/* -------------------- FEATURE POST -------------------- */

export const featurePost = async (
  req: Request<
    {},
    {},
    {
      postId?: string;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const funcName = "featurePost";

  try {
    const role =
      req.currentUser?.role;

    if (role !== "admin") {
      throw new AppError(
        403,
        "You are not authorised to feature posts."
      );
    }

    const postId =
      req.body.postId?.trim();

    if (!postId) {
      throw new AppError(
        400,
        "Post ID is required."
      );
    }

    const post =
      await PostModel.findById(
        postId
      );

    if (!post) {
      throw new AppError(
        404,
        "Post not found."
      );
    }

    const updatedPost =
      await PostModel.findByIdAndUpdate(
        postId,
        {
          $set: {
            isFeatured:
              !post.isFeatured,

            updatedByUserId:
              req.currentUser
                ?.clerkUserId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "username img"
        )
        .lean<PostListRecord>();

    if (!updatedPost) {
      throw new AppError(
        404,
        "Post not found."
      );
    }

    return successResponse(
      res,
      updatedPost,
      updatedPost.isFeatured
        ? "Post featured successfully."
        : "Post removed from featured posts successfully."
    );
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    next(error);
  }
};

//  --------------------------- CRUD SECTION   ------------------------
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const calculateReadingTime = (
  content: string
): number => {
  const result =
    readingTime(content);

  return Math.max(
    1,
    Math.ceil(result.minutes)
  );
};

const findMongoUser = async (
  clerkUserId: string
) => {
  /*
   * Change clerkUserId below if your User model
   * uses a different field name for the Clerk ID.
   */
  const user =
    await User.findOne({
      clerkUserId,
    });

  if (!user) {
    throw new AppError(
      404,
      "The authenticated user does not have a local user record."
    );
  }

  return user;
};

const canModifyPost = (
  postUserId: unknown,
  currentUserId: unknown,
  role?: string
): boolean => {
  if (role === "admin") {
    return true;
  }

  return String(postUserId) ===
    String(currentUserId);
};

/* -------------------------------------------------------------------------- */
/* CREATE POST                                                                */
/* -------------------------------------------------------------------------- */

export const createPost = async (
  req: Request<
    {},
    {},
    CreatePostRequestBody
  >,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
      throw new AppError(
        401,
        "Authenticated user is unavailable."
      );
    }

    const {
      post,
    } = req.body;

    if (!post) {
      throw new AppError(
        400,
        "Post data is required."
      );
    }

    const postType =
      post.type;

    if (!postType) {
      throw new AppError(
        400,
        "Post type is required."
      );
    }

    const title =
      post.title?.trim();

    const content =
      post.content?.trim();

    if (!title) {
      throw new AppError(
        400,
        "Post title is required."
      );
    }

    if (!content) {
      throw new AppError(
        400,
        "Post content is required."
      );
    }

    const mongoUser =
      await findMongoUser(
        clerkUserId
      );

    const newPost =
      new PostModel({
        type: postType,
        user:
          mongoUser._id,
        cover:
          post.cover?.trim() ??
          "",
        title,
        desc:
          post.desc?.trim() ??
          "",
        category:
          post.category?.trim() ||
          "general",
        content,
        tags:
          post.tags ?? [],

        readingTime:
          calculateReadingTime(
            content
          ),
        dishes:
          post.dishes ?? [],

        recipe:
          postType === "recipe"
            ? post.recipe
            : undefined,

        review:
          postType === "review"
            ? post.review
            : undefined,

        todo:
          postType === "todo"
            ? post.todo
            : undefined,

        /*
         * Only an administrator should be able
         * to create an immediately featured post.
         */
        isFeatured:
          req.currentUser?.role ===
            "admin"
            ? Boolean(
                post.isFeatured
              )
            : false,
        visit: 0,

        createdByUserId:
          clerkUserId,
        updatedByUserId:
          clerkUserId,
      });

    /*
     * save() runs the model's validation hook,
     * which creates the readable unique slug.
     */
    await newPost.save();

    await newPost.populate(
      "user",
      "username img"
    );

    const result =
      newPost.toObject() as
        unknown as PostListRecord;

    return createdResponse(
      res,
      result,
      "Post created successfully."
    );
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE POST                                                                */
/* -------------------------------------------------------------------------- */

export const updatePost = async (
  req: Request<
    {
      postId: string;
    },
    {},
    UpdatePostRequestBody
  >,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const funcName="updatePost";
  //console.log(`${modName}${funcName} entered`);
  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
        //console.log(`${modName}${funcName}Authenticated user is unavailable`);
        throw new AppError(
        401,
        "Authenticated user is unavailable."
      );
    }

    const postId =
      req.params.postId?.trim();

    if (!postId) {
        //(`${modName}${funcName} [postid is required]`);
      
      throw new AppError(
        400,
        "Post Id is required."
      );
    }

    const {
      post,
    } = req.body;

    if (!post) {
      //console.log(`${modName}${funcName} post data is required`);
      throw new AppError(
        400,
        "Post data is required."
      );
    }

    const mongoUser =
      await findMongoUser(
        clerkUserId
      );

    const existingPost =
      await PostModel.findById(
        postId,
      );

    if (!existingPost) {
      //console.log(`${modName}${funcName} post not found`);

      throw new AppError(
        404,
        "Post not found."
      );
    }

    if (
      !canModifyPost(
        existingPost.user,
        mongoUser._id,
        req.currentUser?.role
      )
    ) {
      //(`${modName}${funcName} not authorised to update post`);

      throw new AppError(
        403,
        "You are not authorised to update this post."
      );
    }

    /*
     * Assign only fields the client is
     * permitted to edit.
     *
     * Do not spread req.body directly
     * into the Mongoose document.
     */

    /* -------------------- Post type -------------------- */

    if (
      post.type !== undefined
    ) {
      existingPost.type =
        post.type;
    }

    /* -------------------- Shared fields -------------------- */

    if (
      post.title !== undefined
    ) {
      const title =
        post.title.trim();

      if (!title) {
        //(`${modName}${funcName} post title cannot be empty`);
        throw new AppError(
          400,
          "Post title cannot be empty."
        );
      }

      existingPost.title =
        title;
    }

    if (
      post.cover !== undefined
    ) {
      existingPost.cover =
        post.cover.trim();
    }

    if (
      post.desc !== undefined
    ) {
      existingPost.desc =
        post.desc.trim();
    }

    if (
      post.category !== undefined
    ) {
      existingPost.category =
        post.category.trim() ||
        "general";
    }

    if (
      post.content !== undefined
    ) {
      const content =
        post.content.trim();

      if (!content) {
        //console.log(`${modName}${funcName} post contetn cannot be empty`);

        throw new AppError(
          400,
          "Post content cannot be empty."
        );
      }

      existingPost.content =
        content;

      existingPost.readingTime =
        calculateReadingTime(
          content
        );
    }

    if (
      post.tags !== undefined
    ) {
      existingPost.tags =
        post.tags;
    }

    if (
      post.dishes !== undefined
    ) {
      existingPost.dishes =
        post.dishes;
    }

    /* -------------------- Typed sections -------------------- */

    if (
      post.recipe !== undefined
    ) {
      existingPost.recipe =
        post.recipe;
    }

    if (
      post.review !== undefined
    ) {
      existingPost.review =
        post.review;
    }

    if (
      post.todo !== undefined
    ) {
      existingPost.todo =
        post.todo;
    }

    /*
     * The model's pre-validation hook will:
     *
     * - require recipe data for recipe posts;
     * - require review data for review posts;
     * - require todo data for todo posts;
     * - clear all specialised data for note posts;
     * - remove sections belonging to other types.
     */

    /* -------------------- Featured status -------------------- */

    /*
     * Only administrators can alter
     * the featured state.
     */
    if (
      post.isFeatured !==
        undefined &&
      req.currentUser?.role ===
        "admin"
    ) {
      existingPost.isFeatured =
        post.isFeatured;
    }

    /* -------------------- Audit -------------------- */

    existingPost.updatedByUserId =
      clerkUserId;

    /*
     * The slug is deliberately not changed
     * when the title is edited, preserving
     * existing links to the post.
     *
     * save() also runs the typed-post
     * validation defined in the model.
     */
    await existingPost.save();

    await existingPost.populate(
      "user",
      "username img"
    );

    const result =
      existingPost.toObject() as
        unknown as PostListRecord;

    //console.log(`${modName}${funcName} post updated ok`);

    return successResponse(
      res,
      result,
      "Post updated successfully."
    );
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/* DELETE POST                                                                */
/* -------------------------------------------------------------------------- */

export const deletePost = async (
  req: Request<{
    slug: string;
  }>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
      throw new AppError(
        401,
        "Authenticated user is unavailable."
      );
    }

    const slug =
      req.params.slug.trim();

    if (!slug) {
      throw new AppError(
        400,
        "Post slug is required."
      );
    }

    const mongoUser =
      await findMongoUser(
        clerkUserId
      );

    const post =
      await PostModel.findOne({
        slug,
      });

    if (!post) {
      throw new AppError(
        404,
        "Post not found."
      );
    }

    if (
      !canModifyPost(
        post.user,
        mongoUser._id,
        req.currentUser?.role
      )
    ) {
      throw new AppError(
        403,
        "You are not authorised to delete this post."
      );
    }

    await PostModel.deleteOne({
      _id: post._id,
    });

    const result:
      DeletePostResult = {
        slug: post.slug,
      };

    return successResponse(
      res,
      result,
      "Post deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};