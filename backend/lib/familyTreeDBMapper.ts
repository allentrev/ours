// backend/lib/familyTreeDbMapper.ts

import { Person } from "../models/Family/person.model.js";
import { Family } from "../models/Family/family.model.js";
import { Place } from "../models/Family/place.model.js";
import { Note } from "../models/Family/note.model.js";

import type {
  ParsedGrampsData,
  RawGrampsFamily,
  RawGrampsNote,
  RawGrampsPerson,
  RawGrampsPlace,
} from "../types/family.types.js";

export const loadParsedFamilyDataFromDb =
  async (): Promise<ParsedGrampsData> => {
    const [people, families, places, notes] = await Promise.all([
      Person.find({}).lean(),
      Family.find({}).lean(),
      Place.find({}).lean(),
      Note.find({}).lean(),
    ]);

    const mappedPeople: RawGrampsPerson[] = people.map((person) => ({
      handle: person.handle,
      grampsId: person.grampsId,
      gender: person.gender ?? undefined,
      firstName: person.firstName ?? undefined,
      surname: person.surname ?? undefined,
      displayName: person.displayName,
      birthDate: person.birthDate ?? undefined,
      deathDate: person.deathDate ?? undefined,
      birthPlaceHandle: person.birthPlaceHandle ?? undefined,
      deathPlaceHandle: person.deathPlaceHandle ?? undefined,
      noteHandles: person.noteHandles ?? [],
      mediaHandles: person.mediaHandles ?? [],
      primaryPhotoMediaHandle:
        person.primaryPhotoMediaHandle ?? undefined,
    }));

    const mappedFamilies: RawGrampsFamily[] = families.map((family) => ({
      handle: family.handle,
      grampsId: family.grampsId ?? undefined,
      relationshipType: family.relationshipType,
      relationshipDate: family.relationshipDate ?? undefined,
      relationshipPlaceHandle:
        family.relationshipPlaceHandle ?? undefined,
      fatherHandle: family.fatherHandle ?? undefined,
      motherHandle: family.motherHandle ?? undefined,
      childHandles: family.childHandles ?? [],
      noteHandles: family.noteHandles ?? [],
      mediaHandles: family.mediaHandles ?? [],
    }));

    const mappedPlaces: RawGrampsPlace[] = places.map((place) => ({
      handle: place.handle,
      grampsId: place.grampsId ?? undefined,
      type: place.type,
      line1: place.line1 ?? undefined,
      line2: place.line2 ?? undefined,
      urbanArea: place.urbanArea ?? undefined,
      county: place.county ?? undefined,
      country: place.country ?? [],
      code: place.code ?? "",
      displayPlace:
        place.displayPlace ??
        place.line1 ??
        place.urbanArea ??
        place.county ??
        place.country?.join(", ") ??
        "Unknown place",
      latitude: place.latitude ?? undefined,
      longitude: place.longitude ?? undefined,
      noteHandles: place.noteHandles ?? [],
    }));

    const mappedNotes: RawGrampsNote[] = notes.map((note) => ({
      handle: note.handle,
      grampsId: note.grampsId ?? undefined,
      type: note.type ?? undefined,
      text: note.text,
    }));

    return {
      people: mappedPeople,
      families: mappedFamilies,
      places: mappedPlaces,
      notes: mappedNotes,
      media: [],
    };
  };