import { useEffect, useState } from "react"

import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { ReviewData } from "../../types/blogTypes"

interface Props {
  data: ReviewData
  updateReview: <K extends keyof ReviewData>(
    key: K,
    value: ReviewData[K]
  ) => void
}

const venueOptions = [
  "Hawker",
  "Coffee_Shop",
  "Food_Court",
  "Mall",
  "Restaurant"
] as const

const Review = ({ data, updateReview }: Props) => {
  const [dishOptions, setDishOptions] = useState<string[]>([])

  console.log("Review component", { data })

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* ---------------- Venue ---------------- */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Venue
                </label>

                <select
                  value={data.venue ?? ""}
                  onChange={(e) =>
                    updateReview(
                      "venue",
                      e.target.value as ReviewData["venue"]
                    )
                  }
                  className="
                    w-full
                    p-3
                    border
                    rounded-xl
                    bg-white
                    text-gray-800
                    shadow-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    transition
                  "
                >
                  <option value="" disabled>
                    Select a venue
                  </option>

                  {venueOptions.map((v) => (
                    <option key={v} value={v}>
                      {v.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---------------- Dish ---------------- */}
              <ItemSelector
                label="Dish"
                items={data.dish ? [data.dish] : []}
                setItems={(v) => updateReview("dish", v[0] || "")}
                mode="single"
                options={dishOptions}
              />

              {/* ---------------- Cuisine ---------------- */}
              <ItemSelector
                label="Cuisine"
                items={data.cuisines}
                setItems={(c) => updateReview("cuisines", c)}
                mode="multi"
              />
            </div>
          )
        },

        /* ---------------- Location ---------------- */
        {
          title: "Location",
          content: (
            <div className="grid gap-4">
              <input
                value={data.location.postcode}
                onChange={(e) =>
                  updateReview("location", {
                    ...data.location,
                    postcode: e.target.value
                  })
                }
                className="p-3 border rounded-xl"
              />

              <div>{data.location.address}</div>
            </div>
          )
        },

        /* ---------------- Transport ---------------- */
        {
          title: "Transport",
          content: (
            <div className="grid gap-4">
              <input
                placeholder="Bus Stop"
                value={data.transport.busStop}
                onChange={(e) =>
                  updateReview("transport", {
                    ...data.transport,
                    busStop: e.target.value
                  })
                }
                className="p-3 border rounded-xl"
              />
            </div>
          )
        },

        /* ---------------- Trading ---------------- */
        {
          title: "Trading",
          content: (
            <div className="grid gap-4">
              <input
                value={data.trading.openDays}
                onChange={(e) =>
                  updateReview("trading", {
                    ...data.trading,
                    openDays: e.target.value
                  })
                }
                className="p-3 border rounded-xl"
              />
            </div>
          )
        },

        /* ---------------- Rating ---------------- */
        {
          title: "Rating",
          content: (
            <input
              type="number"
              value={data.rating}
              onChange={(e) =>
                updateReview("rating", Number(e.target.value))
              }
              className="p-3 border rounded-xl"
            />
          )
        }
      ]}
    />
  )
}

export default Review