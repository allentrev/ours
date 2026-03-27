// types/galleryTypes.ts

export interface UploadImageResult {
  success: boolean;           // true if upload succeeded
  message: string;            // backend message, e.g. "File uploaded successfully"
  url?: string;               // uploaded file URL
  fileId?: string;            // CDN file ID
}

export interface GalleryRecord {
    _id?: string;
    base: string;
    folder: string;
    access: string;
    cover?: string;
    title: string;
    description?: string;
    images?:string[];
}

// Image as used in GalleryView
export interface Image {
  fileId: string;       // CND fileId (optional, for deletion)
  base: string;        // the base folder name in the Gallery
  folder: string;      // folder name
  filename: string;     // filename
  url: string;          // URL for display
  access: string;      // optional access level (e.g., "public", "private")
  width?: number;
  height?: number;
  size?: number;
}
