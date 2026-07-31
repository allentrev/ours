// utilities/blogUtils.ts

import axios from "axios";

import type {
  ApiResponse,
  CreatePost,
  DeletePostResult,
  PostRecord,
  PostsResponse,
  UpdatePost,
} from "../types/blogTypes";

const API_URL =
  import.meta.env.VITE_BACKEND_URL;

/* -------------------- API response helper -------------------- */

const readApiResponse = async <T>(
  res: Response,
  fallbackMessage: string
): Promise<T> => {
  let response: ApiResponse<T>;
  try {
    response =
      (await res.json()) as ApiResponse<T>;
    console.log(response);
  } catch {
    throw new Error(
      fallbackMessage
    );
  }

  if (!res.ok || !response.success) {
    throw new Error(
      response.errors?.join("\n") ||
        response.message ||
        fallbackMessage
    );
  }

  if (response.data === undefined) {
    throw new Error(
      "The server returned no data."
    );
  }

  return response.data;
};

/* ========================================================================== */
/* Posts                                                                      */
/* ========================================================================== */

/* -------------------- READ POSTS -------------------- */

export const readPosts = async (
  page: number,
  searchParams: URLSearchParams,
  limit = 10
): Promise<PostsResponse> => {
  const params =
    new URLSearchParams(
      searchParams
    );

  params.set(
    "page",
    String(page)
  );

  params.set(
    "limit",
    String(limit)
  );

  const url =
    `${API_URL}/posts?${params.toString()}`;

  const res =
    await fetch(url);

  return readApiResponse<PostsResponse>(
    res,
    "Failed to retrieve posts."
  );
};

export const fetchPosts1 = async (
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

export const fetchPostsNew = async (
  pageParam: number,
  searchParams: URLSearchParams
): Promise<PostsResponse> => {
  const searchParamsObject =
    Object.fromEntries(
      searchParams.entries()
    );

  const response = await axios.get<
    ApiResponse<PostsResponse>
  >(
    `${import.meta.env.VITE_BACKEND_URL}/posts`,
    {
      params: {
        page: pageParam,
        limit: 10,
        ...searchParamsObject,
      },
    }
  );

  if (
    !response.data.success ||
    !response.data.data
  ) {
    throw new Error(
      response.data.errors?.join("\n") ||
        response.data.message ||
        "Failed to retrieve posts."
    );
  }

  return response.data.data;
};

export const featurePost = async (
  postId: string,
  token: string
): Promise<PostRecord> => {
  const res = await fetch(
    `${API_URL}/posts/feature`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        postId,
      }),
    }
  );

  return readApiResponse<PostRecord>(
    res,
    "Failed to change featured status."
  );
};

/* -------------------- READ FEATURED POSTS -------------------- */

export const readFeaturedPosts =
  async (): Promise<PostRecord[]> => {
    const params =
      new URLSearchParams({
        featured: "true",
        limit: "4",
        sort: "newest",
      });

    const url =
      `${API_URL}/posts?${params.toString()}`;

    const res = await fetch(url);

    const result =
      await readApiResponse<
        PostsResponse
      >(
        res,
        "Failed to retrieve featured posts."
      );

    return result.posts;
  };

/* -------------------- CREATE POST -------------------- */

export const createPost = async (
  post: CreatePost,
  token: string
): Promise<PostRecord> => {
  const url =
    `${API_URL}/posts`;

  const res = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",

      Authorization:
        `Bearer ${token}`,
    },

    body: JSON.stringify({
      post,
    }),
  });

  return readApiResponse<PostRecord>(
    res,
    "Failed to create post."
  );
};

/* -------------------- READ ONE POST -------------------- */
//
export const readPost = async (
  slug: string
): Promise<PostRecord> => {
  const url =
    `${API_URL}/posts/${encodeURIComponent(
      slug
    )}`;

  const res = await fetch(url);

  return readApiResponse<PostRecord>(
    res,
    "Failed to retrieve post."
  );
};

/* -------------------- UPDATE POST -------------------- */

export const updatePost = async (
  postId: string,
  post: UpdatePost,
  token: string
): Promise<PostRecord> => {
  const url =
    `${API_URL}/posts/${encodeURIComponent(
      postId
    )}`;

  const res = await fetch(url, {
    method: "PUT",

    headers: {
      "Content-Type":
        "application/json",

      Authorization:
        `Bearer ${token}`,
    },

    body: JSON.stringify({
      post,
    }),
  });

  return readApiResponse<PostRecord>(
    res,
    "Failed to update post."
  );
};

/* -------------------- DELETE POST -------------------- */

export const deletePost = async (
  postId: string,
  token: string
): Promise<DeletePostResult> => {
  const url =
    `${API_URL}/posts/${encodeURIComponent(
      postId
    )}`;

  const res = await fetch(url, {
    method: "DELETE",

    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  });

  return readApiResponse<
    DeletePostResult
  >(
    res,
    "Failed to delete post."
  );
};

/* ========================================================================== */
/* Comments                                                                   */
/* ========================================================================== */

/*
 * Comments still use the previous Axios API pattern.
 * Convert these after the Comment controllers have
 * been migrated to ApiResponse<T>.
 */

export const createComment = async ({
  postId,
  newComment,
  token,
}: {
  postId: string;
  newComment: {
    desc: string;
  };
  token: string | null;
}) => {
  if (!token) {
    throw new Error(
      "No authentication token."
    );
  }

  const res = await axios.post(
    `${API_URL}/comments/${postId}`,
    newComment,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteComment = async ({
  commentId,
  token,
}: {
  commentId: string;
  token: string | null;
}) => {
  if (!token) {
    throw new Error(
      "No authentication token."
    );
  }

  const res = await axios.delete(
    `${API_URL}/comments/${commentId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const fetchComments = async (
  postId: string
) => {
  const res = await axios.get(
    `${API_URL}/comments/${postId}`
  );

  return res.data;
};