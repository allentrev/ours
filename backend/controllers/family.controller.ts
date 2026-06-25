// backend/controllers/family.controller.ts
import crypto from "crypto";

import type { Request, Response } from "express";

import { Person } from "../models/Family/person.model.js";
import { Place } from "../models/Family/place.model.js";

import type {
  PersonDocument,
  PlaceDocument,
} from "../types/family.types.js"

import { parseGrampsBuffer } from "../lib/grampsParser.js";

import { geocodePlace } from "../lib/geocodePlace.js";
import { buildFamilyTreeFromDb } from "../services/familyTreeDb.service.js";
import { importFamilyDataToMongo } from "../services/familyImport.service.js";

const getDefaultFamilyPersonHandle = async (): Promise<string> => {
  const person = await Person.findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!person) {
    throw new Error("No family people found");
  }

  return person.handle;
};

export const importGrampsFile = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("controller: importGrampsFIle");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Gramps file uploaded",
      });
    }

    const parsedData = parseGrampsBuffer(req.file.buffer);
    console.log("Result of parseGrampsBuffer, parsedData", parsedData.people.length);

    const result = await importFamilyDataToMongo(
      parsedData,
      req.file.originalname
    );
    console.log("Result of importFamilyDataToMongo, result", result);
    return res.status(200).json({
      success: true,
      message: "Gramps file imported successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to import Gramps file",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const getFamilyTree = async (req: Request, res: Response) => {
  try {
    const personHandle =
      typeof req.query.personHandle === "string"
        ? req.query.personHandle
        : undefined;

    const startPersonHandle =
      personHandle ?? (await getDefaultFamilyPersonHandle());

    const mode =
      req.query.mode === "ancestors" ? "ancestors" : "descendants";

    const { selectedPerson, tree } = await buildFamilyTreeFromDb(
      startPersonHandle,
      mode
    );

    return res.status(200).json({
      success: true,
      message: "Family tree retrieved successfully",
      data: {
        selectedPerson,
        ...tree,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve family tree",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const searchFamilyPeople = async (
  req: Request,
  res: Response
) => {
  try {
    const query =
      typeof req.query.q === "string" ? req.query.q.trim() : "";

    const results = await Person.find({
      displayName: {
        $regex: query,
        $options: "i",
      },
    })
      .sort({ displayName: 1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Family people retrieved successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search family people",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};
//  ---------------------------------- Person -----------------------------------
//
export const getAllPersons = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllPersons");
        const person: PersonDocument[] = await Person.find().sort({
            surname: 1,
        });
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch perosns", error });
    }
};


export const createPerson = async (
    req: Request<{}, {}, Partial<PersonDocument>>,
    res: Response
) => {
    try {
        console.log("family.controller, createPerson", req.body);
        const newPerson = new Person(req.body);
        const savedPerson: PersonDocument = await newPerson.save();
        console.log("Person created");
        res.status(201).json(savedPerson);
    } catch (error) {
        console.error("Person Save Failed:", error);
        res.status(500).json({ message: "Error creating Person", error });
    }
};

export const updatePerson = async (
    req: Request<{ grampsId: string }, {}, Partial<PersonDocument>>,
    res: Response
) => {
    try {
        const wGrampsId = req.params.grampsId;
        const updateData = req.body;
        console.log("family.controller, updatePerson", wGrampsId, updateData);

        const updatedPerson: PersonDocument | null =
            await Person.findOneAndUpdate({ wGrampsId }, updateData, {
                new: true,
            });

        if (!updatedPerson)
            return res.status(404).json({ message: "Person not found" });
        res.status(200).json(updatedPerson);
    } catch (error) {
        console.error("Error updating Person:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deletePerson = async (
    req: Request<{ grampsId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deletePerson");
        const wGrampsId = req.params.grampsId;

        const deletedPerson = await Person.findOneAndDelete({ wGrampsId });

        if (!deletedPerson) {
            return res
                .status(404)
                .json({ message: "Person not found or already deleted" });
        }

        res.status(200).json({ message: "Person has been deleted" });
    } catch (error) {
        console.error("Error deleting Person:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
//  ---------------------------------- Place -----------------------------------
//
export const searchFamilyPlaces = async (
  req: Request,
  res: Response
) => {
  try {
    const query =
      typeof req.query.q === "string" ? req.query.q.trim() : "";

    const results = await Place.find({
      displayPlace: {
        $regex: query,
        $options: "i",
      },
    })
      .sort({ displayPlace: 1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Places retrieved successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search places",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createFamilyPlace = async (
  req: Request,
  res: Response
) => {
  try {
    const geocodeName =
      typeof req.body.geocodeName === "string"
        ? req.body.geocodeName
        : "";

    const geo = geocodeName ? await geocodePlace(geocodeName) : {};

    const place = await Place.create({
      handle: crypto.randomUUID(),
      grampsId: `P${Date.now()}`,
      type: req.body.type ?? "Address",
      line1: req.body.line1 ?? undefined,
      line2: req.body.line2 ?? undefined,
      urbanArea: req.body.urbanArea ?? undefined,
      county: req.body.county ?? undefined,
      country: req.body.country ?? [],
      code: req.body.type === "Address" ? req.body.code ?? undefined : undefined,
      displayPlace: req.body.displayPlace,
      latitude: geo.latitude,
      longitude: geo.longitude,
      noteHandles: [],
    });

    return res.status(201).json({
      success: true,
      message: "Place created successfully",
      data: place,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create place",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createSimpleFamilyPlace = async (
  req: Request,
  res: Response
) => {
  try {
    const kind = req.body.kind as
      | "country"
      | "county"
      | "urbanArea";

    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";

    const placeType = req.body.placeType as
      | "Village"
      | "Town"
      | "City"
      | undefined;

    const county =
      typeof req.body.county === "string"
        ? req.body.county.trim()
        : "";

    const country =
      typeof req.body.country === "string"
        ? req.body.country.trim()
        : "";

    if (!kind || !name) {
      return res.status(400).json({
        success: false,
        message: "Place kind and name are required",
      });
    }

    if (kind === "county" && !country) {
      return res.status(400).json({
        success: false,
        message: "Country is required for a county",
      });
    }

    if (kind === "urbanArea" && !country) {
      return res.status(400).json({
        success: false,
        message: "Country is required for an urban area",
      });
    }

    if (kind === "urbanArea" && !placeType) {
      return res.status(400).json({
        success: false,
        message: "Urban place type is required",
      });
    }

    const displayPlace =
      kind === "country"
        ? name
        : kind === "county"
          ? [name, country].filter(Boolean).join(", ")
          : [name, county, country].filter(Boolean).join(", ");

    const type =
      kind === "country"
        ? "Country"
        : kind === "county"
          ? "County"
          : placeType;

    const existing = await Place.findOne({
      type,
      displayPlace,
    }).lean();

    if (existing) {
      const options = await buildFamilyPlaceOptions();

      return res.status(200).json({
        success: true,
        message: "Place already exists",
        data: {
          place: existing,
          options,
        },
      });
    }

    const geo = await geocodePlace(displayPlace);

    const place = await Place.create({
      handle: crypto.randomUUID(),
      grampsId: `P${Date.now()}`,
      type,
      line1: undefined,
      line2: undefined,
      urbanArea: kind === "urbanArea" ? name : undefined,
      county:
        kind === "county"
          ? name
          : kind === "urbanArea"
            ? county || undefined
            : undefined,
      country: country ? [country] : kind === "country" ? [name] : [],
      code: undefined,
      displayPlace,
      latitude: geo.latitude,
      longitude: geo.longitude,
      noteHandles: [],
    });

    const options = await buildFamilyPlaceOptions();

    return res.status(201).json({
      success: true,
      message: "Place created successfully",
      data: {
        place,
        options,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create place",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFamilyPlaceOptions = async (
  _req: Request,
  res: Response
) => {
  try {
    const options = await buildFamilyPlaceOptions();

    return res.status(200).json({
      success: true,
      message: "Place options retrieved successfully",
      data: options,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve place options",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const buildFamilyPlaceOptions = async () => {
  const places = await Place.find({})
    .select("type urbanArea county country displayPlace")
    .lean();

  const urbanAreas = new Set<string>();
  const counties = new Set<string>();
  const countries = new Set<string>();

  places.forEach((place) => {
    if (place.urbanArea) urbanAreas.add(place.urbanArea);
    if (place.county) counties.add(place.county);

    (place.country ?? []).forEach((country: string) => {
      if (country) countries.add(country);
    });

    if (place.type === "Country" && place.displayPlace) {
      countries.add(place.displayPlace);
    }

    if (
      (place.type === "County" || place.type === "Region") &&
      place.displayPlace
    ) {
      counties.add(place.displayPlace.split(",")[0].trim());
    }

    if (
      ["Village", "Town", "City"].includes(place.type) &&
      place.displayPlace
    ) {
      urbanAreas.add(place.displayPlace.split(",")[0].trim());
    }
  });

  return {
    urbanAreas: [...urbanAreas].sort(),
    counties: [...counties].sort(),
    countries: [...countries].sort(),
  };
};

export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllPlaces");
        const dbPlaces = await Place.find().sort({
            displayPlace: 1,
        }).lean();
        let shortName = "";
        const place = dbPlaces.map( item => {
          /*
          let newPlace: PlaceDocument = {
              handle: "",
              grampsId: "",
              type: "",
              line1?: "",
              line2?: "",
              urbanArea?: "",
              county?: "",
              country?: [],
              code?: "",
              name: "",
              shortName: "",
              displayPlace: "",
              latitude?: 0,
              longitude?: 0,
              noteHandles?: [],
          
              importBatchId?: "",  
          };
          */
          let newPlace = {shortName: "", ...item};

          switch (item.type) {
            case "address":
              if (item.line1) {
                shortName = item.line1 + getPlaceName(item.urbanArea);
              } else if (item.line2) {
                shortName = item.line2 + getPlaceName(item.urbanArea);
              };
              break;
            case "village":
            case "town":
            case "city":
              shortName = getPlaceName("urban", item.urbanArea);
              break;
            case "county":
              shortName = getPlaceName("county", item.county);
              break;
            case "country":
              shortName = getPlaceName("country", item.country[0]);
            default:
              console.log("controller: getAllPlaces, unknown place.type", item);
              break;
          }
          newPlace.shortName = shortName;
          return newPlace;
        })
        res.status(200).json(place);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch places", error });
    }
};

const getPlaceName = async (type: string, handle: string) => {
  const place = await Place.findOne( {handle});
  if (place) {
    switch (type) {
      case "urban":
        return place.name;
        break;
    
      default:
        break;
    }
  }

}

export const createPlace = async (
    req: Request<{}, {}, Partial<PlaceDocument>>,
    res: Response
) => {
    try {
        console.log("family.controller, createPlace", req.body);
        const newPlace = new Place(req.body);
        const savedPlace = await newPlace.save();
        console.log("Place created");
        res.status(201).json(savedPlace);
    } catch (error) {
        console.error("Place Save Failed:", error);
        res.status(500).json({ message: "Error creating Place", error });
    }
};

export const updatePlace = async (
    req: Request<{ grampsId: string }, {}, Partial<PlaceDocument>>,
    res: Response
) => {
    try {
        const wGrampsId = req.params.grampsId;
        const updateData = req.body;
        console.log("family.controller, updatePlace", wGrampsId, updateData);

        const updatedPlace: PlaceDocument | null =
            await Person.findOneAndUpdate({ wGrampsId }, updateData, {
                new: true,
            });

        if (!updatedPlace)
            return res.status(404).json({ message: "Place not found" });
        res.status(200).json(updatedPlace);
    } catch (error) {
        console.error("Error updating Place:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deletePlace = async (
    req: Request<{ grampsId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deletePlace");
        const wGrampsId = req.params.grampsId;

        const deletedPlace = await Place.findOneAndDelete({ wGrampsId });

        if (!deletedPlace) {
            return res
                .status(404)
                .json({ message: "Place not found or already deleted" });
        }

        res.status(200).json({ message: "Place has been deleted" });
    } catch (error) {
        console.error("Error deleting Place:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
