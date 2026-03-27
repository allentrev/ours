import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

import PostMenuActions from "../../components/Blog/PostMenuActions";
import Search from "../../components/Blog/Search";
import Comments from "../../components/Blog/Comments";
import TiptapEditorWithToolbar from '../../components/Tiptap';
import { useProfile } from "../../hooks/userProfile";

const fetchPost = async (slug: string) => {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();
  const { user } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: profile } = useProfile();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug ?? ""),
  });

  if (isPending) return "loading...";
  if (error) return "Something went wrong!" + error.message;
  if (!data) return "Post not found!";

  const isAdmin = user?.publicMetadata?.role === "admin" || false;
  const isAuthorOrAdmin = user && (data.user.username === user.username || isAdmin);

  const handleEditToggle = () => {
    if (!isEditMode) {
      // entering edit mode — seed the fields with current values
      setEditTitle(data.title);
      setEditDesc(data.desc);
      setEditContent(data.content);
    }
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* detail */}
      <div className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          {isEditMode ? (
            <input
              className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <h1 className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
              {data.title}
            </h1>
          )}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <p className="text-blue-800">{data.user?.username}</p>
            <span>on</span>
            <p className="text-blue-800">{data.category}</p>
            <span>{format(data.createdAt)}</span>
          </div>
          {isEditMode ? (
            <textarea
              className="text-gray-500 font-medium border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          ) : (
            <p className="text-gray-500 font-medium">{data.desc}</p>
          )}
        </div>
        {data.img && (
          <div className="w-full h-[50vh] max-h-125 overflow-hidden rounded-xl">
            <img src={data.img} alt="Cover" className="w-full h-full object-contain" />
          </div>
        )}
        {!data.img && (
          <div className="hidden lg:block w-2/5">
            <p>"No cover image"</p>
          </div>
        )}
      </div>

      {/* content */}
      <div className="flex flex-col md:flex-row gap-12 justify-between">
        {/* text */}
        <div className="lg:text-lg flex flex-col gap-6 text-justify w-full min-w-0">
          <TiptapEditorWithToolbar
            content={isEditMode ? editContent : data.content}
            readOnly={!isEditMode}
            onChange={setEditContent}
          />
        </div>

        {/* menu */}
        <div className="px-4 h-max sticky top-8">
          <h1 className="mb-4 text-sm font-medium">Author</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              {data.user.img && (
                <img
                  src={data.user.img}
                  className="w-12 h-12 rounded-full object-cover"
                  width="48"
                  height="48"
                />
              )}
              <p className="text-blue-800">{data.user.username}</p>
            </div>
            <p className="text-sm text-gray-500">{profile?.bio}</p>
            <div className="flex gap-2">
              {profile?.facebook && (
                <a href={profile.facebook} target="_blank" rel="noreferrer">
                  <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
                </a>
              )}
              {profile?.instagram && (
                <a href={profile.instagram} target="_blank" rel="noreferrer">
                  <img src="/instagram.svg" alt="Instagram" className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {isAuthorOrAdmin && (
            <PostMenuActions
              post={data}
              isEditMode={isEditMode}
              onEditToggle={handleEditToggle}
              editData={{ title: editTitle, desc: editDesc, content: editContent }}
            />
          )}

          <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <p className="underline">All</p>
            <Link className="underline" to="/blog">Web Design</Link>
            <Link className="underline" to="/blog">Development</Link>
            <Link className="underline" to="/blog">Databases</Link>
            <Link className="underline" to="/blog">Search Engines</Link>
            <Link className="underline" to="/blog">Marketing</Link>
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium">Search</h1>
          <Search />
        </div>
      </div>
      <Comments postId={data._id} />
    </div>
  );
};

export default SinglePostPage;