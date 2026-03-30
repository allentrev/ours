import axios from "axios";
import Comment from "./Comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { fetchComments, createComment, deleteComment } from "../../utilities/blogUtils";
import { useRef } from "react";

interface CommentsProps {
  postId: string;  // or number, depending on your API
}

const Comments = ({ postId }: CommentsProps) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });


  const mutation = useMutation({
    mutationFn: async (newComment: {desc: string}) => {
      const token = await getToken();
      return createComment({ postId, newComment, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      formRef.current?.reset();
      toast.success("Comment added successfully");
    },
    
    onError: (error) => {
      console.log("onError", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  });

  // In Comments.tsx
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const token = await getToken();
      return deleteComment({ commentId, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const desc = formData.get("desc");
    if (typeof desc !== "string" || !desc.trim()) return;

    mutation.mutate({ desc });
  };

  return (
    <div className="flex flex-col gap-8 lg:w-3/5 mb-12">
      <h1 className="text-xl text-gray-500 underline">Comments</h1>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-center justify-between gap-8 w-full"
      >
        <textarea
          name="desc"
          placeholder="Write a comment..."
          className="w-full p-4 rounded-xl"
        />
        <button className="bg-blue-800 px-4 py-3 text-white font-medium rounded-xl">
          Send
        </button>
      </form>
      {isPending ? (
        "Loading..."
      ) : error ? (
        "Error loading comments!"
      ) : (
        <>
          {mutation.isPending && (
            <Comment
              comment={{
                _id: "",
                desc: `${mutation.variables.desc} (Sending...)`,
                createdAt: new Date(),
                user: {
                  img: user?.imageUrl ?? "",
                  username: user?.username ?? "",
                },
              }}
            />
          )}

          {Array.isArray(data) && data.length > 0 ? (
            data.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                onDelete={() => deleteMutation.mutate(comment._id)}
              />
            ))
          ) : (
            <p className="text-gray-400">No comments yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;