import type { Request, Response } from "express";
import type {} from "multer";

import { NoteModel } from "../../models/Family/note.model.js";
import { 
  generateHandle,
  generateLocalNoteId,
} from "../../lib/familyIdGenerator.js";

import type {
  NoteDocument,
  NoteRecord,
} from "../../types/family.types.js"

const modName ="/controllers/family.controller/";

export const getAllNotes = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllNotes");
        const notes = await NoteModel.find().lean<NoteRecord[]>();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notes", error });
    }
};

export const createNote = async (
    req: Request<{}, {}, Partial<NoteDocument>>,
    res: Response
) => {
    const handle = generateHandle();
    const localId = generateLocalNoteId();
    const orign="local";

    try {
      const clerkUserId = req.currentUser?.clerkUserId;
      if (!clerkUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user is unavailable.",
        });
      }

        console.log("family.controller, createNote", req.body);
        const newNote = new NoteModel(req.body);
        newNote.handle = handle;
        newNote.grampsId = localId;
        newNote.localId = localId;
        newNote.origin = orign;
        newNote.createdByUserId = clerkUserId;
        newNote.updatedByUserId = clerkUserId;
        const savedNote = await newNote.save();
        console.log("Note created");
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Note Save Failed:", error);
        res.status(500).json({ message: "Error creating Note", error });
    }
};

export const readNote = async (
  req: Request<{ noteId: string }>,
  res: Response
) => {
  const funcName="readNote";
  try {
    const note = await NoteModel.findOne({
      handle: req.params.noteId,
    }).lean<NoteRecord>();

    if (!note) {
      console.warn(`${modName}${funcName} Failed to find note ${req.params.noteId}`);
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note retrieved successfully",
      data: note,
    });
  } catch (error) {
    console.warn(`${modName}${funcName} Catch error Failed to retrieve note`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve note",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateNote = async (
    req: Request<{ noteId: string }, {}, Partial<NoteDocument>>,
    res: Response
) => {
    try {
      const clerkUserId = req.currentUser?.clerkUserId;
      if (!clerkUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user is unavailable.",
        });
      }
      const wNoteId = req.params.noteId;
      const updateData = req.body;
      updateData.updatedByUserId = clerkUserId;
      console.log("family.controller, updateNote", wNoteId, updateData);

      const updatedNote: NoteDocument | null =
          await NoteModel.findOneAndUpdate({ handle: wNoteId }, updateData, {
              new: true,
          });

      if (!updatedNote)
          return res.status(404).json({ message: "Note not found" });
      res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error updating Note:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteNote = async (
    req: Request<{ noteId: string }>,
    res: Response
) => {
    try {
        console.log("family.controller, deleteNote");
        const wNoteId = req.params.noteId;

        const deletedNote = await NoteModel.findOneAndDelete({ handle: wNoteId });

        if (!deletedNote) {
            return res
                .status(404)
                .json({ message: "Note not found or already deleted" });
        }

        res.status(200).json({ message: "Note has been deleted" });
    } catch (error) {
        console.error("Error deleting Note:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
