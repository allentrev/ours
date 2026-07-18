import type { Request, Response } from "express";
import type {} from "multer";

import { PlaceModel } from "../../models/Family/place.model.js";
import { 
  generateHandle,
  generateLocalPlaceId,
} from "../../lib/familyIdGenerator.js";

import {
  useBuildFamilyPlaceOptions,
  usePlaceName,
} from "../../services/place.service.js";

import type {
  PlaceDocument,
  PlaceRecord,
} from "../../types/family.types.js"

import { geocodePlace } from "../../lib/geocodePlace.js";

const modName ="/controllers/family.controller/";

export const searchFamilyPlaces = async (
  req: Request,
  res: Response
) => {
  try {
    const query =
      typeof req.query.q === "string" ? req.query.q.trim() : "";

    const results = await PlaceModel.find({
      displayPlace: {
        $regex: query,
        $options: "i",
      },
    })
      .sort({ displayPlace: 1 })
      .limit(30)
      .lean<PlaceRecord[]>();

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

    const place = await PlaceModel.create({
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

    const existing = await PlaceModel.findOne({
      type,
      displayPlace,
    }).lean<PlaceRecord>();

    if (existing) {
      const options = await useBuildFamilyPlaceOptions();

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

    const place = await PlaceModel.create({
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

    const options = await useBuildFamilyPlaceOptions();

    return res.status(201).json({
      success: true,
      message: "Place created successfully",
      data: {
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
    const options = await useBuildFamilyPlaceOptions();

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

export const getPlaceName = async (
  req: Request<{ placeId: string }>,
  res: Response
) => {
  const funcName = "getPlaceName";

  try {
    const name = await usePlaceName(
      req.params.placeId
    );

    if (!name) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Place name retrieved successfully",
      data: name,
    });
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve place name",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllPlaces");
        const places = await PlaceModel.find().sort({
            name: 1,
        }).lean<PlaceRecord[]>();
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch places", error });
    }
};

export const createPlace = async (
    req: Request<{}, {}, Partial<PlaceDocument>>,
    res: Response
) => {
    const handle = generateHandle();
    const localId = generateLocalPlaceId();
    const orign="local";

    try {
        console.log("family.controller, createPlace", req.body);
        const newPlace = new PlaceModel(req.body);
        newPlace.handle = handle;
        newPlace.grampsId = localId;
        newPlace.localId = localId;
        newPlace.origin = orign;
        const savedPlace = await newPlace.save();
        console.log("Place created");
        res.status(201).json(savedPlace);
    } catch (error) {
        console.error("Place Save Failed:", error);
        res.status(500).json({ message: "Error creating Place", error });
    }
};

export const readPlace = async (
  req: Request<{ placeId: string }>,
  res: Response
) => {
  const funcName="readPlace";
  try {
    const place = await PlaceModel.findOne({
      handle: req.params.placeId,
    }).lean<PlaceRecord>();

    if (!place) {
      console.warn(`${modName}${funcName} Failed to find place ${req.params.placeId}`);
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Place retrieved successfully",
      data: place,
    });
  } catch (error) {
    console.warn(`${modName}${funcName} Catch error Failed to retrieve place`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve place",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePlace = async (
    req: Request<{ placeId: string }, {}, Partial<PlaceDocument>>,
    res: Response
) => {
    try {
        const wPlaceId = req.params.placeId;
        const updateData = req.body;
        console.log("family.controller, updatePlace", wPlaceId, updateData);

        const updatedPlace: PlaceDocument | null =
            await PlaceModel.findOneAndUpdate({ handle: wPlaceId }, updateData, {
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
    req: Request<{ placeId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deletePlace");
        const wPlaceId = req.params.placeId;

        const deletedPlace = await PlaceModel.findOneAndDelete({ handle: wPlaceId });

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