import type { Request, Response } from "express";
import type {} from "multer";

import { PersonModel } from "../../models/Family/person.model.js";

import { 
  generateHandle,
  generateLocalPersonId,
  generateLocalFamilyId,
} from "../../lib/familyIdGenerator.js";

import {
  useCreateRelatedPerson,
} from "../../services/relatedPerson.service.js";

import type {
  PersonDocument,
  PersonRecord,

  NewNoteInput,
  CreateRelatedPersonBody,
  PersonRelationshipType,
} from "../../types/family.types.js"

import { withTransaction } from "../../lib/withTransaction.js";
import { resolveNoteHandles } from "../../services/noteResolver.js";
import { usePersonRelationships } from "../../services/relationship.service.js";

const modName ="/controllers/family.controller/";

const RELATED_PERSON_TYPES:
  PersonRelationshipType[] = [
    "addChild",
    "addPartner",
    "addSibling",
  ];

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

export const getPersonRelationships = async (
  req: Request<{ personId: string }>,
  res: Response
) => {
  const funcName = "getPersonRelationships";
  try {
    const data = await usePersonRelationships(
      req.params.personId
    );

    return res.status(200).json({
      success: true,
      message: "Person relationships retrieved successfully",
      data,
    });
  } catch (error) {
      console.error(
        `${modName}${funcName}`,
        error
      );

      if (
        error instanceof Error &&
        error.message === "PERSON_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Person not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to retrieve person relationships",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
};

export const createRelatedPerson = async (
  req: Request<
    Record<string, never>,
    unknown,
    CreateRelatedPersonBody
  >,
  res: Response
) => {
  const funcName = "createRelatedPerson";

  const {
    sourcePersonHandle,
    relationshipType,
    person,
  } = req.body;

  if (!sourcePersonHandle?.trim()) {
    return res.status(400).json({
      success: false,
      message:
        "sourcePersonHandle is required.",
    });
  }

  if (
    !RELATED_PERSON_TYPES.includes(
      relationshipType
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "relationshipType must be addChild, addPartner or addSibling.",
    });
  }

  if (!person) {
    return res.status(400).json({
      success: false,
      message:
        "Person data is required.",
    });
  }

  const firstName =
    person.firstName?.trim() ?? "";

  const surname =
    person.surname?.trim() ?? "";

  if (!firstName && !surname) {
    return res.status(400).json({
      success: false,
      message:
        "At least one name is required.",
    });
  }

  try {
    const clerkUserId = req.currentUser?.clerkUserId;
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is unavailable.",
      });
    }

    const result =
      await useCreateRelatedPerson(
        req.body,
        clerkUserId
      );

    return res.status(201).json({
      success: true,
      message:
        "Related person created successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "SOURCE_PERSON_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Source person was not found.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_RELATIONSHIP_TYPE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid relationship type.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "CHILD_FAMILY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "The selected child family was not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create related person.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const createPerson = async (
  req: Request<
    {},
    {},
    {
      person: Partial<PersonDocument>;
      newNotes?: NewNoteInput[];
    }
  >,
  res: Response
) => {
  try {
    const { person, newNotes = [] } = req.body;

    const clerkUserId = req.currentUser?.clerkUserId;
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is unavailable.",
      });
    }

    if (!person) {
      return res.status(400).json({
        message: "Person data is required",
      });
    }

    const savedPerson = await withTransaction(async (session) => {
      const handle = generateHandle();
      const localId = generateLocalPersonId();
      const origin = "local";

      const noteHandles = await resolveNoteHandles(
        person.noteHandles ?? [],
        newNotes,
        session,
        clerkUserId,
      );

      const createdPeople = await PersonModel.create(
        [
          {
            ...person,
            handle,
            grampsId: localId,
            localId,
            origin,
            noteHandles,
            createdByUserId: clerkUserId,
            updatedByUserId: clerkUserId,
          },
        ],
        { session }
      );

      return createdPeople[0];
    });

    return res.status(201).json(savedPerson);
  } catch (error) {
    console.error("Person Save Failed:", error);

    return res.status(500).json({
      message: "Error creating Person",
      error,
    });
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
  req: Request<
    { personId: string },
    {},
    {
      person: Partial<PersonDocument>;
      newNotes?: NewNoteInput[];
    }
  >,
  res: Response
) => {
  const funcName="updatePerson";
  try {
    const clerkUserId = req.currentUser?.clerkUserId;
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is unavailable.",
      });
    }

    const personId = req.params.personId;
    const { person, newNotes = [] } = req.body;
    console.log(`${modName}${funcName} person, newNotes`, person, newNotes);
    if (!person) {
      return res.status(400).json({
        message: "Person data is required",
      });
    }

    const updatedPerson = await withTransaction(async (session) => {
      const existingPerson = await PersonModel.findOne({
        handle: personId,
      }).session(session);

      if (!existingPerson) {
        return null;
      }

      const noteHandles = await resolveNoteHandles(
        person.noteHandles ?? existingPerson.noteHandles ?? [],
        newNotes,
        session,
        clerkUserId,
      );

      return await PersonModel.findOneAndUpdate(
        { handle: personId },
        {
          ...person,
          noteHandles,
          updatedByUserId: clerkUserId,
        },
        {
          new: true,
          session,
        }
      );
    });

    if (!updatedPerson) {
      return res.status(404).json({
        message: "Person not found",
      });
    }

    return res.status(200).json(updatedPerson);
  } catch (error) {
    console.error("Error updating Person:", error);

    return res.status(500).json({
      message: "Server error",
      error,
    });
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
