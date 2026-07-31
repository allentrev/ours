// components/Blog/BlogControls.tsx

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Search from "./Search";

import {
  BLOG_CATEGORIES,
} from "../../constants/blogCategories";

const BlogControls = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const selectedType =
    searchParams.get("type") ?? "";

  const updateCategory = (
    category: string
  ) => {
    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (category) {
      nextParams.set(
        "type",
        category
      );
    } else {
      nextParams.delete(
        "type"
      );
    }

    /*
     * Reset paging whenever
     * the filter changes.
     */
    nextParams.delete(
      "page"
    );

    setSearchParams(
      nextParams
    );
  };

  return (
    <div
      className="
        flex flex-col gap-2
        border-y border-gray-200
        py-2

        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      {/* Categories */}

      <div className="min-w-0 flex-1">

        {/* Mobile */}

        <select
          value={selectedType}
          onChange={(event) =>
            updateCategory(
              event.target.value
            )
          }
          className="
            w-full
            rounded-full
            border
            border-gray-300
            bg-white
            px-3
            py-1.5
            text-sm

            md:hidden
          "
        >
          <option value="">
            All Categories
          </option>

          {BLOG_CATEGORIES.map(
            (category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            )
          )}
        </select>

        {/* Desktop */}

        <div
          className="
            hidden
            flex-wrap
            gap-2

            md:flex
          "
        >
          <button
            type="button"
            onClick={() =>
              updateCategory("")
            }
            className={`rounded-full px-3 py-1 text-sm ${
              selectedType === ""
                ? "bg-blue-800 text-white"
                : "border border-gray-300 hover:bg-gray-100"
            }`}
          >
            All
          </button>

          {BLOG_CATEGORIES.map(
            (category) => (
              <button
                key={category.value}
                type="button"
                onClick={() =>
                  updateCategory(
                    category.value
                  )
                }
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedType ===
                  category.value
                    ? "bg-blue-800 text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {category.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Search + Write */}

      <div className="flex items-center gap-2 md:ml-4">

        <div className="flex-1">
          <Search
            searchCurrentPage
            compact
          />
        </div>

        <Link
          to="write"
          className="
            shrink-0
            rounded-full
            bg-blue-800
            px-3
            py-1.5
            text-sm
            font-medium
            text-white
            hover:bg-blue-700
          "
        >
          Write
          <span className="hidden sm:inline">
            {" "}Post
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BlogControls;