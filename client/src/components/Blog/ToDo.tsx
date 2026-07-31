// components/Blog/ToDo.tsx

import {
  useEffect,
  useState,
} from "react";

import TypePagedCard from "./TypedPagedCard";
import ItemSelector from "./ItemSelector";

import type {
  TodoData,
} from "../../types/blogTypes";

interface TodoProps {
  data: TodoData;
  dishes: string[];

  updateTodo: <
    K extends keyof TodoData
  >(
    key: K,
    value: TodoData[K]
  ) => void;

  onDishesChange: (
    dishes: string[]
  ) => void;
}

const venueOptions = [
  "Hawker",
  "Coffee_Shop",
  "Food_Court",
  "Mall",
  "Restaurant",
];

interface DishOption {
  name: string;
}

const Todo = ({
  data,
  dishes,
  updateTodo,
  onDishesChange,
}: TodoProps) => {
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

        const response =
          await res.json();

        /*
         * Supports either:
         *
         * 1. the new ApiResponse<T> shape; or
         * 2. the older direct-array response.
         */
        const records:
          DishOption[] =
            response.data ??
            response;

        const options =
          records.map(
            (dish) =>
              dish.name
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
                label="Venues"
                items={
                  data.venues
                }
                setItems={(
                  venues
                ) =>
                  updateTodo(
                    "venues",
                    venues
                  )
                }
                mode="multi"
                options={
                  venueOptions
                }
              />

              <ItemSelector
                label="Dishes"
                items={dishes}
                setItems={
                  onDishesChange
                }
                mode="multi"
                options={
                  dishOptions
                }
              />
            </div>
          ),
        },

        {
          title: "Location",

          content: (
            <div className="grid gap-4">
              <input
                value={
                  data.location
                    .postcode
                }
                onChange={(
                  event
                ) =>
                  updateTodo(
                    "location",
                    {
                      ...data.location,

                      postcode:
                        event.target
                          .value,
                    }
                  )
                }
                className="
                  rounded-xl
                  border p-3
                "
                placeholder="Postcode"
              />

              <input
                value={
                  data.location
                    .address
                }
                onChange={(
                  event
                ) =>
                  updateTodo(
                    "location",
                    {
                      ...data.location,

                      address:
                        event.target
                          .value,
                    }
                  )
                }
                className="
                  rounded-xl
                  border p-3
                "
                placeholder="Address"
              />

              <input
                value={
                  data.location
                    .placeName
                }
                onChange={(
                  event
                ) =>
                  updateTodo(
                    "location",
                    {
                      ...data.location,

                      placeName:
                        event.target
                          .value,
                    }
                  )
                }
                className="
                  rounded-xl
                  border p-3
                "
                placeholder="Place name"
              />
            </div>
          ),
        },
      ]}
    />
  );
};

export default Todo;