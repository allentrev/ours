import React, { useRef } from "react";
import type { UploadImageResult } from "../types/galleryTypes";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  cdnFolder: string;
  importFile: (file: File, folder: string) => Promise<UploadImageResult>;
  cdnBase: string;
}

export function ImageUpload({
  value,
  onChange,
  cdnFolder,
  importFile,
  cdnBase,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importFile(file, cdnFolder);

      const url = `${cdnBase}${cdnFolder}/${file.name}`;

      onChange(url);
    } catch (err) {
      console.error("Upload failed", err);
    }

    e.target.value = "";
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 flex-1"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        📷️
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}