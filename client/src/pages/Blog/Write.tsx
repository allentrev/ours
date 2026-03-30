import { useAuth, useUser } from '@clerk/clerk-react'
import { useRef, useState } from "react"
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { createPost } from "../../utilities/blogUtils"
import { importFile } from '../../utilities/galleryUtils'
import type {
  CreatePost,
  RecipeData,
  TodoData,
  ReviewData,
  NoteData,
  PostType
} from "../../types/blogTypes"
import { POST_TYPES } from "../../types/blogTypes"

import TiptapEditorWithToolbar from '../../components/Tiptap'
import Recipe from "../../components/Blog/Recipe"
import Review from "../../components/Blog/Review"
import Todo from "../../components/Blog/ToDo"
import ItemSelector from "../../components/Blog/ItemSelector"

/* -------------------- FORM TYPE -------------------- */
type PostFormData = {
  type: PostType;
  title: string;
  desc: string;
  content: string;
  cover?: string;
  tags: string[];

  recipe?: RecipeData;
  review?: ReviewData;
  todo?: TodoData;
  note?: NoteData;
}

/* -------------------- BUILDER -------------------- */
const buildPostPayload = (data: PostFormData): CreatePost => {
  switch (data.type) {
    case "recipe":
      return {
        type: "recipe",
        title: data.title,
        desc: data.desc,
        content: data.content,
        cover: data.cover,
        tags: data.tags,
        recipe: data.recipe!,
      }

    case "review":
      return {
        type: "review",
        title: data.title,
        desc: data.desc,
        content: data.content,
        cover: data.cover,
        tags: data.tags,
        review: data.review!,
      }

    case "todo":
      return {
        type: "todo",
        title: data.title,
        desc: data.desc,
        content: data.content,
        cover: data.cover,
        tags: data.tags,
        todo: data.todo!,
      }

    case "note":
      return {
        type: "note",
        title: data.title,
        desc: data.desc,
        content: data.content,
        cover: data.cover,
        tags: data.tags,
        note: data.note ?? {},
      }
  }
}

const Write = () => {
  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const [cover, setCover] = useState<string>("")

  const [formData, setFormData] = useState<PostFormData>({
    type: "todo",
    title: "",
    desc: "",
    content: "",
    tags: [],

    recipe: {
      dish: "",
      cuisines: [],
      ingredients: "",
      instructions: ""
    },

    review: {
      dish: "",
      venue: "Restaurant",
      cuisines: [],
      location: {
        postcode: "",
        address: "",
        placeName: ""
      },
      transport: {
        busStop: "",
        busNotes: "",
        mrt: "",
        mrtNotes: ""
      },
      trading: {
        openDays: "",
        openHours: "",
        closedDays: ""
      },
      rating: 0
    },

    todo: {
      dish: "",
      venue: "Restaurant",
      location: {
        postcode: "",
        address: "",
        placeName: ""
      }
    },

    note: {}
  })

  /* -------------------- GENERIC UPDATE -------------------- */
  const updateField = <K extends keyof PostFormData>(
    key: K,
    value: PostFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  /* -------------------- TYPE-SPECIFIC UPDATES -------------------- */
  const updateRecipe = <K extends keyof RecipeData>(
    key: K,
    value: RecipeData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      recipe: {
        ...prev.recipe!,
        [key]: value
      }
    }))
  }

  const updateReview = <K extends keyof ReviewData>(
    key: K,
    value: ReviewData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      review: {
        ...prev.review!,
        [key]: value
      }
    }))
  }

  const updateTodo = <K extends keyof TodoData>(
    key: K,
    value: TodoData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      todo: {
        ...prev.todo!,
        [key]: value
      }
    }))
  }

  /* -------------------- COVER UPLOAD -------------------- */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importFile(file, "/content/covers")

      if (result.url) {
        setCover(result.url)
        toast.success("Cover uploaded")
      } else {
        toast.error("Upload failed")
      }
    } catch {
      toast.error("Cover upload failed")
    }

    e.target.value = ""
  }

  /* -------------------- MUTATION -------------------- */
  const mutation = useMutation({
    mutationFn: async (newPost: CreatePost) => {
      const token = await getToken()
      return createPost(newPost, token)
    },
    onSuccess: (res) => {
      toast.success("Post created successfully")
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

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = buildPostPayload({
      ...formData,
      cover: cover || formData.cover,
    })

    await mutation.mutateAsync(payload)
  }

  /* -------------------- AUTH -------------------- */
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in.</div>

  /* -------------------- UI -------------------- */
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-6">
      <h1 className="text-xl font-light">Create a New Post</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6 border p-4 rounded-xl">

        {/* TYPE */}
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => updateField("type", t)}
              className={`px-4 py-2 rounded-full border ${
                formData.type === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* COVER */}
        <div className="flex items-center gap-2">
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
          <img
            src={cover}
            className="w-full max-w-md h-48 object-cover rounded-xl"
          />
        )}

        {/* TAGS */}
        <ItemSelector
          label="Tags"
          items={formData.tags}
          setItems={(t: string[]) => updateField("tags", t)}
          options={["chinese", "spicy", "cheap-eats", "street-food"]}
        />

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

        {/* TYPE-SPECIFIC */}
        {formData.type === "recipe" && formData.recipe && (
          <Recipe data={formData.recipe} updateRecipe={updateRecipe} />
        )}

        {formData.type === "review" && formData.review && (
          <Review data={formData.review} updateReview={updateReview} />
        )}

        {formData.type === "todo" && formData.todo && (
          <Todo data={formData.todo} updateTodo={updateTodo} />
        )}

        {formData.type === "note" && (
          <div className="text-gray-500 italic">
            No additional fields for notes
          </div>
        )}

        {/* CONTENT */}
        <TiptapEditorWithToolbar
          content={formData.content}
          onChange={(val) => updateField("content", val)}
          readOnly={false}
        />

        {/* SAVE */}
        <div className="flex justify-end">
          <button
            disabled={mutation.isPending}
            className="bg-blue-800 text-white rounded-xl p-3 w-40"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>

      </form>
    </div>
  )
}

export default Write