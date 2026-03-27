import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  cover: string;      // URL of the cover image
  folderPath: string; // Path in ImageKit where images are stored (e.g. "/galleries/summer2025")
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    cover: { type: String, required: true },
    folderPath: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export default mongoose.model<IGallery>("Gallery", GallerySchema);
