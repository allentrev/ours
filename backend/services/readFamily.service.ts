import { FamilyModel } from "../models/Family/family.model.js";
import { PersonModel } from "../models/Family/person.model.js";
import { PlaceModel } from "../models/Family/place.model.js";
import { NoteModel } from "../models/Family/note.model.js";

import type {
  FamilyDetailsData,
  FamilyRecord,
  NoteRecord,
  PersonActor,
  PersonRecord,
  PlaceRecord,
} from "../types/family.types.js";

const modName =
  "/services/familyDetails.service/";

const toPersonActor = (
  person: Pick<
    PersonRecord,
    "handle" | "displayName"
  >
): PersonActor => ({
  handle: person.handle,
  displayName: person.displayName,
});

export const readFamilyService = async (
  familyHandle: string
): Promise<FamilyDetailsData> => {
  const funcName = "readFamilyService";

  try {
    const family = await FamilyModel.findOne({
      handle: familyHandle,
    }).lean<FamilyRecord>();

    if (!family) {
      throw new Error("FAMILY_NOT_FOUND");
    }

    /*
     * Collect every person handle required
     * for the response.
     */
    const personHandles = [
      family.fatherHandle,
      family.motherHandle,
      ...family.childHandles,
    ].filter(
      (handle): handle is string =>
        Boolean(handle)
    );

    const people =
      personHandles.length > 0
        ? await PersonModel.find({
            handle: {
              $in: personHandles,
            },
          })
            .select({
              handle: 1,
              displayName: 1,
            })
            .lean<PersonRecord[]>()
        : [];

    const peopleByHandle = new Map(
      people.map((person) => [
        person.handle,
        person,
      ])
    );

    const fatherPerson =
      family.fatherHandle
        ? peopleByHandle.get(
            family.fatherHandle
          )
        : undefined;

    const motherPerson =
      family.motherHandle
        ? peopleByHandle.get(
            family.motherHandle
          )
        : undefined;

    /*
     * Map children in the same order in which
     * their handles are stored on the family.
     */
    const children = family.childHandles
      .map((handle) =>
        peopleByHandle.get(handle)
      )
      .filter(
        (
          person
        ): person is PersonRecord =>
          Boolean(person)
      )
      .map(toPersonActor);

      let orderedNotes: NoteRecord[] = [];

      if (
        family.noteHandles &&
        family.noteHandles.length > 0
      ) {
        const notes = await NoteModel.find({
          handle: {
            $in: family.noteHandles,
          },
        }).lean<NoteRecord[]>();

        const notesByHandle = new Map(
          notes.map((note) => [
            note.handle,
            note,
          ])
        );

        /*
        * Preserve the note order stored on
        * the Family document.
        */
        orderedNotes = family.noteHandles
          .map((handle) =>
            notesByHandle.get(handle)
          )
          .filter(
            (
              note
            ): note is NoteRecord =>
              Boolean(note)
          );
      }

    let relationshipPlaceName:
      | string
      | undefined;

    if (family.relationshipPlaceHandle) {
      const place =
        await PlaceModel.findOne({
          handle:
            family.relationshipPlaceHandle,
        })
          .select({
            name: 1,
            displayPlace: 1,
          })
          .lean<
            Pick<
              PlaceRecord,
              "name" | "displayPlace"
            >
          >();

      relationshipPlaceName =
        place?.displayPlace ||
        place?.name;
    }

    return {
      handle: family.handle,
      grampsId: family.grampsId,

      father: fatherPerson
        ? toPersonActor(fatherPerson)
        : undefined,

      mother: motherPerson
        ? toPersonActor(motherPerson)
        : undefined,

      children,

      relationshipType:
        family.relationshipType,

      relationshipDate:
        family.relationshipDate,

      relationshipPlaceHandle:
        family.relationshipPlaceHandle,

      relationshipPlaceName,

      notes: orderedNotes,
    };
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    throw error;
  }
};