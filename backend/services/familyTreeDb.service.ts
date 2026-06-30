import { PersonModel } from "../models/Family/person.model.js";
import { FamilyModel } from "../models/Family/family.model.js";

import {
  buildAncestorTree,
  buildDescendantTree,
} from "./familyTree.service.js";

import type {
  PersonRecord,
  FamilyRecord,
  FamilyGroup,
  FamilyTreeResponse,
  RawGrampsPerson,
  RawRelationship,
  MappedFamilyData,
} from "../types/family.types.js";

const MAX_DEPTH = 5;

const mapPerson = (person: any): RawGrampsPerson => ({
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
  primaryPhotoUrl: person.primaryPhotoUrl ?? undefined,
});

const loadPeopleByHandles = async (
  handles: string[]
): Promise<RawGrampsPerson[]> => {
  if (handles.length === 0) return [];

  const people = await PersonModel.find({
    handle: { $in: [...new Set(handles)] },
  }).lean<PersonRecord[]>();

  return people.map(mapPerson);
};

const collectDescendantData = async (
  startHandle: string,
  maxDepth = MAX_DEPTH
) => {
  const personHandles = new Set<string>([startHandle]);
  const familyMap = new Map<string, FamilyGroup>();

  let currentHandles = [startHandle];

  for (let depth = 0; depth < maxDepth; depth++) {
    const families = await FamilyModel.find({
      $or: [
        { fatherHandle: { $in: currentHandles } },
        { motherHandle: { $in: currentHandles } },
      ],
    }).lean<FamilyRecord[]>();

    const nextHandles: string[] = [];

    families.forEach((family) => {
      const fatherHandle = family.fatherHandle ?? undefined;
      const motherHandle = family.motherHandle ?? undefined;
      const childHandles = family.childHandles ?? [];

      familyMap.set(family.handle, {
        id: family.handle,
        fatherHandle,
        motherHandle,
        childHandles,
      });

      if (fatherHandle) personHandles.add(fatherHandle);
      if (motherHandle) personHandles.add(motherHandle);

      childHandles.forEach((childHandle: string) => {
        personHandles.add(childHandle);
        nextHandles.push(childHandle);
      });
    });

    currentHandles = nextHandles;

    if (currentHandles.length === 0) break;
  }

  return {
    people: await loadPeopleByHandles([...personHandles]),
    families: [...familyMap.values()],
  };
};

const collectAncestorData = async (
  startHandle: string,
  maxDepth = MAX_DEPTH
) => {
  const personHandles = new Set<string>([startHandle]);
  const familyMap = new Map<string, FamilyGroup>();

  let currentHandles = [startHandle];

  for (let depth = 0; depth < maxDepth; depth++) {
    const families = await FamilyModel.find({
      childHandles: { $in: currentHandles },
    }).lean<FamilyRecord[]>();

    const nextHandles: string[] = [];

    families.forEach((family) => {
      const fatherHandle = family.fatherHandle ?? undefined;
      const motherHandle = family.motherHandle ?? undefined;
      const childHandles = family.childHandles ?? [];

      familyMap.set(family.handle, {
        id: family.handle,
        fatherHandle,
        motherHandle,
        childHandles,
      });

      if (fatherHandle) {
        personHandles.add(fatherHandle);
        nextHandles.push(fatherHandle);
      }

      if (motherHandle) {
        personHandles.add(motherHandle);
        nextHandles.push(motherHandle);
      }

      childHandles.forEach((childHandle: string) => {
        personHandles.add(childHandle);
      });
    });

    currentHandles = nextHandles;

    if (currentHandles.length === 0) break;
  }

  return {
    people: await loadPeopleByHandles([...personHandles]),
    families: [...familyMap.values()],
  };
};

const buildRelationshipsFromFamilies = (
  families: FamilyGroup[]
): RawRelationship[] => {
  const relationships: RawRelationship[] = [];

  families.forEach((family) => {
    const { fatherHandle, motherHandle, childHandles } = family;

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

  return relationships;
};

export const buildFamilyTreeFromDb = async (
  startHandle: string,
  mode: "ancestors" | "descendants"
): Promise<{
  selectedPerson: RawGrampsPerson;
  tree: FamilyTreeResponse;
}> => {
  const selectedPersonDoc = await PersonModel.findOne({
    handle: startHandle,
  }).lean<PersonRecord>();

  if (!selectedPersonDoc) {
    throw new Error("Selected person not found");
  }

  const selectedPerson = mapPerson(selectedPersonDoc);

  const data =
    mode === "ancestors"
      ? await collectAncestorData(startHandle)
      : await collectDescendantData(startHandle);

  const mapped: MappedFamilyData = {
    people: data.people,
    relationships: buildRelationshipsFromFamilies(data.families),
    families: data.families,
  };

  const tree =
    mode === "ancestors"
      ? buildAncestorTree(mapped, startHandle)
      : buildDescendantTree(mapped, startHandle);

  return {
    selectedPerson,
    tree,
  };
};
