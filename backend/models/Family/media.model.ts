import mongoose, { Schema, model } from "mongoose";
import type { MediaRecord } from "../../types/family.types.js";

const mediaSchema = new Schema<MediaRecord>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    origin: { type: String, enum: ["gramps", "local"], required: true, default: "local"},
    localId: {type: String, unique: true, sparse: true},

    title: { type: String },
    path: { type: String },
    mimeType: { type: String },

    thumbnailUrl: { type: String },

    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const MediaModel = model<MediaRecord>("Media", mediaSchema);