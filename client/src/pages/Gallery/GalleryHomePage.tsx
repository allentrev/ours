import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";

import { useEffect, useState } from "react";
import GalleryList from "../../components/Gallery/GalleryList";
import GalleryView from "../../components/Gallery/GalleryView";
import type { GalleryRecord } from "../../types/galleryTypes";
import { getAllGallery } from "utilities";

export default function GalleryHome() {
  const [selectedGallery, setSelectedGallery] = useState<GalleryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleries, setGalleries] = useState<GalleryRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllGallery();
        setGalleries(data);
      } catch (error) {
        console.error("Failed to load Gallery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <>
      {/* ---------- SEO ---------- */}
      <SEO
        title="Gallery | Personal Website"
        description="Family memories, stories, and moments collected in one place."
      />

      {/* ---------- Header ---------- */}
      <div className="px-6 py-4">
        <div className="max-w-5xl mx-auto rounded-2xl shadow-lg p-2 ">

          {/* Top Row */}
          <div className="flex justify-between items-center mb-4">

            {/* Title + Selected Gallery */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-800">Gallery</h1>

              {selectedGallery && (
                <>
                  <span className="text-gray-400 text-2xl">/</span>
                  <h2 className="text-2xl font-semibold text-gray-700">
                    {selectedGallery.title}
                  </h2>
                </>
              )}
            </div>

            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Home
            </button>
          </div>

          {/* Back Button (only when viewing a gallery) */}
          {selectedGallery && (
            <div className="mb-2">
              <button
                onClick={() => setSelectedGallery(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="flex flex-col items-center py-10 min-h-[calc(100vh-80px-80px)]">
        {!selectedGallery ? (
          <div className="w-full max-w-5xl mx-auto">
            {galleries.length > 0 ? (
              <GalleryList galleries={galleries} onOpen={setSelectedGallery} />
            ) : (
              <p className="text-center text-black text-5xl">
                No Galleries found.
              </p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <GalleryView gallery={selectedGallery} />
          </div>
        )}
      </div>
    </>
  );
}