// models/Blog/post.model.ts

import mongoose, {
  Schema,
} from "mongoose";

import {
  randomBytes,
} from "crypto";

import slugifyPackage from "slugify";

import type {
  PostRecord,
  PostType,
} from "../../types/blog.types.js";

import {
  POST_TYPES,
} from "../../types/blog.types.js";

/*
 * NodeNext/ESM compatibility.
 */
const slugify =
  slugifyPackage.default ??
  slugifyPackage;

/* ========================================================================== */
/* Nested schemas                                                             */
/* ========================================================================== */

const recipeSchema =
  new Schema(
    {
      cuisines: {
        type: [String],
        default: [],
      },

      ingredients: {
        type: String,
        required: true,
      },

      instructions: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const reviewTransportSchema =
  new Schema(
    {
      busStop: {
        type: String,
        default: "",
      },

      busNotes: {
        type: String,
        default: "",
      },

      mrt: {
        type: String,
        default: "",
      },

      mrtNotes: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const reviewTradingSchema =
  new Schema(
    {
      openDays: {
        type: String,
        default: "",
      },

      openHours: {
        type: String,
        default: "",
      },

      closedDays: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const reviewLocationSchema =
  new Schema(
    {
      postcode: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },

      placeName: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const reviewSchema =
  new Schema(
    {
      venues: {
        type: [String],
        default: [],
      },

      cuisines: {
        type: [String],
        default: [],
      },

      location: {
        type: reviewLocationSchema,
        required: true,
      },

      transport: {
        type: reviewTransportSchema,
        required: true,
      },

      trading: {
        type: reviewTradingSchema,
        required: true,
      },

      rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
    },
    {
      _id: false,
    }
  );

const todoLocationSchema =
  new Schema(
    {
      postcode: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },

      placeName: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const todoSchema =
  new Schema(
    {
      venues: {
        type: [String],
        default: [],
      },

      location: {
        type: todoLocationSchema,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

/* ========================================================================== */
/* Post schema                                                                */
/* ========================================================================== */

const postSchema =
  new Schema<PostRecord>(
    {
      user: {
        type:
          Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: POST_TYPES,
        required: true,
        index: true,
      },

      cover: {
        type: String,
        default: "",
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
      },

      desc: {
        type: String,
        default: "",
      },

      category: {
        type: String,
        default: "general",
        trim: true,
      },

      content: {
        type: String,
        required: true,
      },

      tags: {
        type: [String],
        default: [],
      },

      dishes: {
        type: [String],
        default: [],
      },

      recipe: {
        type: recipeSchema,
      },

      review: {
        type: reviewSchema,
      },

      todo: {
        type: todoSchema,
      },

      readingTime: {
        type: Number,
        min: 0,
      },

      isFeatured: {
        type: Boolean,
        default: false,
      },

      visit: {
        type: Number,
        default: 0,
        min: 0,
      },

      createdByUserId: {
        type: String,
      },

      updatedByUserId: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

/* ========================================================================== */
/* Typed-post validation                                                      */
/* ========================================================================== */

postSchema.pre(
  "validate",
  function () {
    switch (this.type) {
      case "recipe":
        if (!this.recipe) {
          this.invalidate(
            "recipe",
            "Recipe data is required for a recipe post."
          );
        }

        this.review = undefined;
        this.todo = undefined;
        break;

      case "review":
        if (!this.review) {
          this.invalidate(
            "review",
            "Review data is required for a review post."
          );
        }

        this.recipe = undefined;
        this.todo = undefined;
        break;

      case "todo":
        if (!this.todo) {
          this.invalidate(
            "todo",
            "Todo data is required for a todo post."
          );
        }

        this.recipe = undefined;
        this.review = undefined;
        break;

      case "note":
        /*
         * Notes use the main content field and
         * have no specialised nested section.
         */
        this.recipe = undefined;
        this.review = undefined;
        this.todo = undefined;
        break;

      default:
        this.invalidate(
          "type",
          "A valid post type is required."
        );
    }
  }
);

/* ========================================================================== */
/* Slug generation                                                           */
/* ========================================================================== */

postSchema.pre(
  "validate",
  async function () {
    if (this.slug) {
      return;
    }

    const titleSlug =
      slugify(this.title, {
        lower: true,
        strict: true,
        trim: true,
      }) || "post";

    const PostModel =
      this.constructor as
        mongoose.Model<PostRecord>;

    let slug = "";

    do {
      const suffix =
        randomBytes(3).toString(
          "hex"
        );

      slug =
        `${titleSlug}-${suffix}`;
    } while (
      await PostModel.exists({
        slug,
      })
    );

    this.slug = slug;
  }
);

/* ========================================================================== */
/* Indexes                                                                    */
/* ========================================================================== */

postSchema.index({
  category: 1,
  createdAt: -1,
});

postSchema.index({
  type: 1,
  createdAt: -1,
});

postSchema.index({
  tags: 1,
});

postSchema.index({
  dishes: 1,
});

postSchema.index({
  isFeatured: 1,
  createdAt: -1,
});

postSchema.index({
  visit: -1,
});

/* ========================================================================== */
/* Model                                                                      */
/* ========================================================================== */

export const PostModel =
  mongoose.model<PostRecord>(
    "Post",
    postSchema
  );
