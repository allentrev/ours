// utilities/galleryUtils.ts
import type { GalleryRecord, Image, UploadImageResult } from "../types/galleryTypes";

export const inFormFolderName = (folder: string): string => {
    // this routine takes in the folder name from the client screen and transforms the folder name into a form suitable for 
    // the CDN and for storing in the database. SPaces becomes underscore, all converted to lower case.
    if (!folder) return "";
    return folder.trim().replace(/\s+/g, "_").toLowerCase();
}
  
export const outFormFolderName = (folder: string): string => {
    // this routine takes in the folder name from the database and transforms the folder name into a form suitable for 
    // displaying. Underscore is turned into space, the words are capitalised.
    if (!folder) return "";
    return folder
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Fetches all gallery records from the backend.
 */
export const getAllGallery = async (): Promise<GalleryRecord[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        return res.ok ? (data as GalleryRecord[]) : [];
    } catch (err) {
        throw new Error(`getAllGallery error: ${err}`);
    }
};

export const createGallery = async (
    item: GalleryRecord
): Promise<GalleryRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery`;
    console.log("util/createGallery");

    const payload: GalleryRecord = {
        ...item,
        cover: item.cover && item.cover.trim() !== "" 
            ? item.cover 
            : "/assets/green1.jpg"
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create gallery: ${errorText}`);
        }

        return await res.json();
    } catch (err) {
        throw new Error(`createGallery error: ${err}`);
    }
};

export const updateGallery = async (
    gallery: GalleryRecord
): Promise<GalleryRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/${
        gallery._id
    }`;
    const {_id, ...data} = gallery;
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update gallery: ${errorText}`);
        }
        return await res.json();
    } catch (err) {
        throw new Error(`updateGallery error: ${err}`);
    }
};

export const updateAllGallery = async (
    updatedRecords: GalleryRecord[]
): Promise<void> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/updateMany`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecords),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update all gallery: ${errorText}`);
        }
    } catch (err) {
        throw new Error(`updateAllGallery error: ${err}`);
    }
};

/**
 * Deletes a gallery record by its refKey.
 */
export const deleteGallery = async (gallery: GalleryRecord): Promise<void> => {
    console.log("utility delete Gallery");
    if (!gallery._id) throw new Error("Gallery._id is required for deletion.");

    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/${gallery._id}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to delete gallery: ${errorText}`);
        }
        console.log("Gallery deleted successfully");
    } catch (err) {
        throw new Error(`deleteGallery error: ${err}`);
    }
};
// Need to add folder name
export async function importFile(file: File, folder: string): Promise<UploadImageResult> {

    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/import`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    let response: Response;
    let data: any;

    try {
        response = await fetch(url, {
            method: "POST",
            body: formData,
        });
        data = await response.json();
   } catch (err) {
        console.error("Network or JSON parsing error", err);
        throw new Error("Failed to communicate with server");
    }

    if (!response.ok) {
        const error = new Error(data?.message || "Upload file failed");
        throw error;
    }

    return {
        success: true,
        message: data.message,
        url: data.url,
        fileId: data.fileId,
    };
}

export const getGalleryImages = async (base: string, folder: string): Promise<Image[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/gallery/images/${encodeURIComponent(base)}/${encodeURIComponent(folder)}`;
    console.log(url)
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch gallery [${folder}] images: ${res.statusText}`);
        const data = await res.json();
        //console.log("client getGalleryimages data");
        //console.log(data);
        const images = (data as any[])
        .filter((f) => f.fileType === "image")
        .map((f) => ({
            url: f.url,
            fileId: f.fileId,
            base: f.base,
            folder: f.folder,
            filename: f.filename,
            access: f.access ?? "public", 
        }));
        //console.log("client getGalleryimages images");
        //console.log(images);
        return images; // may be []
    } catch (err) {
        console.error(err);
        return [];
    }
};

/**
 * Requests backend to delete a image from CDN.
 * Expects the backend to handle deletion via the CDN API.
 */

export const deleteImageFromCDN = async (image: Image): Promise<void> => {
    //console.log(`deleteImageFromCDN using ${cdn}`);
    //console.log(image);

  // We expect `image.name` to contain the CDN fileId
  if (!image.fileId) throw new Error("Image fileId (name) is required to delete a image.");

  let url = "";
    url = `${import.meta.env.VITE_BACKEND_URL}/image/${encodeURIComponent(image.base)}/${encodeURIComponent(image.folder)}/${encodeURIComponent(image.filename)}`;
  
  try {
    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete image: ${errorText}`);
    }
  } catch (err) {
    throw new Error(`deleteImageFromCDN error: ${err}`);
  }
};


