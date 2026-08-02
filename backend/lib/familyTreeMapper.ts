/*
Purpose: Convert Gramps parser output into the
    application's internal Family Tree model.
Gramps XML
      │
      ▼
RawGrampsPerson
RawGrampsFamily
      │
      ▼
familyTreeMapper
      │
      ▼
MappedFamilyData
*/

import {
  convertGrampsDate,
} from "./genealogicalDate.js";

import {
  MappedFamilyData,
  ParsedGrampsData,
  RawRelationship,
  PersonRecord,
  RawGrampsPerson,
} from "../types/family.types.js";

const mapRawPerson = (
  person: RawGrampsPerson
): PersonRecord => {
  const birthDate =
    convertGrampsDate(
      person.birthDate
    );

  const deathDate =
    convertGrampsDate(
      person.deathDate
    );

  return {
    ...person,

    birthDate,
    deathDate,

    origin: "gramps",

    deceased:
      Boolean(deathDate),

    noteHandles:
      person.noteHandles ??
      [],

    mediaHandles:
      person.mediaHandles ??
      [],
  };
};

export const mapFamilyTreeData = (
  parsedData: ParsedGrampsData
): MappedFamilyData => {
  const relationships: RawRelationship[] = [];

  parsedData.families.forEach((family) => {
    const { fatherHandle, motherHandle, childHandles } = family;

    // Parent-child relationships
    childHandles.forEach((childHandle) => {
      if (fatherHandle) {
        relationships.push({
          fromHandle: fatherHandle,
          toHandle: childHandle,
          relationshipType: "parent",
        });

        relationships.push({
          fromHandle: childHandle,
          toHandle: fatherHandle,
          relationshipType: "child",
        });
      }

      if (motherHandle) {
        relationships.push({
          fromHandle: motherHandle,
          toHandle: childHandle,
          relationshipType: "parent",
        });

        relationships.push({
          fromHandle: childHandle,
          toHandle: motherHandle,
          relationshipType: "child",
        });
      }
    });

    // Spouse relationships
    if (fatherHandle && motherHandle) {
      relationships.push({
        fromHandle: fatherHandle,
        toHandle: motherHandle,
        relationshipType: "spouse",
      });

      relationships.push({
        fromHandle: motherHandle,
        toHandle: fatherHandle,
        relationshipType: "spouse",
      });
    }
  });

  return {
    people:
      parsedData.people.map(
        mapRawPerson
      ),
    relationships,
    families: parsedData.families.map((family) => ({
      id: family.handle,
      fatherHandle: family.fatherHandle,
      motherHandle: family.motherHandle,
      childHandles: family.childHandles,
    })),
  };
};