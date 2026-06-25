import { useEffect, useState } from "react";

import type { PlaceRecord } from "../../types/familyTypes";

import { searchFamilyPlaces } from "../../utilities/Family/utils";

interface PlaceSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlace: (place: PlaceRecord) => void;
}

export default function PlaceSelectorModal({
  open,
  onClose,
  onSelectPlace,
}: PlaceSelectorModalProps) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [selectedPlace, setSelectedPlace] =
    useState<PlaceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setPlaces([]);
    setSelectedPlace(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const results = await searchFamilyPlaces(query);
        setPlaces(results);
      } catch (error) {
        console.error(error);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  if (!open) return null;

  const handleSelectPlace = () => {
    if (!selectedPlace) return;
    onSelectPlace(selectedPlace);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">
          Select Place
        </h2>

        <div className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Search places..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            autoFocus
          />

          <div className="max-h-80 overflow-auto border border-gray-200 rounded">
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Searching...
              </div>
            )}

            {!loading && places.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No places found.
              </div>
            )}

            {!loading &&
              places.map((place) => (
                <button
                  key={place.handle}
                  type="button"
                  onClick={() => setSelectedPlace(place)}
                  className={`block w-full text-left px-3 py-2 border-b hover:bg-blue-50 ${
                    selectedPlace?.handle === place.handle
                      ? "bg-blue-100"
                      : ""
                  }`}
                >
                  <div className="font-medium">
                    {place.displayPlace}
                  </div>

                  <div className="text-xs text-gray-500">
                    {place.type} · {place.grampsId}
                  </div>
                </button>
              ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!selectedPlace}
              onClick={handleSelectPlace}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:bg-gray-300"
            >
              Select Place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}