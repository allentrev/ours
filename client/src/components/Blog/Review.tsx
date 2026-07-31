// components/Blog/Review.tsx

import {
  useEffect,
  useState,
} from "react";

import TypePagedCard from "./TypedPagedCard";
import ItemSelector from "./ItemSelector";

import type {
  ReviewData,
} from "../../types/blogTypes";

interface ReviewProps {
  data: ReviewData;
  dishes: string[];

  updateReview: <
    K extends keyof ReviewData
  >(
    key: K,
    value: ReviewData[K]
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

const Review = ({
  data,
  dishes,
  updateReview,
  onDishesChange,
}: ReviewProps) => {
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

        const records =
          response.data ??
          response;

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Venues */}

              <ItemSelector
                label="Venues"
                items={
                  data.venues
                }
                setItems={(
                  venues
                ) =>
                  updateReview(
                    "venues",
                    venues
                  )
                }
                mode="multi"
                options={
                  venueOptions
                }
              />

              {/* Dishes */}

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

              {/* Cuisines */}

              <ItemSelector
                label="Cuisines"
                items={
                  data.cuisines
                }
                setItems={(
                  cuisines
                ) =>
                  updateReview(
                    "cuisines",
                    cuisines
                  )
                }
                mode="multi"
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
                  updateReview(
                    "location",
                    {
                      ...data.location,

                      postcode:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
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
                  updateReview(
                    "location",
                    {
                      ...data.location,

                      address:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
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
                  updateReview(
                    "location",
                    {
                      ...data.location,

                      placeName:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Place name"
              />
            </div>
          ),
        },

        {
          title: "Transport",

          content: (
            <div className="grid gap-4">
              <input
                value={
                  data.transport
                    .busStop
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "transport",
                    {
                      ...data.transport,

                      busStop:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Bus stop"
              />

              <textarea
                value={
                  data.transport
                    .busNotes
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "transport",
                    {
                      ...data.transport,

                      busNotes:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Bus notes"
              />

              <input
                value={
                  data.transport
                    .mrt
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "transport",
                    {
                      ...data.transport,

                      mrt:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="MRT station"
              />

              <textarea
                value={
                  data.transport
                    .mrtNotes
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "transport",
                    {
                      ...data.transport,

                      mrtNotes:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="MRT notes"
              />
            </div>
          ),
        },

        {
          title: "Trading",

          content: (
            <div className="grid gap-4">
              <input
                value={
                  data.trading
                    .openDays
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "trading",
                    {
                      ...data.trading,

                      openDays:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Open days"
              />

              <input
                value={
                  data.trading
                    .openHours
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "trading",
                    {
                      ...data.trading,

                      openHours:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Open hours"
              />

              <input
                value={
                  data.trading
                    .closedDays
                }
                onChange={(
                  event
                ) =>
                  updateReview(
                    "trading",
                    {
                      ...data.trading,

                      closedDays:
                        event.target
                          .value,
                    }
                  )
                }
                className="rounded-xl border p-3"
                placeholder="Closed days"
              />
            </div>
          ),
        },

        {
          title: "Rating",

          content: (
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={
                data.rating
              }
              onChange={(
                event
              ) =>
                updateReview(
                  "rating",
                  Number(
                    event.target
                      .value
                  )
                )
              }
              className="rounded-xl border p-3"
            />
          ),
        },
      ]}
    />
  );
};

export default Review;