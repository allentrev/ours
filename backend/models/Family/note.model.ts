import mongoose, { Schema, model } from "mongoose";
import type { NoteRecord } from "../../types/family.types.js";

const noteSchema = new Schema<NoteRecord>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    origin: { type: String, enum: ["gramps", "local"], required: true, default: "local"},
    localId: {type: String, unique: true, sparse: true},
    grampsId: { type: String, index: true },
    
    text: { type: String, required: true },
    type: { type: String },

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const NoteModel = model<NoteRecord>("Note", noteSchema);