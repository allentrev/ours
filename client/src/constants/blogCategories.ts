// utilities/Blog/blogCategories.ts

import type {
  PostType,
} from "../types/blogTypes";

export interface BlogCategory {
  value: PostType;
  label: string;
}

export const BLOG_CATEGORIES:
  BlogCategory[] = [
  {
    value: "recipe",
    label: "Recipes",
  },
  {
    value: "review",
    label: "Reviews",
  },
  {
    value: "todo",
    label: "To Do",
  },
  {
    value: "note",
    label: "Notes",
  },
];