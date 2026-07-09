// backend/services/Family/noteResolver.service.ts
import mongoose from "mongoose";
import crypto from "node:crypto";

import { 
  generateHandle,
  generateLocalNoteId,
} from "../lib/familyIdGenerator.js";

import { NoteModel } from "../models/Family/note.model.js";

export interface NewNoteInput {
  text: string;
}

export const createNotesInTransaction = async (
  newNotes: NewNoteInput[] = [],
  session: mongoose.ClientSession
): Promise<string[]> => {
  if (!newNotes.length) return [];

  const notesToCreate = newNotes
    .map((note) => ({
      handle: generateHandle(),
      localId: generateLocalNoteId(),
      orign: "local",
      text: note.text?.trim(),
    }))
    .filter((note) => note.text);

  if (!notesToCreate.length) return [];

  const createdNotes = await NoteModel.create(notesToCreate, {
    session,
    ordered: true,
  });

  return createdNotes.map((note) => note.handle);
};

export const resolveNoteHandles = async (
  existingNoteHandles: string[] = [],
  newNotes: NewNoteInput[] = [],
  session: mongoose.ClientSession
): Promise<string[]> => {
  const newNoteHandles = await createNotesInTransaction(
    newNotes,
    session
  );

  return [
    ...existingNoteHandles,
    ...newNoteHandles,
  ];
};

export const deleteNotesInTransaction = async (
  noteHandles: string[] = [],
  session: mongoose.ClientSession
): Promise<void> => {
  if (!noteHandles.length) return;

  await NoteModel.deleteMany(
    {
      handle: { $in: noteHandles },
    },
    { session }
  );
};