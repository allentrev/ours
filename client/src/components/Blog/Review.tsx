import TypePagedCard from "./TypedPagedCard"
import ItemSelector from "./ItemSelector"
import type { ReviewData } from "../../types/blogTypes"

interface Props {
  data: ReviewData
  dishes: string[]
  updateReview: <K extends keyof ReviewData>(
    key: K,
    value: ReviewData[K]
  ) => void
  updateDishes: (d: string[]) => void
}

const Review = ({ data, dishes, updateReview, updateDishes }: Props) => {
  console.log("Review component", { data, dishes });
  return (
    <TypePagedCard
      pages={[
        {
          title: "Basics",
          content: (
            <div className="grid gap-4">
              <ItemSelector
                label="Venue"
                items={data.venues}
                setItems={(v) => updateReview("venues", v)}
              />

              <ItemSelector
                label="Dish"
                items={dishes}
                setItems={updateDishes}
              />

              <ItemSelector
                label="Cuisine"
                items={data.cuisines}
                setItems={(c) => updateReview("cuisines", c)}
              />
            </div>
          )
        },
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