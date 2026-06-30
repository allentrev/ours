import React, { useMemo } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import type {
  PlaceRecord,
  PlaceOption,
} from "../../types/familyTypes";

interface PlaceEditFormAreaProps {
  item: PlaceRecord;
  places: PlaceRecord[];
  setItem: (item: PlaceRecord) => void;
  isNew: boolean;
}

const PLACE_TYPES = [
  "Address",
  "Building",
  "Street",
  "District",
  "Village",
  "Town",
  "City",
  "County",
  "Region",
  "Country",
  "Unknown",
];

const iconButtonClass =
  "h-9 w-9 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center";

export const PlaceEditFormArea: React.FC<
  PlaceEditFormAreaProps
> = ({ item, places, setItem, isNew }) => {
  const isCountry = item.type === "Country";
  const isCounty = item.type === "County" || item.type === "Region";
  const isUrbanArea = ["Village", "Town", "City"].includes(item.type);
  const isAddress = ["Address", "Street", "Building", "District"].includes(item.type);
  
  const hasParentCountry = isCountry && (item.country?.length ?? 0) > 1;

  const { placeOptions } = useMemo(() => {
    const urbanAreas: PlaceOption[] = [];
    const counties: PlaceOption[] = [];
    const countries: PlaceOption[] = [];

    places.forEach((place) => {
      const option = {
        handle: place.handle,
        name: place.name,
      };

      switch (place.type) {
        case "Village":
        case "Town":
        case "City":
          urbanAreas.push(option);
          break;

        case "County":
        case "Region":
          counties.push(option);
          break;

        case "Country":
          countries.push(option);
          break;
      }
    });

    return {
      placeOptions: {
        urbanAreas: urbanAreas.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        counties: counties.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        countries: countries.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      },
    };
  }, [places]);

  const getCountryName = (handle?: string) =>
    placeOptions.countries.find((p) => p.handle === handle)?.name ?? "";

  const getCountyName = (handle?: string) =>
    placeOptions.counties.find((p) => p.handle === handle)?.name ?? "";

  const getUrbanAreaName = (handle?: string) =>
    placeOptions.urbanAreas.find((p) => p.handle === handle)?.name ?? "";

  const rebuildPlaceNames = (place: PlaceRecord): PlaceRecord => {
    const isCountryPlace = place.type === "Country";
    const isCountyPlace = place.type === "County" || place.type === "Region";
    const isUrbanAreaPlace = ["Village", "Town", "City"].includes(place.type);
    const isAddressPlace = place.type === "Address";

    let displayPlaceParts: string[] = [];
    let shortNameParts: string[] = [];
    let savedName = "";

    if (isAddressPlace) {
      displayPlaceParts = [
        place.line1 ?? "",
        place.line2 ?? "",
        getUrbanAreaName(place.urbanArea),
        getCountyName(place.county),
        getCountryName(place.country?.[0]),
      ];
      shortNameParts = [
        place.line1 ?? "",
        getUrbanAreaName(place.urbanArea),
        getCountryName(place.country?.[0]),
      ];
      savedName = place.line1 ?? "";
    }

    if (isUrbanAreaPlace) {
      displayPlaceParts = [
        place.name ?? "",
        getCountyName(place.county),
        getCountryName(place.country?.[0]),
      ];
      shortNameParts = [
        place.name ?? "",
        getCountryName(place.country?.[0]),
      ];
      savedName = place.name ?? "";
    }

    if (isCountyPlace) {
      displayPlaceParts = [
        place.name ?? "",
        getCountryName(place.country?.[0]),
      ];
      shortNameParts = [
        place.name ?? "",
        getCountryName(place.country?.[0]),
      ];
      savedName = place.name;
    }

    if (isCountryPlace) {
      displayPlaceParts = [
        place.name ?? "",
        getCountryName(place.country?.[1]),
      ];
      shortNameParts = [
        place.name ?? "",
        getCountryName(place.country?.[1]),
      ];
      savedName = place.name;      
    }

    return {
      ...place,
      name: savedName,
      shortName: shortNameParts
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", "),
      displayPlace: displayPlaceParts
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", "),
    };
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;

    setItem({
      ...item,
      type,
      line1: "",
      line2: "",
      urbanArea: "",
      county: "",
      country: [],
      name: "",
    });
};

  const updateCountry = (index: number, value: string) => {
    const country = [...(item.country ?? [])];

    if (value === "") {
      country.splice(index, 1);
    } else {
      country[index] = value;
    }

    setItem(
      rebuildPlaceNames({
        ...item,
        country,
      })
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedItem: PlaceRecord = {
      ...item,
      [name]: value,
    };

    setItem(rebuildPlaceNames(updatedItem));
  };

  const renderAddressFields = () => (
    <>
      <label className="flex flex-col">
        Line1:
        <input
          type="text"
          name="line1"
          value={item.line1 ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>

      <label className="flex flex-col">
        Line2:
        <input
          type="text"
          name="line2"
          value={item.line2 ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>

      {renderUrbanAreaSelect()}
      {renderCountySelect()}
      {renderCountrySelect()}
    </>
  );

  const renderUrbanAreaFields = () => (
    <>
      <label className="flex flex-col md:col-span-2">
        Village/Town/City:
        <input
          type="text"
          name="name"
          value={item.name ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>

      {renderCountySelect()}
      {renderCountrySelect()}
    </>
  );

  const renderCountyFields = () => (
    <>
      <label className="flex flex-col md:col-span-2">
        County:
        <input
          type="text"
          name="name"
          value={item.name ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>

      {renderCountrySelect()}
    </>
  );

  const renderCountryFields = () => (
    <>
      <label className="flex flex-col md:col-span-2">
        Country:
        <input
          type="text"
          name="name"
          value={item.name ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>

      {(isNew || hasParentCountry) && (
        <label className="flex flex-col md:col-span-2">
          Parent Country:
          <select
            value={item.country?.[1] ?? ""}
            onChange={(e) => {
              const country = [...(item.country ?? [])];

              if (e.target.value === "") {
                country.splice(1, 1);
              } else {
                country[1] = e.target.value;
              }

              setItem({
                ...item,
                country,
              });
            }}
            className="border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">None</option>

            {placeOptions.countries
              .filter((place) => place.handle !== item.handle)
              .map((place) => (
                <option
                  key={place.handle}
                  value={place.handle}
                >
                  {place.name}
                </option>
              ))}
          </select>
        </label>
      )}
    </>
  );

  const renderUrbanAreaSelect = () => (
    <label className="flex flex-col md:col-span-2">
      Village/Town/City:
      <select
        name="urbanArea"
        value={item.urbanArea ?? ""}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="">Select urban area</option>

        {placeOptions.urbanAreas.map((place) => (
          <option key={place.handle} value={place.handle}>
            {place.name}
          </option>
        ))}
      </select>
    </label>
  );

  const renderCountySelect = () => (
    <label className="flex flex-col md:col-span-2">
      County:
      <select
        name="county"
        value={item.county ?? ""}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="">Select county</option>

        {placeOptions.counties.map((place) => (
          <option key={place.handle} value={place.handle}>
            {place.name}
          </option>
        ))}
      </select>
    </label>
  );

  const renderCountrySelect = () => (
    <label className="flex flex-col md:col-span-2">
      Country:
      <select
        value={item.country?.[0] ?? ""}
        onChange={(e) => updateCountry(0, e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="">Select country</option>

        {placeOptions.countries.map((place) => (
          <option key={place.handle} value={place.handle}>
            {place.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form
      id="edit-form"
      className="bg-white shadow-md rounded p-4 my-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">
        {isNew ? "Create Place" : "Edit Place"}
      </h2>
      {isNew && (
        <fieldset className="border border-gray-300 rounded p-4">
          <legend className="px-2 font-semibold text-gray-700">
            Type
          </legend>

          <label className="flex flex-col">
            Place Type:
            <select
              name="type"
              value={item.type ?? ""}
              onChange={handleTypeChange}
              className="border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value="">Select place type</option>

              {PLACE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}
      {/* Place Box */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Place
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAddress && renderAddressFields()}
          {isUrbanArea && renderUrbanAreaFields()}
          {isCounty && renderCountyFields()}
          {isCountry && renderCountryFields()}
        </div>
      </fieldset>

      {/* Other Box */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Other
        </legend>

        <div className="flex items-end gap-2">
          <label className="flex flex-col w-24">
            Notes:
            <input
              type="text"
              value={item.noteHandles?.length ?? 0}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <button
            type="button"
            className={iconButtonClass}
            title="New note"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            className={iconButtonClass}
            title="Select note"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </fieldset>

      {/* Ids Box */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Ids
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            Handle:
            <input
              type="text"
              value={item.handle}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Gramps Id:
            <input
              type="text"
              value={item.grampsId}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Type:
            <input
              type="text"
              value={item.type}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>
        </div>
      </fieldset>
    </form>
  );
};

export default PlaceEditFormArea;