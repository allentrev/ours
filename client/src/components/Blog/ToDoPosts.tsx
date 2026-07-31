// components/Blog/ToDoPosts.tsx

import {
  Link,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  readPosts,
} from "../../utilities/blogUtils";

const ToDoPosts = () => {
  const {
    isPending,
    error,
    data,
  } = useQuery({
    queryKey: [
      "todo-posts",
    ],

    queryFn: () => {
      const searchParams =
        new URLSearchParams({
          type: "todo",
          sort: "newest",
        });

      return readPosts(
        1,
        searchParams,
        4
      );
    },

    staleTime:
      5 * 60 * 1000,
  });

  if (isPending) {
    return (
      <div className="text-sm text-gray-500">
        Loading Todo posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-700">
        {error instanceof Error
          ? error.message
          : "Failed to load Todo posts."}
      </div>
    );
  }

  const posts =
    data.posts.slice(0, 4);

  if (posts.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No Todo posts found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => (
        <Link
          key={post._id}
          to={`/blog/${post.slug}`}
          className="
            rounded border
            border-gray-200
            bg-white px-3 py-2
            text-blue-800
            hover:bg-blue-50
            hover:underline
          "
        >
          {post.title}
        </Link>
      ))}
    </div>
  );
};

export default ToDoPosts;