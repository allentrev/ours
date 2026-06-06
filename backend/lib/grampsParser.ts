import fs from "fs/promises";
import { XMLParser } from "fast-xml-parser";
import zlib from "zlib";

import {
  ParsedGrampsData,
  RawGrampsFamily,
  RawGrampsPerson,
} from "../types/family.types.js";

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
  person: any,
  eventMap: Map<string, any>,
  eventType: "Birth" | "Death" | "Baptism"
) => {
  const eventRefs = toArray(person.eventref);
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

    if (type === eventType && eventRef._role === "Primary") {
      return (
          event.dateval?._val
        );
    }
  }

  return undefined;
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

  const rawPeople = toArray(database.people?.person);
  const rawFamilies = toArray(database.families?.family);

  const rawEvents = toArray(database.events?.event);
  const eventMap = new Map<string, any>();

  rawEvents.forEach((event: any) => {
    if (event._handle) {
      eventMap.set(event._handle, event);
    }
  });
  
  const people: RawGrampsPerson[] = rawPeople.map((person: any) => {
    const { firstName, surname, displayName } = extractPersonName(person);
    return {
      handle: person._handle,
      grampsId: person._id,
      gender: getTextValue(person.gender),
      firstName,
      surname,
      displayName,
      birthDate: extractEventDate(person, eventMap, "Birth"),
      deathDate: extractEventDate(person, eventMap, "Death"),
    };
  });

  const families: RawGrampsFamily[] = rawFamilies.map((family: any) => {
    const children = toArray(family.childref);

    return {
      handle: family._handle,
      grampsId: family._id,
      fatherHandle: family.father?._hlink,
      motherHandle: family.mother?._hlink,
      childHandles: children
        .map((child: any) => child._hlink)
        .filter(Boolean),
    };
  });

  return {
    people,
    families,
  };
};