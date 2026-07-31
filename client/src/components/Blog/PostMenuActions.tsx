// components/Blog/PostMenuActions.tsx

import {
  useAuth,
  useUser,
} from "@clerk/clerk-react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  deletePost,
  featurePost,
  updatePost,
} from "../../utilities/blogUtils";

import type {
  PostRecord,
  UpdatePost,
} from "../../types/blogTypes";

interface PostMenuActionsProps {
  post: PostRecord;
  isEditMode: boolean;
  onEditToggle: () => void;

  editData: {
    title: string;
    desc: string;
    content: string;
  };
}

const PostMenuActions = ({
  post,
  isEditMode,
  onEditToggle,
  editData,
}: PostMenuActionsProps) => {
  const {
    user,
  } = useUser();

  const {
    getToken,
  } = useAuth();

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const isAdmin =
    user?.publicMetadata?.role ===
    "admin";

  const isAuthor =
    Boolean(
      user &&
      post.user?.username ===
        user.username
    );

  const canModify =
    isAuthor || isAdmin;

  const getAuthToken =
    async (): Promise<string> => {
      const token =
        await getToken({
          skipCache: true,
        });

      if (!token) {
        throw new Error(
          "Authentication token is unavailable."
        );
      }

      return token;
    };

  /* -------------------- Delete -------------------- */

  const deleteMutation =
    useMutation({
      mutationFn: async () => {
        const token =
          await getAuthToken();

        return deletePost(
          post._id,
          token
        );
      },

      onSuccess: async () => {
        toast.success(
          "Post deleted successfully."
        );

        await queryClient.invalidateQueries({
          queryKey: [
            "posts",
          ],
        });

        navigate(
          "/blog"
        );
      },

      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete post."
        );
      },
    });

  /* -------------------- Update -------------------- */

  const updateMutation =
    useMutation({
      mutationFn: async () => {
        const token =
          await getAuthToken();

        const changes:
          UpdatePost = {
            title:
              editData.title,

            desc:
              editData.desc,

            content:
              editData.content,
          };

        return updatePost(
          post._id,
          changes,
          token
        );
      },

      onSuccess: async (
        updatedPost
      ) => {
        /*
         * Update the current query immediately,
         * then refresh any post-list queries.
         */
        queryClient.setQueryData(
          [
            "post",
            post.slug,
          ],
          updatedPost
        );

        await queryClient.invalidateQueries({
          queryKey: [
            "posts",
          ],
        });

        toast.success(
          "Post updated successfully."
        );

        onEditToggle();
      },

      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update post."
        );
      },
    });

  /* -------------------- Feature -------------------- */

  const featureMutation =
    useMutation({
      mutationFn: async () => {
        const token =
          await getAuthToken();

        return featurePost(
          post._id,
          token
        );
      },

      onSuccess: async (
        updatedPost
      ) => {
        queryClient.setQueryData(
          [
            "post",
            post.slug,
          ],
          updatedPost
        );

        await queryClient.invalidateQueries({
          queryKey: [
            "posts",
          ],
        });

        toast.success(
          updatedPost.isFeatured
            ? "Post featured successfully."
            : "Post removed from featured posts."
        );
      },

      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to change featured status."
        );
      },
    });

  const handleDelete = () => {
    const confirmed =
      window.confirm(
        `Delete "${post.title}"? This cannot be undone.`
      );

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  return (
    <section>
      <h2 className="mb-2 mt-8 text-sm font-medium">
        Actions
      </h2>

      {/* Edit or cancel */}

      <button
        type="button"
        onClick={
          onEditToggle
        }
        disabled={
          updateMutation.isPending
        }
        className="
          flex w-full items-center
          gap-2 py-2 text-left
          text-sm
          hover:text-blue-800
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>

        <span>
          {isEditMode
            ? "Cancel Edit"
            : "Edit Post"}
        </span>
      </button>

      {/* Save */}

      {isEditMode && (
        <button
          type="button"
          onClick={() =>
            updateMutation.mutate()
          }
          disabled={
            updateMutation.isPending
          }
          className="
            flex w-full items-center
            gap-2 py-2 text-left
            text-sm text-blue-700
            hover:text-blue-900
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>

          <span>
            {updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </span>
        </button>
      )}

      {/* Feature — admin only */}

      {isAdmin && (
        <button
          type="button"
          onClick={() =>
            featureMutation.mutate()
          }
          disabled={
            featureMutation.isPending
          }
          className="
            flex w-full items-center
            gap-2 py-2 text-left
            text-sm
            hover:text-blue-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path
              d="M24 2L29.39 16.26L44 18.18L33 29.24L35.82 44L24 37L12.18 44L15 29.24L4 18.18L18.61 16.26L24 2Z"
              stroke="currentColor"
              strokeWidth="2"
              fill={
                post.isFeatured
                  ? "currentColor"
                  : "none"
              }
            />
          </svg>

          <span>
            {featureMutation.isPending
              ? "Updating..."
              : post.isFeatured
                ? "Remove Featured"
                : "Feature Post"}
          </span>
        </button>
      )}

      {/* Delete */}

      {canModify && (
        <button
          type="button"
          onClick={
            handleDelete
          }
          disabled={
            deleteMutation.isPending
          }
          className="
            flex w-full items-center
            gap-2 py-2 text-left
            text-sm text-red-700
            hover:text-red-900
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M21 2C19.3545 2 18 3.3545 18 5V7H10.1543A1 1 0 0 0 9.9844 6.9863A1 1 0 0 0 9.8398 7H8A1 1 0 1 0 8 9H9V45C9 46.6455 10.3545 48 12 48H38C39.6455 48 41 46.6455 41 45V9H42A1 1 0 1 0 42 7H40.168A1 1 0 0 0 39.8418 7H32V5C32 3.3545 30.6455 2 29 2H21ZM21 4H29C29.5545 4 30 4.4455 30 5V7H20V5C20 4.4455 20.4455 4 21 4ZM11 9H39V45C39 45.5545 38.5545 46 38 46H12C11.4455 46 11 45.5545 11 45V9ZM19 14A1 1 0 0 0 18 15V40A1 1 0 1 0 20 40V15A1 1 0 0 0 19 14ZM25 14A1 1 0 0 0 24 15V40A1 1 0 1 0 26 40V15A1 1 0 0 0 25 14ZM31 14A1 1 0 0 0 30 15V40A1 1 0 1 0 32 40V15A1 1 0 0 0 31 14Z" />
          </svg>

          <span>
            {deleteMutation.isPending
              ? "Deleting..."
              : "Delete this Post"}
          </span>
        </button>
      )}
    </section>
  );
};

export default PostMenuActions;