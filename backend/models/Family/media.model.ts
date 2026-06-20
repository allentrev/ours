import mongoose, { Schema, model } from "mongoose";

const mediaSchema = new Schema(
  {
    handle: { type: String, required: true, unique: true, index: true },

    title: { type: String },
    path: { type: String },
    mimeType: { type: String },

    cdnUrl: { type: String },
    thumbnailUrl: { type: String },

    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const MediaModel = model("Media", mediaSchema);