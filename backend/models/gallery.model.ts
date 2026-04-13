// models/member.model.ts
import mongoose, { Schema } from "mongoose";
import { GalleryDocument } from "../types/gallery.js";

const gallerySchema = new Schema<GalleryDocument>(
    {
        access: { type: String, required: true, default: "public" },
        base: { type: String, required: true, default: "2026" },
        folder: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String, required: false },
        description: { type: String, required: false },
    },
    { timestamps: true }
);

const Gallery = mongoose.model<GalleryDocument>("Gallery", gallerySchema);

export default Gallery;
