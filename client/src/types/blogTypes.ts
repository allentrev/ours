export type PostType = "recipe" | "review" | "todo" | "note"

export const POST_TYPES: PostType[] = [
  "recipe",
  "review",
  "todo",
  "note"
]

/* -------------------- Recipe -------------------- */
export interface RecipeData {
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
  venues: string[]
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
  venues: string[]
  location: TodoLocation
}

/* -------------------- Main -------------------- */
export interface PostRecord {
  type: PostType
  title: string
  desc: string
  content: string
  cover?: string

  tags: string[]
  dishes: string[]

  recipe?: RecipeData
  review?: ReviewData
  todo?: TodoData
}