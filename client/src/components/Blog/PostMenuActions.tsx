import { useUser, useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { PostRecord } from "../../types/blogTypes";

type Props = {
  post: PostRecord;
  isEditMode: boolean;
  onEditToggle: () => void;
  editData: {
    title: string;
    desc: string;
    content: string;
  };
};

const PostMenuActions = ({ post, isEditMode, onEditToggle, editData }: Props) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = user?.publicMetadata?.role === "admin" || false;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.delete(`${import.meta.env.VITE_BACKEND_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Post deleted successfully!");
      navigate("/blog");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/posts/${post._id}`,
        { title: editData.title, desc: editData.desc, content: editData.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["post", post.slug] });
      onEditToggle();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  });

  const featureMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/feature`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", post.slug] }),
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  });

  return (
    <div>
      <h1 className="mt-8 mb-4 text-sm font-medium">Actions</h1>

      {/* Edit Post */}
      <div
        className="flex items-center gap-2 py-2 text-sm cursor-pointer"
        onClick={onEditToggle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>{isEditMode ? "Cancel Edit" : "Edit Post"}</span>
      </div>

      {/* Save changes — only visible in edit mode */}
      {isEditMode && (
        <div
          className="flex items-center gap-2 py-2 text-sm cursor-pointer text-blue-700"
          onClick={() => updateMutation.mutate()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save Changes</span>
          {updateMutation.isPending && <span className="text-xs">(saving...)</span>}
        </div>
      )}

      {/* Feature — admin only */}
      {isAdmin && (
        <div
          className="flex items-center gap-2 py-2 text-sm cursor-pointer"
          onClick={() => featureMutation.mutate()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
            <path
              d="M24 2L29.39 16.26L44 18.18L33 29.24L35.82 44L24 37L12.18 44L15 29.24L4 18.18L18.61 16.26L24 2Z"
              stroke="black"
              strokeWidth="2"
              fill={featureMutation.isPending ? "black" : "none"}
            />
          </svg>
          <span>Feature</span>
          {featureMutation.isPending && <span className="text-xs">(in progress)</span>}
        </div>
      )}

      {/* Delete */}
      {user && (post.user.username === user.username || isAdmin) && (
        <div
          className="flex items-center gap-2 py-2 text-sm cursor-pointer"
          onClick={() => deleteMutation.mutate()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="red" width="20px" height="20px">
            <path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10.154297 7 A 1.0001 1.0001 0 0 0 9.984375 6.9863281 A 1.0001 1.0001 0 0 0 9.8398438 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.645455 10.354545 48 12 48 L 38 48 C 39.645455 48 41 46.645455 41 45 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40.167969 7 A 1.0001 1.0001 0 0 0 39.841797 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 45 C 39 45.554545 38.554545 46 38 46 L 12 46 C 11.445455 46 11 45.554545 11 45 L 11 9 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 30.984375 13.986328 A 1.0001 1.0001 0 0 0 30 15 L 30 40 A 1.0001 1.0001 0 1 0 32 40 L 32 15 A 1.0001 1.0001 0 0 0 30.984375 13.986328 z" />
          </svg>
          <span>Delete this Post</span>
          {deleteMutation.isPending && <span className="text-xs">(in progress)</span>}
        </div>
      )}
    </div>
  );
};

export default PostMenuActions;