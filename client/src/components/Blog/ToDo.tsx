import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { TodoData } from "../../types/blogTypes"

interface Props {
  data: TodoData
  dishes: string[]
  updateTodo: <K extends keyof TodoData>(
    key: K,
    value: TodoData[K]
  ) => void
  updateDishes: (d: string[]) => void
}

const Todo = ({ data, dishes, updateTodo, updateDishes }: Props) => {
  console.log("Todo component", { data, dishes });
  return (
    <TypePagedCard
      pages={[
        {
          title: "Location",
          content: (
            <div className="grid gap-4">
              <input
                value={data.location.postcode}
                onChange={(e) =>
                  updateTodo("location", {
                    ...data.location,
                    postcode: e.target.value
                  })
                }
                className="p-3 border rounded-xl"
              />

              <input
                value={data.location.placeName}
                onChange={(e) =>
                  updateTodo("location", {
                    ...data.location,
                    placeName: e.target.value
                  })
                }
                className="p-3 border rounded-xl"
              />
            </div>
          )
        },
        {
          title: "Food",
          content: (
            <ItemSelector
              label="Dish"
              items={dishes}
              setItems={updateDishes}
            />
          )
        }
      ]}
    />
  )
}

export default Todo