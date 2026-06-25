import {
  Person,
  Family,
  Place,
  Note,
  Media,
  ImportBatch,
} from "../models/Family/index.js";

import type { ParsedGrampsData } from "../types/family.types.js";
import { geocodePlace } from "../lib/geocodePlace.js";

export const importFamilyDataToMongo = async (
  parsedData: ParsedGrampsData,
  filename = "uploaded.gramps"
) => {
  console.log("Services: ImportFamilyDataToMongo");
  // Create import batch record
  const importBatch = await ImportBatch.create({
    source: "gramps",
    filename,
  });
  console.log("Schema created");
  
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
try {
  await Note.deleteMany({});
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
  await Note.insertMany(noteRecords);
  const mongoNoteCount = await Note.countDocuments();
  console.log("mapped Note records", mongoNoteCount);
}
  catch (err) {
    console.log("Caught Note error", err);
}
// --------------------------------------- Person -----------------------
//
try {
  await Person.deleteMany({});
  await Person.insertMany(
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
  const mongoPeopleCount = await Person.countDocuments();
  console.log("mapped People records", mongoPeopleCount);
}
  catch (err) {
    console.log("Caught People error", err);
}
// --------------------------------------- Family -----------------------
//
try {  
  await Family.deleteMany({});
  await Family.insertMany(
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
  const mongoFamilyCount = await Family.countDocuments();
  console.log("mapped Family records", mongoFamilyCount);
}
  catch (err) {
    console.log("Caught Family error", err);
}
  // --------------------------------------- Place -----------------------
//
try {
  await Place.deleteMany({});

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
    if (!place.displayPlace) console.log("Error: ", place);
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
      name: place.name,
      shortName: place.shortName,

      noteHandles: place.noteHandles ?? [],

      latitude,
      longitude,

      importBatchId: importBatch._id,
    });
  }
  console.log(placeDocs);
  await Place.insertMany(placeDocs);

  const mongoPlaceCount = await Place.countDocuments();
  console.log("mapped Place records", mongoPlaceCount);
}
  catch (err) {
    console.log("Caught Place error", err);
}
// --------------------------------------- Finish up -----------------------
//
  console.log("Import service complete");
  await importBatch.save();
  
  return {
    importBatchId: importBatch._id,
    people: parsedData.people.length,
    mongoPeople: await Person.countDocuments(),
    mongoFamily: await Family.countDocuments(),
    mongoPlaces: await Place.countDocuments(),
    mongoNotes: await Note.countDocuments(),
    };
};