import mongoose, { Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    handle: { type: String, required: true, unique: true, index: true },
    grampsId: { type: String, index: true },
    
    text: { type: String, required: true },
    type: { type: String },

    importBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "ImportBatch" },
  },
  { timestamps: true }
);

export const Note = model("Note", noteSchema);