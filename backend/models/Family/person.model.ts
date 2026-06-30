import mongoose, { Schema, model } from "mongoose";
import type { PersonRecord } from "../../types/family.types.js";

const personSchema = new Schema<PersonRecord>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    origin: { type: String, enum: ["gramps", "local"], required: true, default: "local"},
    localId: {type: String, unique: true, sparse: true},
    grampsId: { type: String, required: true, index: true },

    displayName: { type: String, required: true, index: true },
    firstName: { type: String },
    surname: { type: String },
    gender: { type: String },

    birthDate: { type: String },
    deathDate: { type: String },
    deceased: { type: Boolean, default: false, index: true },

    birthPlaceHandle: { type: String, index: true },
    deathPlaceHandle: { type: String, index: true },

    primaryPhotoUrl: { type: String },
    thumbnailUrl: { type: String },

    mediaHandles: [{ type: String }],
    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const PersonModel = model<PersonRecord>("Person", personSchema);