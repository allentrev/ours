/* -------------------- Post Types -------------------- */
export type PostType = "recipe" | "review" | "todo" | "note"

export const POST_TYPES: PostType[] = [
  "recipe",
  "review",
  "todo",
  "note"
]

/* -------------------- Shared Types -------------------- */
export type VenueType =
  | "Hawker"
  | "Coffee_Shop"
  | "Food_Court"
  | "Mall"
  | "Restaurant"

/* -------------------- Recipe -------------------- */
export interface RecipeData {
  dish: string              // ✅ REQUIRED for recipe
  cuisines: string[]
  ingredients: string
  instructions: string
}

/* -------------------- Review -------------------- */
export interface ReviewTransport {
  busStop: string
  busNotes: string
  mrt: string
  mrtNotes: string
}

export interface ReviewTrading {
  openDays: string
  openHours: string
  closedDays: string
}

export interface ReviewLocation {
  postcode: string
  address: string
  placeName: string
}

export interface ReviewData {
  dish?: string            // ✅ OPTIONAL
  venue: VenueType
  cuisines: string[]
  location: ReviewLocation
  transport: ReviewTransport
  trading: ReviewTrading
  rating: number
}

/* -------------------- Todo -------------------- */
export interface TodoLocation {
  postcode: string
  address: string
  placeName: string
}

export interface TodoData {
  dish?: string            // ✅ OPTIONAL
  venue: VenueType
  location: TodoLocation
}

/* -------------------- Note -------------------- */
export interface NoteData {
  dish?: string            // ✅ OPTIONAL
  content: string
}

/* -------------------- Main Post (DISCRIMINATED UNION) -------------------- */
export type PostRecord =
  | {
      type: "recipe"
      title: string
      desc: string
      content: string
      cover?: string
      tags: string[]
      recipe: RecipeData
    }
  | {
      type: "review"
      title: string
      desc: string
      content: string
      cover?: string
      tags: string[]
      review: ReviewData
    }
  | {
      type: "todo"
      title: string
      desc: string
      content: string
      cover?: string
      tags: string[]
      todo: TodoData
    }
  | {
      type: "note"
      title: string
      desc: string
      content: string
      cover?: string
      tags: string[]
      note: NoteData
    }