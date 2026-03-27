import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import galleryImg from "../../assets/wait_1.jpg";

import { useEffect, useState } from "react";
import GalleryList from "../../components/Gallery/GalleryList";
import GalleryView from "../../components/Gallery/GalleryView";
import type { GalleryRecord } from "../../types/galleryTypes";
import { getAllGallery } from "utilities"; // adjust path as needed

interface ImageData {
  id: string;
  url: string;
  name: string;
}
//TODO check setImages
export default function GalleryHome() {
  const [selectedGallery, setSelectedGallery] = useState<GalleryRecord | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
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
      setLoading(false); // ✅ stop the loading spinner
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

      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

          {/* ---------- Header ---------- */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Gallery
            </h1>

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              ← Back to Home
            </button>
          </div>

          {/* ---------- Intro ---------- */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={galleryImg}
              alt="Gallery"
              className="w-48 h-48 object-cover rounded-xl shadow"
            />

            <p className="text-gray-600 text-center md:text-left">
              This section is dedicated to family stories, milestones, and
              shared memories. Over time, it will grow into a collection of
              moments worth remembering.
            </p>
          </div>

          {/* ---------- Placeholder content ---------- */}
          <div className="mt-10 space-y-4 text-gray-700">
            <p>
              Content coming soon…
            </p>

            <p>
              Future updates may include image galleries, family history,
              timelines, and personal reflections.
            </p>
          </div>
        </div>
      </div>
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
          <GalleryView
            gallery={selectedGallery}
            onBack={() => setSelectedGallery(null)}
          />
        </div>
      )}
      </div>
    </>
  );
}
