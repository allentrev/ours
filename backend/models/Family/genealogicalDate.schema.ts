// models/Family/genealogicalDate.schema.ts

import {
  Schema,
} from "mongoose";

import type {
  GenealogicalDate,
} from "../../types/family.types.js";

export const genealogicalDateSchema =
  new Schema<GenealogicalDate>(
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },

      value: {
        type: Number,
        min: 0,
      },

      type: {
        type: String,
        enum: [
          "exact",
          "about",
          "before",
          "after",
        ],
        required: true,
      },
    },
    {
      _id: false,
    }
  );