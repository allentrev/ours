import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

import type {
  CreateSimplePlaceRequest,
  NewPlaceKind,
  PlaceOptions,
  PlaceRecord,
  UrbanPlaceType,
} from "../../types/familyTypes";

import { createSimpleFamilyPlace } from "../../utilities/Family/utils";
import { urbanPlaceTypes } from "@/constants/familyTree.constants";

interface NewPlaceModalProps {
  open: boolean;
  placeOptions: PlaceOptions;
  onClose: () => void;
  onPlaceCreated: (
    place: PlaceRecord,
    options: PlaceOptions
  ) => void;
}

const defaultKind: NewPlaceKind = "country";

export default function NewPlaceModal({
  open,
  placeOptions,
  onClose,
  onPlaceCreated,
}: NewPlaceModalProps) {
  const { getToken } = useAuth();

  const [kind, setKind] = useState<NewPlaceKind>(defaultKind);
  const [name, setName] = useState("");
  const [placeType, setPlaceType] =
    useState<UrbanPlaceType>("Town");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setKind(defaultKind);
    setName("");
    setPlaceType("Town");
    setCountry("");
    setCounty("");
    setError("");
  }, [open]);

  const displayPlace =
    kind === "country"
      ? name
      : kind === "county"
        ? [name, country].filter(Boolean).join(", ")
        : [name, county, country].filter(Boolean).join(", ");

  const validate = () => {
    if (!name.trim()) {
      return "Name is required.";
    }

    if (kind === "county" && !country.trim()) {
      return "Country is required for a county.";
    }

    if (kind === "urbanArea" && !country.trim()) {
      return "Country is required for an urban area.";
    }

    if (kind === "urbanArea" && !placeType) {
      return "Urban area type is required.";
    }

    return "";
  };

  const handleCreate = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const request: CreateSimplePlaceRequest = {
      kind,
      name: name.trim(),
      placeType: kind === "urbanArea" ? placeType : undefined,
      county:
        kind === "urbanArea" && county.trim()
          ? county.trim()
          : undefined,
      country:
        kind === "county" || kind === "urbanArea"
          ? country.trim()
          : undefined,
    };
    const token = await getToken();
    const result = await createSimpleFamilyPlace(request, token);

    onPlaceCreated(result.place, result.options);
  };

if (!open) return null;

return (
  <div
    className="
      fixed inset-0 z-50
      flex items-center justify-center
      overflow-y-auto
      bg-black/40 p-4
    "
  >
    <div
      className="
        flex w-full max-w-xl
        max-h-[calc(100vh-2rem)]
        flex-col
        overflow-hidden
        rounded-xl bg-white
        shadow-xl
      "
    >
      {/* Header */}
      <div className="shrink-0 border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          New Place
        </h2>
      </div>

      {/* Scrollable form */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          <fieldset className="rounded border border-gray-300 p-4">
            <legend className="px-2 font-semibold text-gray-700">
              Place Level
            </legend>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={kind === "country"}
                  onChange={() => setKind("country")}
                />
                Country
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={kind === "county"}
                  onChange={() => setKind("county")}
                />
                County / Region
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={kind === "urbanArea"}
                  onChange={() => setKind("urbanArea")}
                />
                Urban Area
              </label>
            </div>
          </fieldset>

          <label className="flex flex-col">
            {kind === "country"
              ? "Country Name:"
              : kind === "county"
                ? "County / Region Name:"
                : "Urban Area Name:"}

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>

          {kind === "urbanArea" && (
            <label className="flex flex-col">
              Urban Area Type:

              <select
                value={placeType}
                onChange={(event) =>
                  setPlaceType(
                    event.target.value as UrbanPlaceType
                  )
                }
                className="rounded border border-gray-300 bg-white px-2 py-1"
              >
                {urbanPlaceTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </label>
          )}

          {(kind === "county" ||
            kind === "urbanArea") && (
            <label className="flex flex-col">
              Country:

              <select
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                className="rounded border border-gray-300 bg-white px-2 py-1"
              >
                <option value="">
                  Select country...
                </option>

                {placeOptions.countries.map(
                  (option) => (
                    <option
                      key={option.handle}
                      value={option.name}
                    >
                      {option.name}
                    </option>
                  )
                )}
              </select>
            </label>
          )}

          {kind === "urbanArea" && (
            <label className="flex flex-col">
              County / Region:

              <select
                value={county}
                onChange={(event) =>
                  setCounty(event.target.value)
                }
                className="rounded border border-gray-300 bg-white px-2 py-1"
              >
                <option value="">
                  None / unknown
                </option>

                {placeOptions.counties.map(
                  (option) => (
                    <option
                      key={option.handle}
                      value={option.name}
                    >
                      {option.name}
                    </option>
                  )
                )}
              </select>
            </label>
          )}

          <div className="rounded bg-gray-50 p-3 text-sm">
            <span className="font-semibold">
              Display Place:{" "}
            </span>

            {displayPlace || "—"}
          </div>

          {error && (
            <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="flex shrink-0 justify-end gap-2 border-t bg-white px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Create Place
        </button>
      </div>
    </div>
  </div>
)};