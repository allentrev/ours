import type {
  HydratedDocument,
  Types,
} from "mongoose";

import type {
  AuditFields,
} from "./family.types.js";

/* ========================================================================== */
/* Post types                                                                 */
/* ========================================================================== */

export type PostType =
  | "recipe"
  | "review"
  | "todo"
  | "note";

export const POST_TYPES: PostType[] = [
  "recipe",
  "review",
  "todo",
  "note",
];

/* -------------------- Shared nested types -------------------- */

export interface PostAuthor {
  _id: Types.ObjectId;
  username: string;
  img?: string;
}

/* -------------------- Recipe -------------------- */

export interface RecipeData {
  cuisines: string[];
  ingredients: string;
  instructions: string;
}

/* -------------------- Review -------------------- */

export interface ReviewTransport {
  busStop: string;
  busNotes: string;
  mrt: string;
  mrtNotes: string;
}

export interface ReviewTrading {
  openDays: string;
  openHours: string;
  closedDays: string;
}

export interface ReviewLocation {
  postcode: string;
  address: string;
  placeName: string;
}

export interface ReviewData {
  venues: string[];
  cuisines: string[];

  location: ReviewLocation;
  transport: ReviewTransport;
  trading: ReviewTrading;

  rating: number;
}

/* -------------------- Todo -------------------- */

export interface TodoLocation {
  postcode: string;
  address: string;
  placeName: string;
}

export interface TodoData {
  venues: string[];
  location: TodoLocation;
}

/* ========================================================================== */
/* MongoDB Post record                                                        */
/* ========================================================================== */

/*
 * The backend storage type uses optional specialised
 * sections because Mongoose stores all Post types in
 * the same collection.
 *
 * Validation in the model ensures that the correct
 * specialised section exists for the selected type.
 */
export interface PostRecord
  extends AuditFields {
  user: Types.ObjectId;

  type: PostType;

  cover: string;
  title: string;
  slug: string;
  desc: string;
  category: string;
  content: string;

  tags: string[];
  dishes: string[];

  recipe?: RecipeData;
  review?: ReviewData;
  todo?: TodoData;

  readingTime?: number;
  isFeatured: boolean;
  visit: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type PostDocument =
  HydratedDocument<PostRecord>;

/*
 * Shape returned after populating the Mongo User field.
 */
export interface PostListRecord
  extends Omit<PostRecord, "user"> {
  user: PostAuthor;
}

/* ========================================================================== */
/* Comments                                                                   */
/* ========================================================================== */

export interface CommentRecord
  extends AuditFields {
  user: Types.ObjectId;
  post: Types.ObjectId;
  desc: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CommentDocument =
  HydratedDocument<CommentRecord>;