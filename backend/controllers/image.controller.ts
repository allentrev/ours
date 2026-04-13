import { Request, Response } from "express";
import { storageZone } from "../lib/bunny.js";
import * as BunnyStorageSDK from "@bunny.net/storage-sdk";

/**
 * DELETE /api/images/:fileIdentifier
 * Deletes an image from CDN using its fileId (identifier).
 */
export async function deleteImage(req: Request, res: Response) {

  try {
    const cdn = "Bunny";
    const {base, folder, fileIdentifier } = req.params;
    console.log(`image.controller ${cdn} deleteImage base=${base} folder=${folder}, fileIdentifier=${fileIdentifier}`);
    if (!folder || !fileIdentifier || !base) {
      return res.status(400).json({ error: "Missing base or folder or fileIdentifier parameter." });
    }

      const cdnPath = `${base}/${folder}/${fileIdentifier}`;
      await BunnyStorageSDK.file.remove(storageZone, cdnPath);
      return res.status(200).json({
        success: true,
        message: `Image  '${cdnPath}' deleted successfully from Bunny.`,
      });
  }
  catch (error: any) {
    console.error("Image deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
      error: error?.message || String(error),
    });
  }
}
