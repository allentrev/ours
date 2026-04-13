import mongoose, { Schema } from "mongoose";
import { ImageDocument } from "../types/image.js";

const imageSchema = new Schema<ImageDocument> (
  {
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    base: { type: String, required: true, default: "2026" },
    folder: { type: String, required: true },
    fileName: { type: String, required: true }, 
  },
  { timestamps: true }
);

const Image = mongoose.model<ImageDocument>("Image", imageSchema);

export default Image;