import * as BunnyStorageSDK from "@bunny.net/storage-sdk";
import { Readable } from "stream";

import { Request, Response } from "express";
import { storageZone } from "../lib/bunny.js";

import sharp from "sharp";

import Gallery from "../models/gallery.model.js";
import { GalleryDocument } from "../types/gallery.js";

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import csvParser from "csv-parser";
import Image from "models/image.model.js";

interface ParamsId {
    id: string;
}
//TODO THink and review filetype
export const getAllGallery = async (req: Request, res: Response) => {
    console.log("gallery.controller, getAllGallery");
    const galleries: GalleryDocument[] = await Gallery.find().sort({
        folder: 1,
    });
    res.status(200).json(galleries);
};

// GET /gallery/images/:folder
export const getGalleryImagesByFolder = async (req: Request, res: Response) => {
  const folder = req.params.folder;
  const base = req.params.base
  const cdn = "Bunny";
  
  if (!folder || !base) {
    return res.status(400).json({ error: "base and folder are required" });
  }

  const cdnFolder = `/${base}/${folder}`;
  console.log("gallery.controller getGalleryImagesByFolder ", cdnFolder);
  try {
    const cdn = "Bunny"
    let result = [];
    let images = [];
        // List files in Bunnu folder        
        result = await BunnyStorageSDK.file.list(
            storageZone,
            cdnFolder,
        );
        images = result.map((file: any) => ({
            fileType: "image",
            url: `https://ours-pull.b-cdn.net${cdnFolder}/${file.objectName}`,
            name: file.objectName,
            folder: folder,
            base: base,
            fileId: file.guid,
            filename: file.objectName,
        }));
    console.log("getAllImages Images");
    console.log(images);

    res.status(200).json(images);
  } catch (err) {
    console.error(`Error fetching images from ${cdn}:`, err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

export const createGallery = async (
    req: Request<{}, {}, Partial<GalleryDocument>>,
    res: Response
) => {
    console.log("gallery.controller, createGallery");

    try {
        const newGallery = new Gallery(req.body);
        const savedGallery = await newGallery.save();

        res.status(200).json(savedGallery);
    } catch (error) {
        console.error("gallery Save Failed:", error);
        res.status(500).json({ message: "Error creating gallery", error });
    }
};

export const updateGallery = async (
    req: Request<ParamsId, {}, Partial<GalleryDocument>>,
    res: Response
) => {
    try {
        const galleryId = req.params.id;
        const updateData = req.body;
        console.log("gallery.controller, updateGallery ", galleryId, req.params);
        console.log(updateData);

        const updatedGallery = await Gallery.findOneAndUpdate(
            { _id: galleryId },
            updateData,
            { new: true }
        );

        if (!updatedGallery) {
            return res.status(404).json({ message: "Gallery not found" });
        }

        res.status(200).json(updatedGallery);
    } catch (error) {
        console.error("Error updating Gallery:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/** Delete gallery */
export const deleteGallery = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    console.log("gallery.controller, deleteGallery");

    try {
        const galleryId = req.params.id;
       console.log("gallery.controller, deleteGallery ", galleryId);

        const deletedGallery = await Gallery.findByIdAndDelete(req.params.id);
        //const deletedGallery = true;
        if (!deletedGallery) {
            return res
                .status(404)
                .json({ error: "Gallery not found for deletion" });
        }

        res.status(200).json({ message: "Gallery has been deleted" });
    } catch (err) {
        res.status(500).json({ error: "Gallery to delete officer" });
    }
};
//------------------------------- Import file -----------------------------------------------------------------------
//

export const importFile = async (req: Request, res: Response): Promise<void> => {
    console.log("gallery.controller, importFile");

    const file = req.file;
    const cdnFolder = req.body.folder;
    console.log(cdnFolder, req.body);
    
    if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    if (!cdnFolder) {
        res.status(400).json({ error: "No folder specified" });
        return;
    }

    // Extract base and folder from "base/folder"
    const parts = cdnFolder.split("/").filter(Boolean);

    if (parts.length < 2) {
        res.status(400).json({ error: "Folder must be in format base/folder" });
        return;
    }

    const base = parts[0];
    const folder = parts.slice(1).join("/"); // supports nested folders like base/a/b

    const originalName = file.originalname;
    const uniqueFileName = `${uuidv4()}.jpg`;
    console.log(`backend gallery.controller importFile folder = ${cdnFolder}`)
    const cdn = "Bunny"
    let result = {};

    try {
        //process image
        const processedBuffer = await sharp(file.path)
            .resize({ width: 1200 })      // aspect ratio maintained
            .jpeg({ quality: 80 })        // export quality 80%
            .toBuffer();
        
        console.log(`Upload to ${cdn}`)
            // Upload to Bunny
            const nodeStream = Readable.from(processedBuffer);
            const stream = Readable.toWeb(nodeStream);
            result = await BunnyStorageSDK.file.upload(
                storageZone,
                `${cdnFolder}/${uniqueFileName}`,
                stream,
                {
                    contentType: "image/jpeg",
                }
            );

            const fileUrl = `https://ours-pull.b-cdn.net${cdnFolder}/${uniqueFileName}`;

            // Save image record to MongoDB
            const newImage = await Image.create({
                originalName,
                url: fileUrl,
                size: processedBuffer.length,
                base,
                folder,
                fileName: uniqueFileName,
            });


            res.status(200).json({
            message: "File uploaded successfully",
            url: fileUrl,
            fileId: uniqueFileName,
            });
        // Remove temp file
        fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to remove temp file:", err);
        });
        
        console.log("importFile Result");
        console.log(result);

    } catch (err: unknown) {
        console.error(`${cdn} upload failed:`, err);

        // Safely get message
        const message = err instanceof Error ? err.message : String(err);

        res.status(500).json({ error: message });
    }
};
