import { useAuth, useUser } from '@clerk/clerk-react'
import { useRef, useState } from "react"
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { createPost } from "../../utilities/blogUtils"
import { importFile } from '../../utilities/galleryUtils'
import type { PostRecord, RecipeData, TodoData, ReviewData } from "../../types/blogTypes"
import { POST_TYPES } from "../../types/blogTypes"

import TiptapEditorWithToolbar from '../../components/Tiptap'

// Type-specific components (now paged internally)
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

  const [formData, setFormData] = useState<PostRecord>({
    type: "todo",
    title: "",
    desc: "",
    content: "",
    tags: [],
    dishes: [],

    recipe: {
      cuisines: [],
      ingredients: "",
      instructions: ""
    },

    review: {
      venues: [],
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
      venues: [],
      location: {
        postcode: "",
        address: "",
        placeName: ""
      }
    }
  })

  const updateField = <K extends keyof PostRecord>(
    key: K,
    value: PostRecord[K]
  ) => {
    console.log(`UpdateField, key: ${key}, value: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  /* -------------------- Cover Upload -------------------- */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importFile(file, "/content/covers")

      if (result.url) {
        setCover(result.url)
        toast.success("Cover uploaded")
      } else {
        setCover("")
        toast.error("Upload failed")
      }
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

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: PostRecord = {
      ...formData,
      cover: cover || formData.cover,
    }

    await mutation.mutateAsync(payload)
  }

  /* -------------------- Auth -------------------- */
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in.</div>

  /* -------------------- UI -------------------- */

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

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-6">
      <h1 className="text-xl font-light">Create a New Post TEST</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 flex-1 mb-6 border p-4 rounded-xl"
      >
        {/* -------------------- TYPE + COVER -------------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Type buttons */}
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => updateField("type", t)}
                className={`px-4 py-2 rounded-full border ${
                  formData.type === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Cover upload */}
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
        </div>

        {/* -------------------- TAGS -------------------- */}
        <ItemSelector
          label="Tags"
          items={formData.tags}
          setItems={(t) => updateField("tags", t)}
          suggestions={["chinese", "spicy", "cheap-eats", "street-food"]}
        />

        {/* -------------------- COVER PREVIEW -------------------- */}
        {cover && (
          <img
            src={cover}
            className="w-full max-w-md h-48 object-cover rounded-xl"
          />
        )}

        {/* -------------------- TITLE -------------------- */}
        <input
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="text-4xl font-semibold bg-transparent outline-none"
          placeholder="Enter title"
        />

        {/* -------------------- DESCRIPTION -------------------- */}
        <textarea
          value={formData.desc}
          onChange={(e) => updateField("desc", e.target.value)}
          className="p-4 rounded-xl bg-white shadow"
          placeholder="Short description"
        />

        {/* -------------------- TYPE-SPECIFIC AREA -------------------- */}
        <div className="pt-2">
          {formData.type === "recipe" && formData.recipe && (
            <Recipe
              data={formData.recipe}
              dishes={formData.dishes}
              updateRecipe={updateRecipe}
              updateDishes={(d) => updateField("dishes", d)}
            />
          )}

          {formData.type === "review" && formData.review && (
            <Review
              data={formData.review}
              dishes={formData.dishes}
              updateReview={updateReview}
              updateDishes={(d) => updateField("dishes", d)}
            />
          )}

          {formData.type === "todo" && formData.todo && (
            <Todo
              data={formData.todo}
              dishes={formData.dishes}
              updateTodo={updateTodo}
              updateDishes={(d) => updateField("dishes", d)}
            />
          )}

          {formData.type === "note" && (
            <div className="text-gray-500 italic">
              No additional fields for notes
            </div>
          )}
        </div>
        {/* -------------------- CONTENT EDITOR -------------------- */}
        <TiptapEditorWithToolbar
          content={formData.content}
          onChange={(val) => updateField("content", val)}
          readOnly={false}
        />

        {/* -------------------- SAVE BUTTON -------------------- */}
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