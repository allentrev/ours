// backend/controllers/family.controller.ts
import crypto from "crypto";

import type { Request, Response } from "express";
import type {} from "multer";

import { PersonModel } from "../models/Family/person.model.js";
import { PlaceModel } from "../models/Family/place.model.js";
import { NoteModel } from "../models/Family/note.model.js";
import { 
  generateHandle,
  generateLocalPersonId,
  generateLocalFamilyId,
  generateLocalPlaceId,
  generateLocalNoteId,
  generateLocalMediaId,
} from "../lib/familyIdGenerator.js";

import type {
  PersonDocument,
  PersonRecord,
  FamilyRecord,
  FamilyDocument,
  PlaceDocument,
  PlaceRecord,
  NoteDocument,
  NoteRecord,
} from "../types/family.types.js"

import { parseGrampsBuffer } from "../lib/grampsParser.js";

import { geocodePlace } from "../lib/geocodePlace.js";
import { buildFamilyTreeFromDb } from "../services/familyTreeDb.service.js";
import { importFamilyDataToMongo } from "../services/familyImport.service.js";
import { FamilyModel } from "../models/Family/index.js";

const modName ="/controllers/family.controller/";

const getDefaultFamilyPersonHandle = async (): Promise<string> => {
  const person = await PersonModel.findOne({})
    .sort({ createdAt: -1 })
    .lean<PersonRecord>();

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
    //console.log("Result of parseGrampsBuffer, parsedData", parsedData);

    const result = await importFamilyDataToMongo(
      parsedData,
      req.file.originalname
    );
    //console.log("Result of importFamilyDataToMongo, result", result);
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

    const results = await PersonModel.find({
      displayName: {
        $regex: query,
        $options: "i",
      },
    })
      .sort({ displayName: 1 })
      .limit(20)
      .lean<PersonRecord[]>();

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
        const person: PersonDocument[] = await PersonModel.find().sort({
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
    const funcName="createPerson";
    const handle = generateHandle();
    const localId = generateLocalPersonId();
    const orign="local";

    try {
        console.log(`${modName}${funcName} body:`, req.body);
        const newPerson = new PersonModel(req.body);
        newPerson.handle = handle;
        newPerson.grampsId = localId;
        newPerson.localId = localId;
        newPerson.origin = orign;
        const savedPerson: PersonDocument = await newPerson.save();
        console.log("Person created");
        res.status(201).json(savedPerson);
    } catch (error) {
        console.error("Person Save Failed:", error);
        res.status(500).json({ message: "Error creating Person", error });
    }
};

export const readPerson = async (
  req: Request<{ personId: string }>,
  res: Response
) => {
  const funcName="readPerson";
  try {
    const person = await PersonModel.findOne({
      handle: req.params.personId,
    }).lean<PersonRecord>();

    if (!person) {
      console.warn(`${modName}${funcName} Failed to find person`);
      return res.status(404).json({
        success: false,
        message: "Person not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Person retrieved successfully",
      data: person,
    });
  } catch (error) {
    console.warn(`${modName}${funcName} Catch error Failed to retrieve person`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve person",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePerson = async (
    req: Request<{ personId: string }, {}, Partial<PersonDocument>>,
    res: Response
) => {
    try {
        const wPersonId = req.params.personId;
        const updateData = req.body;
        console.log("family.controller, updatePerson", wPersonId, updateData);

        const updatedPerson: PersonDocument | null =
            await PersonModel.findOneAndUpdate({ handle: wPersonId }, updateData, {
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
    req: Request<{ personId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deletePerson");
        const wPersonId = req.params.personId;

        const deletedPerson = await PersonModel.findOneAndDelete({ handle: wPersonId });

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

    const options = await buildFamilyPlaceOptions();

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
  console.log("controller: buildFamilyPlaceOptions");
  const places = await PlaceModel.find({})
    .lean<PlaceRecord[]>();

  const toOption = (place: {
    handle: string;
    name: string;
  }) => ({
    handle: place.handle,
    name: place.name,
  });

  return {
    places: places,
    urbanAreas: places
      .filter((place) =>
        ["Village", "Town", "City"].includes(place.type)
      )
      .map(toOption)
      .sort((a, b) => a.name.localeCompare(b.name)),

    counties: places
      .filter((place) =>
        ["County", "Region"].includes(place.type)
      )
      .map(toOption)
      .sort((a, b) => a.name.localeCompare(b.name)),

    countries: places
      .filter((place) => place.type === "Country")
      .map(toOption)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export const getPlaceName = async (handle: string) => {
  try {
    const place = await PlaceModel.findOne( {handle});
    if (place) {
      return place.name;
    } else {
      return undefined;
    }
  } catch (err) {
    console.log("controller: getPlaceName try catch error", err);
  }
}

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
    req: Request<{ grampsId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deletePlace");
        const wGrampsId = req.params.grampsId;

        const deletedPlace = await PlaceModel.findOneAndDelete({ wGrampsId });

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

//  ---------------------------------- Note -----------------------------------
//

export const getAllNotes = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllNotes");
        const notes = await NoteModel.find().lean<NoteRecord[]>();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notes", error });
    }
};

export const createNote = async (
    req: Request<{}, {}, Partial<NoteDocument>>,
    res: Response
) => {
    const handle = generateHandle();
    const localId = generateLocalNoteId();
    const orign="local";

    try {
        console.log("family.controller, createNote", req.body);
        const newNote = new NoteModel(req.body);
        newNote.handle = handle;
        newNote.grampsId = localId;
        newNote.localId = localId;
        newNote.origin = orign;
        const savedNote = await newNote.save();
        console.log("Note created");
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Note Save Failed:", error);
        res.status(500).json({ message: "Error creating Note", error });
    }
};

export const readNote = async (
  req: Request<{ noteId: string }>,
  res: Response
) => {
  const funcName="readNote";
  try {
    const note = await NoteModel.findOne({
      handle: req.params.noteId,
    }).lean<NoteRecord>();

    if (!note) {
      console.warn(`${modName}${funcName} Failed to find note ${req.params.noteId}`);
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note retrieved successfully",
      data: note,
    });
  } catch (error) {
    console.warn(`${modName}${funcName} Catch error Failed to retrieve note`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve note",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateNote = async (
    req: Request<{ noteId: string }, {}, Partial<NoteDocument>>,
    res: Response
) => {
    try {
        const wNoteId = req.params.noteId;
        const updateData = req.body;
        console.log("family.controller, updateNote", wNoteId, updateData);

        const updatedNote: NoteDocument | null =
            await NoteModel.findOneAndUpdate({ handle: wNoteId }, updateData, {
                new: true,
            });

        if (!updatedNote)
            return res.status(404).json({ message: "Note not found" });
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error updating Note:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteNote = async (
    req: Request<{ grampsId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deleteNote");
        const wGrampsId = req.params.grampsId;

        const deletedNote = await NoteModel.findOneAndDelete({ wGrampsId });

        if (!deletedNote) {
            return res
                .status(404)
                .json({ message: "Note not found or already deleted" });
        }

        res.status(200).json({ message: "Note has been deleted" });
    } catch (error) {
        console.error("Error deleting Note:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

//  ---------------------------------- Family -----------------------------------
//
export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllFamilies");
        const families = await FamilyModel.find().lean<FamilyRecord[]>();
        res.status(200).json(families);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch families", error });
    }
};

export const createFamily = async (
    req: Request<{}, {}, Partial<FamilyDocument>>,
    res: Response
) => {
    const handle = generateHandle();
    const localId = generateLocalFamilyId();
    const orign="local";

    try {
        console.log("family.controller, createFamily", req.body);
        const newFamily = new FamilyModel(req.body);
        newFamily.handle = handle;
        newFamily.grampsId = localId;
        newFamily.localId = localId;
        newFamily.origin = orign;
        const savedFamily = await newFamily.save();
        console.log("Family created");
        res.status(201).json(savedFamily);
    } catch (error) {
        console.error("Family Save Failed:", error);
        res.status(500).json({ message: "Error creating Family", error });
    }
};

export const readFamily = async (
  req: Request<{ familyId: string }>,
  res: Response
) => {
  const funcName="readFamily";
  try {
    const family = await FamilyModel.findOne({
      handle: req.params.familyId,
    }).lean<FamilyRecord>();

    if (!family) {
      console.warn(`${modName}${funcName} Failed to find family ${req.params.familyId}`);
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Family retrieved successfully",
      data: family,
    });
  } catch (error) {
    console.warn(`${modName}${funcName} Catch error Failed to retrieve family`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve family",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateFamily = async (
    req: Request<{ familyId: string }, {}, Partial<FamilyDocument>>,
    res: Response
) => {
    try {
        const wFamilyId = req.params.familyId;
        const updateData = req.body;
        console.log("family.controller, updateFamily", wFamilyId, updateData);

        const updatedFamily: FamilyDocument | null =
            await FamilyModel.findOneAndUpdate({ handle: wFamilyId }, updateData, {
                new: true,
            });

        if (!updatedFamily)
            return res.status(404).json({ message: "Family not found" });
        res.status(200).json(updatedFamily);
    } catch (error) {
        console.error("Error updating Family:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteFamily = async (
    req: Request<{ familyId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deleteFamily");
        const wFamilyId = req.params.familyId;

        const deletedFamily = await FamilyModel.findOneAndDelete({ handle: wFamilyId });

        if (!deletedFamily) {
            return res
                .status(404)
                .json({ message: "Family not found or already deleted" });
        }

        res.status(200).json({ message: "Family has been deleted" });
    } catch (error) {
        console.error("Error deleting Family:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
