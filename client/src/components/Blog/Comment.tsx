import { format } from "timeago.js";
import { useUser } from "@clerk/clerk-react";


/* ---------- Types ---------- */

interface CommentUser {
  username: string;
  img?: string;
}

interface CommentData {
  _id?: string;
  desc: string;
  createdAt: string | Date;
  user: CommentUser;
}

interface CommentProps {
  comment: CommentData;
  onDelete?: () => void;  
}

/* ---------- Component ---------- */

const Comment: React.FC<CommentProps> = ({ comment, onDelete }) => {
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string | undefined;

  const canDelete =
    user &&
    (comment.user.username === user.username || role === "admin");

  return (
    <div className="p-4 bg-slate-50 rounded-xl mb-8">
      <div className="flex items-center gap-4">
        {comment.user.img && (
          <img 
            src={comment.user.img}
            className="w-10 h-10 rounded-full object-cover"
            width="40"
          />
        )}

        <span className="font-medium">
          {comment.user.username}
        </span>

        <span className="text-sm text-gray-500">
          {format(comment.createdAt)}
        </span>

        {canDelete && (
          <span
            className="text-xs text-red-300 hover:text-red-500 cursor-pointer"
            onClick={onDelete}
          >
            delete{" "}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p>{comment.desc}</p>
      </div>
    </div>
  );
};

export default Comment;
