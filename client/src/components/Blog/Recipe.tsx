import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { RecipeData } from "../../types/blogTypes"

interface Props {
  data: RecipeData
  dishes: string[]
  updateRecipe: <K extends keyof RecipeData>(
    key: K,
    value: RecipeData[K]
  ) => void
  updateDishes: (d: string[]) => void
}

const Recipe = ({ data, dishes, updateRecipe, updateDishes }: Props) => {
  console.log("Recipe component", { data, dishes });
  return (
    <TypePagedCard
      pages={[
        {
          title: "Basics",
          content: (
            <div className="grid gap-4">
              <ItemSelector
                label="Dish"
                items={dishes}
                setItems={updateDishes}
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