import { Request, Response } from "express";
import { storageZone } from "../lib/bunny.js";
import * as BunnyStorageSDK from "@bunny.net/storage-sdk";
import Image from "../models/image.model.js";

/**
 * DELETE /api/images/:fileIdentifier
 * Deletes an image from CDN using its fileId (identifier).
 */
export async function deleteImage(req: Request, res: Response) {
  try {
    const cdn = "Bunny";
    const { base, folder, fileIdentifier } = req.params;

    console.log(
      `image.controller ${cdn} deleteImage base=${base} folder=${folder}, fileIdentifier=${fileIdentifier}`
    );

    if (!base || !folder || !fileIdentifier) {
      return res.status(400).json({
        error: "Missing base or folder or fileIdentifier parameter.",
      });
    }

    // First check MongoDB
    const imageRecord = await Image.findOne({
      base,
      folder,
      fileName: fileIdentifier,
    });

    if (!imageRecord) {
      return res.status(404).json({
        success: false,
        message: `No database record found for ${base}/${folder}/${fileIdentifier}. Delete cancelled.`,
      });
    }

    const cdnPath = `${base}/${folder}/${fileIdentifier}`;

    // Delete from Bunny only if DB record exists
    await BunnyStorageSDK.file.remove(storageZone, cdnPath);

    // Delete DB record only after Bunny delete succeeds
    await Image.deleteOne({ _id: imageRecord._id });

    return res.status(200).json({
      success: true,
      message: `Image '${cdnPath}' deleted successfully from Bunny and MongoDB.`,
    });
  } catch (error: any) {
    console.error("Image deletion failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
      error: error?.message || String(error),
    });
  }
}