import { Schema, model } from "mongoose";

const importBatchSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["gramps"],
      required: true,
      default: "gramps",
    },

    filename: { type: String, required: true },

    peopleCount: { type: Number, default: 0 },
    familyCount: { type: Number, default: 0 },
    placeCount: { type: Number, default: 0 },
    noteCount: { type: Number, default: 0 },
    mediaCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ImportBatch = model("ImportBatch", importBatchSchema);