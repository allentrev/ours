import { PlaceModel } from "../models/Family/place.model.js";

import type {
  PlaceRecord,
  PlaceOptions,
} from "../types/family.types.js";

export const useBuildFamilyPlaceOptions =
  async (): Promise<PlaceOptions> => {
    const places = await PlaceModel.find({})
      .lean<PlaceRecord[]>();

    const toOption = (place: PlaceRecord) => ({
      handle: place.handle,
      name: place.name,
    });

    return {
      places,

      urbanAreas: places
        .filter((place) =>
          ["Village", "Town", "City"].includes(
            place.type
          )
        )
        .map(toOption)
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        ),

      counties: places
        .filter((place) =>
          ["County", "Region"].includes(
            place.type
          )
        )
        .map(toOption)
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        ),

      countries: places
        .filter(
          (place) =>
            place.type === "Country"
        )
        .map(toOption)
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
    };
  };

export const usePlaceName = async (
  handle: string
): Promise<string | undefined> => {
  const place = await PlaceModel.findOne({
    handle,
  })
    .select({
      name: 1,
    })
    .lean<Pick<PlaceRecord, "name">>();

  return place?.name;
};