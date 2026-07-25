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
      enum: [
        "marriage",  "Married",
        "union",  "Union",
        "unmarried",  "Unmarried",
        "unknown", "Unknown",
        "civil union", "Civil Union",
        "divrced", "Divrced",
      ],
      default: "Unknown",
    },
    relationshipDate: { type: String },
    relationshipPlaceHandle: { type: String, index: true },

    mediaHandles: [{ type: String }],
    noteHandles: [{ type: String }],

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
    
    createdByUserId: { type: String, required: false, index: true, },
    updatedByUserId: { type: String, required: false, index: true, },

  },
  { timestamps: true }
);

export const FamilyModel = model<FamilyRecord>("Family", familySchema);