import {
  Link,
} from "react-router-dom";

import PostList from "../../components/Blog/PostList";
import BlogControls from "../../components/Blog/BlogControls";

/*
 * py-2 controls the vertical height of the Categories/Write bar.
 * gap-2 controls spacing between the main page sections.
 * mt-2 controls spacing above the introduction paragraphs.
 * mb-2 controls spacing below "Recent Posts".
 */

const BlogHomePage = () => {
  return (
    <div className="flex flex-col gap-2">
      {/* Categories and write button */}

      <div className="flex items-center justify-between gap-3 border-y border-gray-200 py-2">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <BlogControls />
        </div>

      </div>

      {/* Introduction */}

      <section className="max-w-4xl">
        <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
          Exploring Singapore, one bite at a time
        </h1>

        <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600 sm:text-base">
          <p>
            This is a collection of recipes, reviews, notes, and places that
            have caught our interest.
          </p>

          <p>
            Some entries record places we have already visited, while others
            are reminders of food and locations still waiting to be explored.
          </p>

          <p>
            Follow the categories above to browse a particular type of post,
            or start with the most recent entries below.
          </p>
        </div>
      </section>

      {/* Recent posts */}

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gray-700">
          Recent Posts
        </h2>

        <PostList />
      </section>
    </div>
  );
};

export default BlogHomePage;