import fs from "fs/promises";
import { XMLParser } from "fast-xml-parser";
import zlib from "zlib";

import {
  ParsedGrampsData,
  RawGrampsFamily,
  RawGrampsPerson,
  RawGrampsPlace,
  RawGrampsNote,
} from "../types/family.types.js";
import { isArrayBuffer } from "util/types";

type GrampsRecordType = "Person" | "Family";

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getTextValue = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return (
      getTextValue(obj["#text"]) ||
      getTextValue(obj.val) ||
      getTextValue(obj.value) ||
      getTextValue(obj._value) ||
      getTextValue(obj.dateval)
    );
  }

  return undefined;
};

const extractPersonName = (person: any) => {
  const name = toArray(person.name)[0];

  const firstName =
    getTextValue(name?.first) ||
    getTextValue(name?.given) ||
    getTextValue(name?.call);

  const surnameObj = toArray(name?.surname)[0];

  const surname =
    getTextValue(surnameObj) ||
    getTextValue(surnameObj?.["#text"]) ||
    getTextValue(surnameObj?.content);

  const displayName = [firstName, surname].filter(Boolean).join(" ").trim();

  return {
    firstName,
    surname,
    displayName: displayName || person._id || person._handle || "Unknown",
  };
};

const extractEventDate = (
  record: any,
  recordType: GrampsRecordType,
  eventMap: Map<string, any>,
  eventType: "Birth" | "Death" | "Baptism" | "Census" | "Marriage" | "Residence" | "Adopted" | "Civil Union"
) => {
  const expectedRole = recordType === "Person" ? "Primary" : "Family";
  
  const eventRefs = toArray(record.eventref);
  for (const eventRef of eventRefs) {
    const eventHandle = eventRef?._hlink;

    if (!eventHandle) {
      continue;
    }

    const event = eventMap.get(eventHandle);

    if (!event) {
      continue;
    }

    const type =
      getTextValue(event.type) ||
      getTextValue(event._type);

    if (type === eventType && eventRef._role ===  expectedRole) {
      return (
          event.dateval?._val
        );
    }
  }

  return undefined;
};

const extractPlaceData = (place: any) => {
  const pname = place?.pname;

  const name = Array.isArray(pname)
    ? pname[0]?._value
    : getTextValue(pname);


  return {
    name,
  };
};

const readGrampsXml = async (filePath: string): Promise<string> => {
  const buffer = await fs.readFile(filePath);

  const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;

  if (isGzip) {
    return zlib.gunzipSync(buffer).toString("utf-8");
  }

  return buffer.toString("utf-8");
};

export const parseGrampsFile = async (
  filePath: string
): Promise<ParsedGrampsData> => {
    const xml = await readGrampsXml(filePath);

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "_",
        textNodeName: "#text",
  });

  const parsed = parser.parse(xml);

  const database = parsed.gramps?.database ?? parsed.database;

  if (!database) {
    throw new Error("Could not find Gramps database root in XML file.");
  }
  const rawNotes = toArray(database.notes?.note);
  const rawPeople = toArray(database.people?.person);
  const rawFamilies = toArray(database.families?.family);
  const rawPlaces = toArray(database.places?.placeobj);
  //console.log(rawNotes);

  const rawEvents = toArray(database.events?.event);
  const eventMap = new Map<string, any>();

  rawEvents.forEach((event: any) => {
    if (event._handle) {
      eventMap.set(event._handle, event);
    }
  });
  // ----------------------------- Note --------------------------------------
  //
  const notes: RawGrampsNote[] = rawNotes.map((note: any) => {
    //console.log("Note", note)

    return {
      handle: note._handle,
      grampsId: note._id,
      type: getTextValue(note._type),
      text: getTextValue(note.text),
    };
  });
  // ----------------------------- Person --------------------------------------
  //
  const people: RawGrampsPerson[] = rawPeople.map((person: any) => {
    const { firstName, surname, displayName } = extractPersonName(person);
    const noterefs = toArray(person.noteref?._hlink);
    return {
      handle: person._handle,
      grampsId: person._id,
      gender: getTextValue(person.gender),
      firstName,
      surname,
      displayName,
      birthDate: extractEventDate(person, "Person", eventMap, "Birth"),
      deathDate: extractEventDate(person, "Person", eventMap, "Death"),
      noteHandles: noterefs,
      mediaHandles: [],
    };
  });
  // ----------------------------- Family --------------------------------------
  //
  const families: RawGrampsFamily[] = rawFamilies.map((family: any) => {
    const children = toArray(family.childref);
    const noterefs = toArray(family.noteref?._hlink);
    //console.log("family",family._handle );
    //console.log("Notes", noterefs);

    return {
      handle: family._handle,
      grampsId: family._id,
      relationshipType: family.rel?._type,
      relationshipDate: extractEventDate(family, "Family", eventMap, "Marriage"),
      fatherHandle: family.father?._hlink,
      motherHandle: family.mother?._hlink,
      childHandles: children
        .map((child: any) => child._hlink)
        .filter(Boolean),
      noteHandles: noterefs,
      mediaHandles: [],
    }
  });

  // ----------------------------- Place --------------------------------------
  //
  interface urbanEntry {
    handle: string;
    type?: string;
    name?: string;
  }

  function buildPlaceName(place: any, visited = new Set<string>()): urbanEntry[] {
    const result: urbanEntry[] = [];

    const handle = place?._handle;
      // Prevent circular references
    if (handle && visited.has(handle)) {
      return result;
    }
    if (handle) {
      visited.add(handle);
    }
    
    const {
      name
    } = extractPlaceData(place);

    const type =
      getTextValue(place.type) ||
      getTextValue(place._type);
    
    result.push({
      handle,
      type,
      name,
    });
    
    const placerefs = toArray(place.placeref);

    const parentPlaceHandle = placerefs[0]?._hlink;

    if (!parentPlaceHandle) {
      return result;
    }

    const parentPlace = rawPlaces.find(
      (item) => item._handle === parentPlaceHandle
    );

    if (!parentPlace) {
      return result;
    }

    result.push(
      ...buildPlaceName(parentPlace, visited)
    );

    return result;
  }

  const places: RawGrampsPlace[] = rawPlaces.map((rawPlace: any) => {
    const noterefs = toArray(rawPlace.noteref?._hlink);
    const wPlace = buildPlaceName(rawPlace);
    let wEntry = wPlace[0];
    //console.log("Map start", rawPlace, "Entry", wEntry);
    const wType = wEntry.type;
    let wLine1 = undefined;
    let wLine2 = undefined;
    let wUrbanArea = undefined;
    let wUrbanAreaHandle = undefined;
    let wCounty = undefined;
    let wCountyHandle = undefined;
    let wCountry = [];
    let wCountryHandles = [];
    let wDisplayPlace = undefined;
    let wGeoPlace = undefined;
    const wLat = undefined;
    const wLong = undefined;

    for (let wItem of wPlace) {
      switch (wItem.type) {
        case "Address":
          wLine1= wItem.name
          break;
        case "Building":
        case "Street":
        case "Borough":
        case "District":
        case "Parish":
          if (wLine1) {
            wLine2 = wItem.name;
          } else {
            wLine1 = wItem.name;
          }
          break;
        case "Village":
          if (wUrbanArea){
            wLine2= wUrbanArea;
            wUrbanArea = wItem.name;
            wUrbanAreaHandle = wItem.handle;
          } else {
            wUrbanArea = wItem.name;
            wUrbanAreaHandle = wItem.handle;
          }
          break;
        case "Town":
        case "City":
          wUrbanArea = wItem.name;
          wUrbanAreaHandle = wItem.handle;
          break;
        case "County":
        case "Region":
          wCounty = wItem.name;
          wCountyHandle = wItem.handle;
          break;
        case "Country":
          wCountry.push(wItem.name);
          wCountryHandles.push(wItem.handle);
          break;
        default:
          console.log("Got a unknown place element ", wItem);
          break;
      }
    }
    try {
      wDisplayPlace = [
        wLine1,
        wLine2,
        wUrbanArea,
        wCounty,
        ...wCountry,
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(", ");
      wGeoPlace = [
        wUrbanArea,
        wCounty,
        ...wCountry,
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(", ");
    } catch (err){
      console.log("backend grampsParser TryCatch ", err)
    }
      return {
      handle: rawPlace._handle,
      grampsId: rawPlace._id,
      type: wType,
      line1: wLine1,
      line2: wLine2,
      urbanArea: wUrbanAreaHandle,      // village | town | city
      county: wCountyHandle,            // region | county
      country: wCountryHandles,
      code: rawPlace.code,
      displayPlace: wDisplayPlace,
      geoPlace: wGeoPlace,
      latitude: wLat,
      longitude: wLong,
      noteHandles: noterefs,
    }
  });

  // ----------------------------- Finish Up --------------------------------------
  //

  return {
    people,
    families,
    places,
    notes,
    media: [],
  };
};