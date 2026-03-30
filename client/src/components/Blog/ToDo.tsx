import { useEffect, useState } from "react"

import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { TodoData } from "../../types/blogTypes"

interface Props {
  data: TodoData
  updateTodo: <K extends keyof TodoData>(
    key: K,
    value: TodoData[K]
  ) => void
}

const Todo = ({ data, updateTodo  }: Props) => {
  const [dishOptions, setDishOptions] = useState<string[]>([])
  
  console.log("Todo component", { data });
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
                items={data.dish ? [data.dish] : []}
                setItems={(v) => updateTodo("dish", v[0] || "")}
                mode="single"
                options={dishOptions}
              />
          )
        }
      ]}
    />
  )
}

export default Todo