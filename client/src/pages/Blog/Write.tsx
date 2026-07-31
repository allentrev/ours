import {
  useAuth,
  useUser,
} from "@clerk/clerk-react";

import {
  useRef,
  useState,
} from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  createPost,
} from "../../utilities/blogUtils";

import {
  importFile,
} from "../../utilities/galleryUtils";

import type {
  CreatePost,
  RecipeData,
  ReviewData,
  TodoData,
} from "../../types/blogTypes";

import {
  POST_TYPES,
} from "../../types/blogTypes";

import TiptapEditorWithToolbar from "../../components/Tiptap";
import Recipe from "../../components/Blog/Recipe";
import Review from "../../components/Blog/Review";
import Todo from "../../components/Blog/ToDo";
import ItemSelector from "../../components/Blog/ItemSelector";

/* -------------------- Initial values -------------------- */

const initialRecipe: RecipeData = {
  cuisines: [],
  ingredients: "",
  instructions: "",
};

const initialReview: ReviewData = {
  venues: [
    "Restaurant",
  ],

  cuisines: [],

  location: {
    postcode: "",
    address: "",
    placeName: "",
  },

  transport: {
    busStop: "",
    busNotes: "",
    mrt: "",
    mrtNotes: "",
  },

  trading: {
    openDays: "",
    openHours: "",
    closedDays: "",
  },

  rating: 0,
};

const initialTodo: TodoData = {
  venues: [
    "Restaurant",
  ],

  location: {
    postcode: "",
    address: "",
    placeName: "",
  },
};

/*
 * The form holds all possible typed sections.
 * buildPostPayload() returns only the section
 * appropriate to the selected post type.
 */
interface WriteFormState {
  type:
    | "recipe"
    | "review"
    | "todo"
    | "note";

  title: string;
  desc: string;
  content: string;

  cover?: string;

  category: string;

  tags: string[];
  dishes: string[];

  seoTitle?: string;
  seoDesc?: string;

  isFeatured: boolean;

  recipe: RecipeData;
  review: ReviewData;
  todo: TodoData;
}

/* -------------------- Payload builder -------------------- */

const buildPostPayload = (
  data: WriteFormState
): CreatePost => {
  const sharedFields = {
    title:
      data.title,

    desc:
      data.desc,

    content:
      data.content,

    cover:
      data.cover,

    category:
      data.category,

    tags:
      data.tags,

    dishes:
      data.dishes,

    seoTitle:
      data.seoTitle,

    seoDesc:
      data.seoDesc,

    isFeatured:
      data.isFeatured,
  };

  switch (data.type) {
    case "recipe":
      return {
        ...sharedFields,
        type: "recipe",
        recipe:
          data.recipe,
      };

    case "review":
      return {
        ...sharedFields,
        type: "review",
        review:
          data.review,
      };

    case "todo":
      return {
        ...sharedFields,
        type: "todo",
        todo:
          data.todo,
      };

    case "note":
      return {
        ...sharedFields,
        type: "note",
      };
  }
};

const Write = () => {
  const {
    isLoaded,
    isSignedIn,
  } = useUser();

  const {
    getToken,
  } = useAuth();

  const navigate =
    useNavigate();

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    cover,
    setCover,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState<WriteFormState>({
    type: "todo",

    title: "",
    desc: "",
    content: "",

    cover: "",

    category:
      "general",

    tags: [],
    dishes: [],

    seoTitle: "",
    seoDesc: "",

    isFeatured: false,

    recipe: {
      ...initialRecipe,
    },

    review: {
      ...initialReview,

      location: {
        ...initialReview.location,
      },

      transport: {
        ...initialReview.transport,
      },

      trading: {
        ...initialReview.trading,
      },

      venues: [
        ...initialReview.venues,
      ],

      cuisines: [
        ...initialReview.cuisines,
      ],
    },

    todo: {
      ...initialTodo,

      location: {
        ...initialTodo.location,
      },

      venues: [
        ...initialTodo.venues,
      ],
    },
  });

  /* -------------------- Generic update -------------------- */

  const updateField = <
    K extends keyof WriteFormState
  >(
    key: K,
    value: WriteFormState[K]
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );
  };

  /* -------------------- Type-specific updates -------------------- */

  const updateRecipe = <
    K extends keyof RecipeData
  >(
    key: K,
    value: RecipeData[K]
  ) => {
    setFormData(
      (previous) => ({
        ...previous,

        recipe: {
          ...previous.recipe,
          [key]: value,
        },
      })
    );
  };

  const updateReview = <
    K extends keyof ReviewData
  >(
    key: K,
    value: ReviewData[K]
  ) => {
    setFormData(
      (previous) => ({
        ...previous,

        review: {
          ...previous.review,
          [key]: value,
        },
      })
    );
  };

  const updateTodo = <
    K extends keyof TodoData
  >(
    key: K,
    value: TodoData[K]
  ) => {
    setFormData(
      (previous) => ({
        ...previous,

        todo: {
          ...previous.todo,
          [key]: value,
        },
      })
    );
  };

  /* -------------------- Cover upload -------------------- */

  const handleCoverUpload = async (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result =
        await importFile(
          file,
          "/content/covers"
        );

      if (!result.url) {
        throw new Error(
          "The upload returned no URL."
        );
      }

      setCover(
        result.url
      );

      updateField(
        "cover",
        result.url
      );

      toast.success(
        "Cover uploaded."
      );
    } catch (error) {
      console.error(
        "Cover upload failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Cover upload failed."
      );
    }

    event.target.value = "";
  };

  /* -------------------- Mutation -------------------- */

  const mutation =
    useMutation({
      mutationFn: async (
        newPost: CreatePost
      ) => {
        const token =
          await getToken({
            skipCache: true,
          });

        if (!token) {
          throw new Error(
            "Authentication token is unavailable."
          );
        }

        return createPost(
          newPost,
          token
        );
      },

      onSuccess: (
        createdPost
      ) => {
        toast.success(
          "Post created successfully."
        );

        navigate(
          `/blog/${createdPost.slug}`
        );
      },

      onError: (
        error
      ) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred."
        );
      },
    });

  /* -------------------- Submit -------------------- */

  const handleSubmit = async (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const payload =
      buildPostPayload({
        ...formData,

        cover:
          cover ||
          formData.cover,
      });

    await mutation.mutateAsync(
      payload
    );
  };

  /* -------------------- Authentication -------------------- */

  if (!isLoaded) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div>
        Please sign in.
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-6">
      <h1 className="text-xl font-light">
        Create a New Post
      </h1>

      <form
        onSubmit={
          handleSubmit
        }
        className="
          mb-6 flex flex-1
          flex-col gap-6
          rounded-xl border p-4
        "
      >
        {/* Type */}

        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map(
            (postType) => (
              <button
                type="button"
                key={postType}
                onClick={() =>
                  updateField(
                    "type",
                    postType
                  )
                }
                className={
                  "rounded-full border px-4 py-2 " +
                  (
                    formData.type ===
                    postType
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300"
                  )
                }
              >
                {postType}
              </button>
            )
          )}
        </div>

        {/* Cover */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              coverInputRef.current
                ?.click()
            }
            className="
              rounded-xl bg-white
              p-2 text-sm shadow
            "
          >
            Add cover image
          </button>

          <input
            ref={
              coverInputRef
            }
            type="file"
            accept="image/*"
            onChange={
              handleCoverUpload
            }
            className="hidden"
          />

          <span className="text-sm text-gray-500">
            {cover
              ? "Image selected"
              : "No file chosen"}
          </span>
        </div>

        {cover && (
          <img
            src={cover}
            alt="Post cover"
            className="
              h-48 w-full
              max-w-md rounded-xl
              object-cover
            "
          />
        )}

        {/* Category */}

        <input
          value={
            formData.category
          }
          onChange={(event) =>
            updateField(
              "category",
              event.target.value
            )
          }
          className="
            rounded-xl border
            bg-white p-3
          "
          placeholder="Category"
        />

        {/* Tags */}

        <ItemSelector
          label="Tags"
          items={
            formData.tags
          }
          setItems={(tags) =>
            updateField(
              "tags",
              tags
            )
          }
          options={[
            "chinese",
            "spicy",
            "cheap-eats",
            "street-food",
          ]}
        />

        {/* Title */}

        <input
          value={
            formData.title
          }
          onChange={(event) =>
            updateField(
              "title",
              event.target.value
            )
          }
          className="
            bg-transparent
            text-4xl font-semibold
            outline-none
          "
          placeholder="Enter title"
        />

        {/* Description */}

        <textarea
          value={
            formData.desc
          }
          onChange={(event) =>
            updateField(
              "desc",
              event.target.value
            )
          }
          className="
            rounded-xl bg-white
            p-4 shadow
          "
          placeholder="Short description"
        />

        {/* Type-specific fields */}

        {formData.type ===
          "recipe" && (
          <Recipe
            data={
              formData.recipe
            }
            dishes={
              formData.dishes
            }
            updateRecipe={
              updateRecipe
            }
            onDishesChange={(
              dishes
            ) =>
              updateField(
                "dishes",
                dishes
              )
            }
          />
        )}

        {formData.type ===
          "review" && (
          <Review
            data={formData.review}
            dishes={formData.dishes}
            updateReview={updateReview}
            onDishesChange={(dishes) =>
              updateField(
                "dishes",
                dishes
              )
            }
          />
        )}

        {formData.type ===
          "todo" && (
          <Todo
            data={formData.todo}
            dishes={formData.dishes}
            updateTodo={updateTodo}
            onDishesChange={(dishes) =>
              updateField(
                "dishes",
                dishes
              )
            }
          />
        )}

        {formData.type ===
          "note" && (
          <div className="italic text-gray-500">
            Notes use the main
            content field below.
          </div>
        )}

        {/* Content */}

        <TiptapEditorWithToolbar
          content={
            formData.content
          }
          onChange={(content) =>
            updateField(
              "content",
              content
            )
          }
          readOnly={false}
        />

        {/* SEO */}

        <input
          value={
            formData.seoTitle ??
            ""
          }
          onChange={(event) =>
            updateField(
              "seoTitle",
              event.target.value
            )
          }
          className="
            rounded-xl border
            bg-white p-3
          "
          placeholder="SEO title"
        />

        <textarea
          value={
            formData.seoDesc ??
            ""
          }
          onChange={(event) =>
            updateField(
              "seoDesc",
              event.target.value
            )
          }
          className="
            rounded-xl border
            bg-white p-3
          "
          placeholder="SEO description"
        />

        {/* Save */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              mutation.isPending
            }
            className="
              w-40 rounded-xl
              bg-blue-800 p-3
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {mutation.isPending
              ? "Saving..."
              : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Write;