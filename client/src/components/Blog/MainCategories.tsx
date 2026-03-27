import { Link } from "react-router-dom";
import Search from "./Search";

const MainCategories = () => {
  return (
    <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-8">
      {/* links */}
      <div className="flex-1 flex items-center justify-between flex-wrap">
        <Link
          to="/blog/posts"
          className="bg-blue-800 text-white rounded-full px-4 py-2"
        >
          All Posts
        </Link>
        <Link
          to="/blog/posts?cat=venue"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Venue
        </Link>
        <Link
          to="/blog/posts?cat=articles"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Articles
        </Link>
        <Link
          to="/blog/posts?cat=places"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Places
        </Link>
        <Link
          to="/blog/posts?cat=cuisine"
          className="hover:bg-blue-50 rounded-full px-4 py-2"
        >
          Cuisine
        </Link>
      </div>
      <span className="text-xl font-medium">|</span>
      {/* search */}
      <Search/>
    </div>
  );
};

export default MainCategories;