import PostListItem from "./PostListItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import type { PostsResponse } from "../../types/blogTypes";

const fetchPosts = async (
    pageParam: number,
    searchParams: URLSearchParams
): Promise<PostsResponse> => {
  const searchParamsObj = Object.fromEntries([...searchParams]);
  console.log("PostList SearchPraramsObj");
  console.log([...searchParams.entries()]);

  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObj },
  });
  return res.data;
};

const PostList = () => {
  const [ searchParams ] = useSearchParams();

  const {
      data,
      error,
      fetchNextPage,
      hasNextPage,
      isFetching,
  } = useInfiniteQuery({
      queryKey: ["posts", searchParams.toString()],
      queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  // if (status === "loading") return "Loading...";
  if (isFetching) return "Loading...";
  

  // if (status === "error") return "Something went wrong!";
  if (error) return "Something went wrong!";
  // this takes each entry in a page and adds to a single array
  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];
  console.log("Client PageList, data");
  console.log(data);
  return (
    <InfiniteScroll
      dataLength={allPosts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more posts...</h4>}
      endMessage={
        <p>
          <b>All posts loaded!</b>
        </p>
      }
    >
      {allPosts.map((post) => (
        <PostListItem key={post._id} post={post} />
      ))}
    </InfiniteScroll>
  );
};

export default PostList;