import mongoose, { Schema, model } from "mongoose";
import type { RawGrampsPerson } from "../../types/family.types.js";

export interface FamilyPersonDocument extends RawGrampsPerson {
  deceased: boolean;
  primaryPhotoUrl?: string;
  thumbnailUrl?: string;
  importBatchId?: mongoose.Types.ObjectId;
}

const personSchema = new Schema<FamilyPersonDocument>(
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

export const PersonModel = model<FamilyPersonDocument>("Person", personSchema);