import PostListItem from "./PostListItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import { readPosts } from "../../utilities/blogUtils";


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
      queryFn: ({ pageParam = 1 }) => readPosts(pageParam, searchParams),
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