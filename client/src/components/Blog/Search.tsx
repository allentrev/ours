import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

interface SearchProps {
  /*
   * true:
   * Apply the search to the current page.
   *
   * false:
   * Navigate to /blog/posts.
   */
  searchCurrentPage?: boolean;

  compact?: boolean;
}

const Search = ({
  searchCurrentPage = false,
  compact = false,
}: SearchProps) => {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    query,
    setQuery,
  ] = useState(
    searchParams.get("search") ?? ""
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (searchCurrentPage) {
      const nextParams =
        new URLSearchParams(
          searchParams
        );

      if (trimmedQuery) {
        nextParams.set(
          "search",
          trimmedQuery
        );
      } else {
        nextParams.delete(
          "search"
        );
      }

      nextParams.delete(
        "page"
      );

      setSearchParams(
        nextParams
      );

      return;
    }

    const params =
      new URLSearchParams();

    if (trimmedQuery) {
      params.set(
        "search",
        trimmedQuery
      );
    }

    navigate(
      `/blog/posts?${params.toString()}`
    );
  };

  const clearSearch = () => {
    setQuery("");

    if (searchCurrentPage) {
      const nextParams =
        new URLSearchParams(
          searchParams
        );

      nextParams.delete(
        "search"
      );

      nextParams.delete(
        "page"
      );

      setSearchParams(
        nextParams
      );
    }
  };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className={
        "flex min-w-0 items-center rounded-full bg-gray-100 " +
        (
          compact
            ? "px-2 py-1"
            : "p-2"
        )
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="gray"
        className="shrink-0"
      >
        <circle
          cx="10.5"
          cy="10.5"
          r="7.5"
        />

        <line
          x1="16.5"
          y1="16.5"
          x2="22"
          y2="22"
        />
      </svg>

      <input
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(
            event.target.value
          )
        }
        placeholder="Search posts..."
        className="
          min-w-0 flex-1
          bg-transparent px-2
          text-sm outline-none
        "
      />

      {query && (
        <button
          type="button"
          title="Clear search"
          onClick={
            clearSearch
          }
          className="
            shrink-0 px-1
            text-gray-500
            hover:text-gray-800
          "
        >
          ×
        </button>
      )}

      <button
        type="submit"
        className="
          shrink-0 rounded-full
          bg-gray-700 px-3 py-1
          text-sm text-white
          hover:bg-gray-800
        "
      >
        Search
      </button>
    </form>
  );
};

export default Search;