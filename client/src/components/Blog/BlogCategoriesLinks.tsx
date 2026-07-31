// components/Blog/BlogCategoryLinks.tsx

import {
  Link,
} from "react-router-dom";

import {
  BLOG_CATEGORIES,
} from "../../constants/blogCategories";

const BlogCategoryLinks = () => {
  return (
    <nav
      aria-label="Blog categories"
      className="flex flex-col gap-2 text-sm"
    >
      <Link
        to="/blog"
        className="text-blue-800 hover:underline"
      >
        All posts
      </Link>

      {BLOG_CATEGORIES.map(
        (category) => (
          <Link
            key={category.value}
            to={
              `/blog?type=${category.value}`
            }
            className="text-blue-800 hover:underline"
          >
            {category.label}
          </Link>
        )
      )}
    </nav>
  );
};

export default BlogCategoryLinks;