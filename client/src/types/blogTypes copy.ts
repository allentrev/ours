export const POST_TYPES = ["todo", "review", "recipe", "note"] as const;

export type PostType = typeof POST_TYPES[number];

export type PostBase = {
  type: PostType;
  title: string;
  desc: string;
  content: string;
  cover?: string;

  tags: string[];
  dishes: string[];

  placeName?: string;
  location?: string;
  rating?: number;
  cookingTime?: number;
  ingredients?: string;
};

export type PostRecord = PostBase;
export type WriteFormData = PostBase;