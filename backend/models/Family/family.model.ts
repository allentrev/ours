import mongoose, { Schema, model } from "mongoose";
import type { FamilyRecord } from "../../types/family.types.js";

const familySchema = new Schema<FamilyRecord>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    origin: { type: String, enum: ["gramps", "local"], required: true, default: "local"},
    localId: {type: String, unique: true, sparse: true},
    grampsId: { type: String, required: true, unique: true, index: true },

    fatherHandle: { type: String, index: true },
    motherHandle: { type: String, index: true },
    childHandles: [{ type: String, index: true }],

    relationshipType: {
      type: String,
      enum: ["marriage", "union", "unmarried", "unknown", "Married", "Unknown", "Union", "Unmarried", "Civil Union"],
      default: "Unknown",
    },
    relationshipDate: { type: String },
    relationshipPlaceHandle: { type: String, index: true },

    mediaHandles: [{ type: String }],
    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const FamilyModel = model<FamilyRecord>("Family", familySchema);