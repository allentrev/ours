import {
  Link,
} from "react-router-dom";

import type {
  PostRecord,
} from "../../types/blogTypes";

interface PostListItemProps {
  post: PostRecord;
}

const PostListItem = ({
  post,
}: PostListItemProps) => {
  const postUrl =
    `/blog/${post.slug}`;

  return (
    <article className="border-b border-gray-200 py-3">
      <div className="flex items-start gap-3">
        {post.cover && (
          <Link
            to={postUrl}
            className="hidden shrink-0 sm:block"
          >
            <img
              src={post.cover}
              alt=""
              className="
                h-20
                w-28
                rounded-lg
                object-cover
              "
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <h3>
            <Link
              to={postUrl}
              className="
                block
                text-xl
                font-medium
                text-gray-800
                hover:text-blue-800
                transition-colors
              "
            >
              {post.title}
            </Link>
          </h3>

          {post.desc && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600">
              {post.desc}
            </p>
          )}
        </div>

        <Link
          to={postUrl}
          className="
            shrink-0
            self-center
            text-sm
            font-medium
            text-blue-800
            hover:underline
          "
        >
          More →
        </Link>
      </div>
    </article>
  );
};

export default PostListItem;