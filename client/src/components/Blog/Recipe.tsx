// components/Blog/Recipe.tsx

import {
  useEffect,
  useState,
} from "react";

import TypePagedCard from "./TypedPagedCard";
import ItemSelector from "./ItemSelector";

import type {
  RecipeData,
} from "../../types/blogTypes";

interface RecipeProps {
  data: RecipeData;

  dishes: string[];

  updateRecipe: <
    K extends keyof RecipeData
  >(
    key: K,
    value: RecipeData[K]
  ) => void;

  onDishesChange: (
    dishes: string[]
  ) => void;
}

const Recipe = ({
  data,
  dishes,
  updateRecipe,
  onDishesChange,
}: RecipeProps) => {
  const [
    dishOptions,
    setDishOptions,
  ] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchDishes = async () => {
      try {
        const url =
          `${import.meta.env.VITE_BACKEND_URL}` +
          "/dishes";

        const res =
          await fetch(url);

        if (!res.ok) {
          throw new Error(
            "Failed to retrieve dishes."
          );
        }

        const result =
          await res.json();

        /*
         * Retain this mapping if the dishes
         * endpoint returns an array directly.
         *
         * If the endpoint now uses ApiResponse<T>,
         * change result to result.data below.
         */
        const records =
          result.data ?? result;

        const options =
          records.map(
            (dish: {
              name: string;
            }) => dish.name
          );

        if (!cancelled) {
          setDishOptions(
            options
          );
        }
      } catch (error) {
        console.error(
          "Failed to load dishes:",
          error
        );

        if (!cancelled) {
          setDishOptions([]);
        }
      }
    };

    void fetchDishes();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TypePagedCard
      pages={[
        {
          title: "Basics",

          content: (
            <div className="grid gap-4">
              <ItemSelector
                label="Dishes"
                items={dishes}
                setItems={
                  onDishesChange
                }
                options={
                  dishOptions
                }
              />

              <ItemSelector
                label="Cuisine"
                items={
                  data.cuisines
                }
                setItems={(
                  cuisines
                ) =>
                  updateRecipe(
                    "cuisines",
                    cuisines
                  )
                }
              />
            </div>
          ),
        },

        {
          title: "Ingredients",

          content: (
            <textarea
              className="
                min-h-48
                rounded-xl border
                p-4
              "
              value={
                data.ingredients
              }
              onChange={(event) =>
                updateRecipe(
                  "ingredients",
                  event.target.value
                )
              }
            />
          ),
        },

        {
          title: "Instructions",

          content: (
            <textarea
              className="
                min-h-48
                rounded-xl border
                p-4
              "
              value={
                data.instructions
              }
              onChange={(event) =>
                updateRecipe(
                  "instructions",
                  event.target.value
                )
              }
            />
          ),
        },
      ]}
    />
  );
};

export default Recipe;