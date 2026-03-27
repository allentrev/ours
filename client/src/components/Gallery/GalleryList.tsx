import type { GalleryRecord } from "../../types/galleryTypes";

interface GalleryListProps {
  galleries: GalleryRecord[];
  onOpen: (gallery: GalleryRecord) => void;
}

export default function GalleryList({ galleries, onOpen }: GalleryListProps) {
  return (
    <div className="w-full max-w-6xl mx-auto ">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
        {galleries.map((g) => (
          <div
            key={g._id}
            className="cursor-pointer rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition"
            onClick={() => onOpen(g)}
          >
            <img
              src={g.cover}
              alt={g.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-3 text-center text-lg font-semibold text-gray-800">
              {g.title}
            </div>
            <div className="p-3 text-center font-semibold text-gray-600">
              {g.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
