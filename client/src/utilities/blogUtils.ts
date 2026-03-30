// utilities/blogUtils.ts
import axios from "axios";
import type { PostRecord,CreatePost } from "../types/blogTypes";

// API URL helper
const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchPost = async () => {
  console.log("blogUtils fetchPost");
  console.log("API URL:", import.meta.env.VITE_BACKEND_URL);

  const res = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/posts?featured=true&limit=4&sort=newest`
  );
  return res.data;
};

export const createComment = async ({
  postId,
  newComment,
  token,
}: {
  postId: string;
  newComment: { desc: string };
  token: string | null;
}) => {
    if (!token) throw new Error("No authentication token");
    const res = await axios.post(
        `${API_URL}/comments/${postId}`,
        newComment,
        {
        headers: {
            Authorization: `Bearer ${token}`,
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
    if (!token) throw new Error("No authentication token");
    const res = await axios.delete(
        `${API_URL}/comments/${commentId}`,
        {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        }
    );
    return res.data;
};


export const fetchComments = async (postId: string) => {
  const res = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/comments/${postId}`
  );
  return res.data;
};

/**
export const createPost = async (
  newPost: PostRecord,
  token: string | null,
): Promise<PostRecord> =>{

    if (!token) throw new Error("No authentication token");
    const res = await axios.post(
        `${API_URL}/posts`,
        newPost,
        {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        }
    );
  return res.data;
};
*/

export const createPost = async (
  post: CreatePost,
  token: string | null
): Promise<PostRecord> => {

  const res = await axios.post(
    `${API_URL}/posts`,
    post,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data
}
