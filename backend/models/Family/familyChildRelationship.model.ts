import mongoose, {
  Schema,
} from "mongoose";

import type {
  FamilyChildRelationshipRecord,
} from "../../types/family.types.js";

const familyChildRelationshipSchema =
  new Schema<FamilyChildRelationshipRecord>(
    {
      handle: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      origin: {
        type: String,
        enum: [
          "gramps",
          "local",
        ],
        default: "local",
        required: true,
      },

      localId: {
        type: String,
        unique: true,
        sparse: true,
      },

      familyHandle: {
        type: String,
        required: true,
        index: true,
      },

      childHandle: {
        type: String,
        required: true,
        index: true,
      },

      relationshipType: {
        type: String,
        enum: [
          "biological",
          "adopted",
          "unknown",
        ],
        required: true,
        default: "unknown",
      },

      importBatchId: {
        type:
          Schema.Types.ObjectId,
        ref:
          "ImportBatch",
      },

      createdByUserId: {
        type: String,
      },

      updatedByUserId: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

familyChildRelationshipSchema.index(
  {
    familyHandle: 1,
    childHandle: 1,
  },
  {
    unique: true,
  }
);

export const FamilyChildRelationshipModel =
  mongoose.model<FamilyChildRelationshipRecord>(
    "FamilyChildRelationship",
    familyChildRelationshipSchema
  );