import mongoose, { Schema, model } from "mongoose";
import type { RawGrampsPerson, PersonDocument } from "../../types/family.types.js";

const personSchema = new Schema<PersonDocument>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    grampsId: { type: String, required: true, index: true },

    displayName: { type: String, required: true, index: true },
    gender: { type: String },

    birthDate: { type: String },
    deathDate: { type: String },
    deceased: { type: Boolean, default: false, index: true },

    birthPlaceHandle: { type: String, index: true },
    deathPlaceHandle: { type: String, index: true },

    primaryPhotoMediaHandle: { type: String },
    primaryPhotoUrl: { type: String },
    thumbnailUrl: { type: String },

    mediaHandles: [{ type: String }],
    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const Person = model<PersonDocument>("Person", personSchema);