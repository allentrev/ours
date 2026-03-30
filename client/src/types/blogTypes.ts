/* -------------------- Post Types -------------------- */
export type PostType = "recipe" | "review" | "todo" | "note";

export const POST_TYPES: PostType[] = [
  "recipe",
  "review",
  "todo",
  "note",
];

/* -------------------- Shared Base Content -------------------- */
type BasePostContent = {
  title: string;
  desc: string;
  content: string;
  cover?: string;
  tags: string[];
};

/* -------------------- Database Meta -------------------- */
type PostMeta = {
  _id: string;
  userId: string;
  slug: string;
  user?: {
    _id: string;
    username: string;
    img?: string;
  };
};

/* -------------------- Shared Types -------------------- */
export type VenueType =
  | "Hawker"
  | "Coffee_Shop"
  | "Food_Court"
  | "Mall"
  | "Restaurant";

/* -------------------- Recipe -------------------- */
export interface RecipeData {
  dish: string;
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
  dish?: string;
  venue: VenueType;
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
  dish?: string;
  venue: VenueType;
  location: TodoLocation;
}

/* -------------------- Note -------------------- */
export interface NoteData {
  dish?: string;
}

/* -------------------- Post Content (Discriminated Union) -------------------- */
export type PostContent =
  | (BasePostContent & {
      type: "recipe";
      recipe: RecipeData;
    })
  | (BasePostContent & {
      type: "review";
      review: ReviewData;
    })
  | (BasePostContent & {
      type: "todo";
      todo: TodoData;
    })
  | (BasePostContent & {
      type: "note";
      note: NoteData;
    });

/* -------------------- Final Types -------------------- */
export type PostFormData = BasePostContent & {
  type: PostType;

  recipe?: RecipeData;
  review?: ReviewData;
  todo?: TodoData;
  note?: NoteData;
};

/** Used when creating a post (frontend → backend) */
export type CreatePost = PostContent;

/** Used when reading posts (API response) */
export type PostRecord = PostContent & PostMeta;

/* -------------------- API Responses -------------------- */
export interface PostsResponse {
  posts: PostRecord[];
  hasMore: boolean;
}