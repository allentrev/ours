import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import type { GalleryRecord } from "../../types/galleryTypes";
import type { Image} from "../../types/galleryTypes";
import { getGalleryImages } from "../../utilities/galleryUtils";

interface GalleryViewProps {
  gallery: GalleryRecord;
  onBack: () => void;
}

export default function GalleryView({ gallery, onBack }: GalleryViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  // Attach custom navigation after Swiper mounts and refs exist
  useEffect(() => {
    if (
      swiperInstance &&
      swiperInstance.params &&
      swiperInstance.navigation &&
      prevRef.current &&
      nextRef.current
    ) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;

      swiperInstance.navigation.destroy();
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);

  // ✅ Fetch images using the gallery's base and folder
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imgs = await getGalleryImages(gallery.base, gallery.folder);
        console.log(`Found ${imgs.length} images`);
        setImages(imgs);
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [gallery.base, gallery.folder]);

  if (loading) return <p className="text-center py-10">Loading images…</p>;

  // ✅ No images found
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          No images found in this gallery.
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Back + Title */}
      <div className="flex items-center justify-between mb-6 w-full max-w-4xl">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-center flex-1 mx-4">
          {gallery.title}
        </h2>
        <div className="w-20"></div>
      </div>

      {/* Carousel */}
      <div className="w-full flex justify-center relative">
        <div className="w-full max-w-4xl mx-auto relative">
          <Swiper
            className="h-[70vh] w-full"
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={20}
            centeredSlides
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
          >
            {images.map((img, i) => (
              <SwiperSlide
                key={i}
                className="flex items-center justify-center h-full"
              >
                <img
                  src={img.url}
                  alt={`${gallery.title} ${i + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div
            ref={prevRef}
            className={`absolute top-1/2 -translate-y-1/2 z-10 text-3xl md:text-5xl
              cursor-pointer text-white bg-black/40 hover:bg-black/60 p-2 md:p-3
              rounded-full select-none left-2 md:left-[-50px]
              ${lightboxIndex === 0 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
          >
            ‹
          </div>

          <div
            ref={nextRef}
            className={`absolute top-1/2 -translate-y-1/2 z-10 text-3xl md:text-5xl
              cursor-pointer text-white bg-black/40 hover:bg-black/60 p-2 md:p-3
              rounded-full select-none right-2 md:right-[-50px]
              ${lightboxIndex === images.length - 1
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : ""}`}
          >
            ›
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={images.map((img) => ({ src: img.url }))}
        />
      )}
    </div>
  );
}
