import { Request, Response } from "express";
import { imagekit } from "../lib/imagekit.js";
import { storageZone } from "../lib/bunny.js";
import * as BunnyStorageSDK from "@bunny.net/storage-sdk";

// Minimal type describing what we actually need
interface ImageKitFile {
  filePath: string; // e.g. "gallery/image.jpg"
}

export const getImageFolders = async (req: Request, res: Response): Promise<void> => {
  console.log("image.controller, getImageFolders");

  try {
    const uniqueFolders = new Set<string>();
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      // Cast result to our minimal type
      const files = (await imagekit.listFiles({
        path: "/",
        skip,
        limit,
        includeFolder: false,
      })) as ImageKitFile[];

      for (const file of files) {
        const filePath = file.filePath || "";
        if (filePath.includes("/")) {
          uniqueFolders.add(filePath.split("/")[0]);
        }
      }

      if (files.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    }

    res.status(200).json(Array.from(uniqueFolders));
  } catch (error) {
    console.error("Error fetching ImageKit folders:", error);
    res.status(500).json({ error: "Failed to retrieve folders" });
  }
};

/**
 * DELETE /api/images/:fileIdentifier
 * Deletes an image from ImageKit using its fileId (identifier).
 */
export async function deleteImage(req: Request, res: Response) {

  try {
    const cdn = "Bunny";
    const {base, folder, fileIdentifier } = req.params;
    console.log(`image.controller ${cdn} deleteImage base=${base} folder=${folder}, fileIdentifier=${fileIdentifier}`);
    if (!folder || !fileIdentifier || !base) {
      return res.status(400).json({ error: "Missing base or folder or fileIdentifier parameter." });
    }

    if (cdn !== "Bunny") {
      await imagekit.deleteFile(fileIdentifier);
      return res.status(200).json({
        success: true,
        message: `Image with fileId '${fileIdentifier}' deleted successfully.`,
      });
    } else {
      const cdnPath = `${base}/${folder}/${fileIdentifier}`;
      await BunnyStorageSDK.file.remove(storageZone, cdnPath);
      return res.status(200).json({
        success: true,
        message: `Image  '${cdnPath}' deleted successfully from Bunny.`,
      });
    }
  } catch (error: any) {
    console.error("Image deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
      error: error?.message || String(error),
    });
  }
}
