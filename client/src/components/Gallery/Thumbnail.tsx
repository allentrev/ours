import React from "react";
import {type  Image } from "../../types/galleryTypes";

interface ThumbnailPanelProps {
  images: Image[];
  selected: Image[];
  setSelected: (images: Image[]) => void;
  currentCoverUrl?: string; // optional, to mark cover image
}

export const ThumbnailPanel: React.FC<ThumbnailPanelProps> = ({
  images,
  selected,
  setSelected,
  currentCoverUrl
}) => {
  const toggleSelection = (image: Image) => {
    if (selected.some((p) => p.url === image.url)) {
      setSelected(selected.filter((p) => p.url !== image.url));
    } else {
      setSelected([...selected, image]);
    }
  };

  const isSelected = (image: Image) => selected.some((p) => p.url === image.url);

    // ✅ If no images, show message instead
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-800 text-lg">
        No images found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-0">
      {images.map((image) => (
        <div
          key={image.fileId || image.url}
          className="relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-100"
          onClick={() => toggleSelection(image)}
        >
          <img
            src={image.url}
            alt={image.filename || "Thumbnail"}
            className="w-full h-full object-cover block"
          />
          {/* Selection overlay */}
          {isSelected(image) && (
            <div className="absolute inset-0 bg-yellow-500/40 ring-2 ring-yellow-400 rounded-lg" />
          )}

          {/* Cover marker */}
          {image.url === currentCoverUrl && (
            <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1 text-xs font-bold rounded">
              COVER
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
