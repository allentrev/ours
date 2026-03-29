import { useEffect, useState } from "react"

import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { RecipeData } from "../../types/blogTypes"

interface Props {
  data: RecipeData
  dish: string
  updateRecipe: <K extends keyof RecipeData>(
    key: K,
    value: RecipeData[K]
  ) => void
  updateDish: (d: string[]) => void
}

const Recipe = ({ data, updateRecipe }: Props) => {
  const [dishOptions, setDishOptions] = useState<string[]>([])
  console.log("Recipe component", { data });

    useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await fetch("/api/dishes")
        const json = await res.json()

        setDishOptions(json.map((d: any) => d.name))
      } catch (err) {
        console.error("Failed to load dishes", err)
      }
    }

    fetchDishes()
  }, [])

  return (
    <TypePagedCard
      pages={[
        {
          title: "Basics",
          content: (
            <div className="grid gap-4">
              <ItemSelector
                label="Dish"
                items={data.dish ? [data.dish] : []}
                setItems={(v) => updateRecipe("dish", v[0] || "")}
                mode="single"
                options={dishOptions}
              />

              <ItemSelector
                label="Cuisine"
                items={data.cuisines}
                setItems={(c) => updateRecipe("cuisines", c)}
              />
            </div>
          )
        },
        {
          title: "Ingredients",
          content: (
            <textarea
              className="p-4 border rounded-xl"
              value={data.ingredients}
              onChange={(e) =>
                updateRecipe("ingredients", e.target.value)
              }
            />
          )
        },
        {
          title: "Instructions",
          content: (
            <textarea
              className="p-4 border rounded-xl"
              value={data.instructions}
              onChange={(e) =>
                updateRecipe("instructions", e.target.value)
              }
            />
          )
        }
      ]}
    />
  )
}

export default Recipe