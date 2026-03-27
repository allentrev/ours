import { useAuth, useUser } from '@clerk/clerk-react'
import { useRef, useState } from "react"
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { createPost } from "../../utilities/blogUtils"
import { importFile } from '../../utilities/galleryUtils'
import type { PostRecord } from "../../types/blogTypes"
import { POST_TYPES } from "../../types/blogTypes"

import TiptapEditorWithToolbar from '../../components/Tiptap'

// NEW reusable components
import Recipe from "../../components/Blog/Recipe"
import Review from "../../components/Blog/Review"
import Todo from "../../components/Blog/ToDo"
import ItemSelector from "../../components/Blog/ItemSelector"

const Write = () => {
  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const [cover, setCover] = useState<string>("")
  
  //  NEW unified state
  const [formData, setFormData] = useState<PostRecord>({
    type: "todo",
    title: "",
    desc: "",
    content: "",
    tags: [],
    dishes: [],
  });

  const updateField = <K extends keyof PostRecord>(
    key: K,
    value: PostRecord[K]
  ) => {
    console.log("updateFied", key, value)
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* -------------------- Cover upload -------------------- */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importFile(file, "/content/covers")
      if (result.url){
        setCover(result.url)
       } else {
        setCover("")
       };
      toast.success("Cover uploaded")
    } catch {
      toast.error("Cover upload failed")
    }

    e.target.value = ""
  }

  /* -------------------- Mutation -------------------- */
  const mutation = useMutation({
    mutationFn: async (newPost: PostRecord) => {
      const token = await getToken()
      return createPost(newPost, token)
    },
    onSuccess: (res) => {
      toast.success('Post created successfully')
      navigate(`/blog/${res.slug}`)
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Request failed")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  })

  /* -------------------- Auth -------------------- */
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in.</div>

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: PostRecord = {
      ...formData,
      cover: cover || formData.cover,
    }

    await mutation.mutateAsync(payload)
  }

  /* -------------------- UI -------------------- */
  return (
    <div className='h-[calc(100vh-64px)] flex flex-col gap-6'>
      <h1 className="text-xl font-light">Create a New Post /h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 flex-1 mb-6 border p-4 rounded-xl"
      >

        {/* COVER */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="p-2 shadow rounded-xl text-sm bg-white"
            >
              Add cover image
            </button>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />

            <span className="text-sm text-gray-500">
              {cover ? "Image selected" : "No file chosen"}
            </span>
          </div>

          {cover && (
            <img src={cover} className="w-full max-w-xl h-64 object-cover rounded-xl" />
          )}
        </div>

        {/* TYPE (tabs instead of dropdown) */}
        <div className="flex gap-2">
          {POST_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => updateField("type", t)}
              className={`px-4 py-2 rounded-full border ${
                formData.type === t ? "bg-blue-600 text-white" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TITLE */}
        <input
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="text-4xl font-semibold bg-transparent outline-none"
          placeholder="Enter title"
        />

        {/* DESC */}
        <textarea
          value={formData.desc}
          onChange={(e) => updateField("desc", e.target.value)}
          className="p-4 rounded-xl bg-white shadow"
          placeholder="Short description"
        />

        {/* TAGS */}
        <ItemSelector
          label="Tags"
          items={formData.tags}
          setItems={(t) => updateField("tags", t)}
          suggestions={[
            "chinese",
            "spicy",
            "cheap-eats",
            "street-food",
          ]}
          placeholder="Search or add tag..."
        />

        {/* CONDITIONAL FIELDS */}
        {formData.type === "recipe" && (
          <Recipe formData={formData} updateField={updateField} />
        )}

        {formData.type === "review" && (
          <Review formData={formData} updateField={updateField} />
        )}

        {formData.type === "todo" && (
          <Todo formData={formData} updateField={updateField} />
        )}

        {formData.type === "note" && (
          <div className="border-t pt-4 text-gray-500">
            No additional fields
          </div>
        )}
        
        {/* EDITOR */}
        <TiptapEditorWithToolbar
          content={formData.content}
          onChange={(val) => updateField("content", val)}
          readOnly={false}
        />

        {/* SUBMIT */}
        <button
          disabled={mutation.isPending}
          className="bg-blue-800 text-white rounded-xl p-2 w-36"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>

      </form>
    </div>
  )
}

export default Write