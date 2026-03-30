import { Link } from "react-router-dom";
import { format } from "timeago.js";

//TODO get rid of hard coded username
const PostListItem = ({ post}) => {
  const user = post.user;
  let userName = "";
  if (!user) {
    userName = "allentrev99"
  } else {
    userName = user.username;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 mb-12">
      {/* Cover image */}
      {post.cover && (
        <div className="md:hidden xl:block xl:w-1/3">
          <img src={post.cover} className="rounded-2xl object-cover w-full max-h-68" width="735" />
        </div>
      )}
      {/* details */}
      <div className="flex flex-col gap-4 xl:w-2/3">
        <Link to={`/blog/${post.slug}`} className="text-4xl font-semibold">
          {post.title}
        </Link>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>Written by</span>
          <Link className="text-blue-800" to={`/posts?author=${userName}`}>{userName}</Link>
          <span>on</span>
          <Link className="text-blue-800" to={`/posts?category=${post.category}`}>{post.category}</Link>
          <span>{format(post.createdAt)}</span>
        </div>
        <p>{post.desc}</p>
        <Link to={`/blog/${post.slug}`} className="underline text-blue-800 text-sm">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default PostListItem;