import path from "path";

import {
  PersonModel,
  FamilyModel,
  PlaceModel,
  NoteModel,
  MediaModel,
  ImportBatchModel,
} from "../models/Family/index.js";

import { parseGrampsFile } from "../lib/grampsParser.js";
import { geocodePlace } from "../lib/geocodePlace.js";

export const importFamilyDataToMongo = async () => {
  console.log("Services: ImportFamilDataToMongo");
  // Create import batch record
  const importBatch = await ImportBatchModel.create({
    source: "gramps",
    filename: "data.gramps",
  });
  //console.log("Schema created");
  const filePath = path.join(process.cwd(), "test-data", "test4.gramps");
  const parsedData = await parseGrampsFile(filePath);
  
  const peopleCount = parsedData.people.length;
  const familyCount = parsedData.families.length;
  const placeCount = parsedData.places.length;
  const noteCount = parsedData.notes.length;

  importBatch.peopleCount = peopleCount;
  importBatch.familyCount = familyCount;
  importBatch.placeCount = placeCount;
  importBatch.noteCount = noteCount;
  importBatch.mediaCount = 0;
// --------------------------------------- Notes -----------------------
//
  await NoteModel.deleteMany({});
  //console.log("Import service notes", parsedData.notes);
  const noteRecords = parsedData.notes.map((note) => {
    //console.log("In map, note", note);
    return {
      handle: note.handle,
      grampsId: note.grampsId,
      type: note.type,
      text: note.text,
      importBatchId: importBatch._id,
    }
  })
  //console.log("mapped records", noteRecords);
  await NoteModel.insertMany(noteRecords);
  const mongoNoteCount = await NoteModel.countDocuments();
// --------------------------------------- Person -----------------------
//
  await PersonModel.deleteMany({});
  await PersonModel.insertMany(
    parsedData.people.map((person) => ({
      handle: person.handle,
      grampsId: person.grampsId,

      displayName: person.displayName,
      gender: person.gender,

      birthDate: person.birthDate,
      deathDate: person.deathDate,

      deceased: Boolean(person.deathDate),

      birthPlaceHandle: person.birthPlaceHandle,
      deathPlaceHandle: person.deathPlaceHandle,

      mediaHandles: person.mediaHandles ?? [],
      noteHandles: person.noteHandles ?? [],

      primaryPhotoMediaHandle:
        person.primaryPhotoMediaHandle,
      
      importBatchId: importBatch._id,
    }))
  );
  const mongoPeopleCount = await PersonModel.countDocuments();
// --------------------------------------- Family -----------------------
//
  await FamilyModel.deleteMany({});
  await FamilyModel.insertMany(
    parsedData.families.map((family) => ({
      handle: family.handle,
      grampsId: family.grampsId,

      fatherHandle: family.fatherHandle ?? null,
      motherHandle: family.motherHandle ?? null,
      childHandles: family.childHandles ?? [],

      mediaHandles: family.mediaHandles ?? [],
      noteHandles: family.noteHandles ?? [],

      relationshipType: family.relationshipType ?? "unknown",
      relationshipDate: family.relationshipDate ?? null,
      relationshipPlaceHandle: family.relationshipPlaceHandle ?? null,

      importBatchId: importBatch._id,
    }))
  )
  const mongoFamilyCount = await FamilyModel.countDocuments();
// --------------------------------------- Place -----------------------
//
  await PlaceModel.deleteMany({});

  const placeDocs = [];
  const geocodeCache = new Map<
    string,
    { latitude?: number; longitude?: number }
  >();

  for (const place of parsedData.places) {
    let latitude = place.latitude;
    let longitude = place.longitude;

    if (
      place.geoPlace &&
      latitude === undefined &&
      longitude === undefined
    ) {
      let geo = geocodeCache.get(place.geoPlace);

      if (!geo) {
        geo = await geocodePlace(place.geoPlace);
        geocodeCache.set(place.geoPlace, geo);
      }

      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    placeDocs.push({
      handle: place.handle,
      grampsId: place.grampsId,
      type: place.type,

      line1: place.line1 ?? undefined,
      line2: place.line2 ?? undefined,
      urbanArea: place.urbanArea ?? undefined,
      county: place.county ?? undefined,
      country: place.country ?? [],

      code: place.code ?? undefined,
      displayPlace: place.displayPlace ?? undefined,

      noteHandles: place.noteHandles ?? [],

      latitude,
      longitude,

      importBatchId: importBatch._id,
    });
  }

  await PlaceModel.insertMany(placeDocs);

  const mongoPlaceCount = await PlaceModel.countDocuments();
// --------------------------------------- Finish up -----------------------
//
  console.log("Import service complete");
  await importBatch.save();
  
  return {
    importBatchId: importBatch._id,
    people: parsedData.people.length,
    mongoPeople: mongoPeopleCount,
    mongoFamily: mongoFamilyCount,
    mongoPlaces: mongoPlaceCount,
    mongoNotes: mongoNoteCount,
    };
};