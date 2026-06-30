import mongoose, { Schema, model } from "mongoose";
import type { PlaceRecord } from "../../types/family.types.js";

const placeSchema = new Schema<PlaceRecord>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    origin: { type: String, enum: ["gramps", "local"], required: true, default: "local"},
    localId: {type: String, unique: true, sparse: true},
    grampsId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true,  index: true },
    line1: { type: String},
    line2: { type: String},
    urbanArea: { type: String },
    county: { type: String },
    country: {
      type: [String],
      default: [],
    },
    code: { type: String },
    name: { type: String, required: true, indexed: true},
    shortName: { type: String, require: true},
    displayPlace: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const PlaceModel = model<PlaceRecord>("Place", placeSchema);