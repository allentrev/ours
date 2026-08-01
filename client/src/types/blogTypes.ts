// types/blogTypes.ts

/* ========================================================================== */
/* General API response                                                       */
/* ========================================================================== */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  details?: unknown;
}

/* ========================================================================== */
/* Post type                                                                  */
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

/* ========================================================================== */
/* Shared post data                                                           */
/* ========================================================================== */

export interface PostAuthor {
  _id: string;
  username: string;
  img?: string;
}

/*
 * Fields shared by every post type and edited
 * through the main Write page.
 */
export interface BasePostFormData {
  title: string;
  desc: string;
  content: string;

  cover?: string;

  category: string;

  tags: string[];
  dishes: string[];

  isFeatured: boolean;
}

/* ========================================================================== */
/* Recipe                                                                     */
/* ========================================================================== */

export interface RecipeData {
  cuisines: string[];
  ingredients: string;
  instructions: string;
}

/* ========================================================================== */
/* Review                                                                     */
/* ========================================================================== */

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

/* ========================================================================== */
/* Todo                                                                       */
/* ========================================================================== */

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
/* Typed post form data                                                       */
/* ========================================================================== */

/*
 * This discriminated union ensures each post type
 * carries only the additional data appropriate to it.
 *
 * Notes use BasePostFormData.content and therefore
 * require no separate NoteData object.
 */
export type PostFormData =
  | (
      BasePostFormData & {
        type: "recipe";
        recipe: RecipeData;

        review?: never;
        todo?: never;
      }
    )
  | (
      BasePostFormData & {
        type: "review";
        review: ReviewData;

        recipe?: never;
        todo?: never;
      }
    )
  | (
      BasePostFormData & {
        type: "todo";
        todo: TodoData;

        recipe?: never;
        review?: never;
      }
    )
  | (
      BasePostFormData & {
        type: "note";

        recipe?: never;
        review?: never;
        todo?: never;
      }
    );

/* ========================================================================== */
/* Write payloads                                                             */
/* ========================================================================== */

/*
 * Payload sent when creating a post.
 *
 * Database fields such as _id, user, slug, readingTime,
 * visit and timestamps are assigned by the backend.
 */
export type CreatePost =
  PostFormData;

/*
 * Payload sent when updating a post.
 *
 * This allows partial updates while retaining the slug
 * used to identify the existing post.
 */
export type UpdatePost =
  Partial<PostFormData>;

/* ========================================================================== */
/* Post returned by API                                                       */
/* ========================================================================== */

export interface PostApiMeta {
  _id: string;

  user: PostAuthor;

  slug: string;

  readingTime?: number;
  visit: number;

  createdByUserId?: string;
  updatedByUserId?: string;

  createdAt: string;
  updatedAt: string;
}

/*
 * The complete post returned by the API.
 *
 * Because PostFormData is a discriminated union,
 * checking post.type narrows the corresponding
 * specialised data automatically.
 */
export type PostRecord =
  PostFormData &
  PostApiMeta;

/* ========================================================================== */
/* API result types                                                           */
/* ========================================================================== */

export interface PostsResponse {
  posts: PostRecord[];
  hasMore: boolean;
}

export interface DeletePostResult {
  slug: string;
}