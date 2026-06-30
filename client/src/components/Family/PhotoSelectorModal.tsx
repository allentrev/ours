import { useEffect, useMemo, useState } from "react";

import { getGalleryImages } from "../../utilities/galleryUtils";
import { ThumbnailPanel } from "../Gallery/Thumbnail";

import type { Image } from "../../types/galleryTypes";

interface PersonPhotoSelectorModalProps {
  open: boolean;
  currentPhotoUrl?: string;
  onClose: () => void;
  onSelectPhoto: (image: Image) => void;
}

const PAGE_SIZE = 20;

export default function PersonPhotoSelectorModal({
  open,
  currentPhotoUrl,
  onClose,
  onSelectPhoto,
}: PersonPhotoSelectorModalProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [selected, setSelected] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setSelected([]);
    setPage(1);

    getGalleryImages("Family", "persons")
      .then(setImages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));

  const pageImages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return images.slice(start, start + PAGE_SIZE);
  }, [images, page]);

  const selectedImage = selected[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[85vh] w-[900px] max-w-[95vw] flex-col rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          Select Person Photo
        </h2>

        <div className="min-h-0 flex-1 overflow-auto border rounded p-2">
          {loading ? (
            <div className="py-10 text-center text-gray-600">
              Loading images...
            </div>
          ) : (
            <ThumbnailPanel
              images={pageImages}
              selected={selected}
              setSelected={(images) => {
                const lastSelected = images.at(-1);
                setSelected(lastSelected ? [lastSelected] : []);
              }}
              currentCoverUrl={currentPhotoUrl}
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded border px-3 py-1 disabled:text-gray-400"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded border px-3 py-1 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>

        {selectedImage && (
          <div className="mt-3 truncate rounded bg-gray-100 px-3 py-2 text-sm text-gray-700">
            Selected: {selectedImage.filename || selectedImage.url}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedImage}
            onClick={() => {
              if (!selectedImage) return;

              onSelectPhoto(selectedImage);
              onClose();
            }}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}