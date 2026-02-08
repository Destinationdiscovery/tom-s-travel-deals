import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface PhotoGalleryProps {
  photoReferences: string[];
  functionUrl: string;
}

const PhotoGallery = ({ photoReferences, functionUrl }: PhotoGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photoReferences || photoReferences.length === 0) return null;

  const photoUrls = photoReferences.map(
    (ref) => `${functionUrl}?name=${encodeURIComponent(ref)}`
  );

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {photoUrls.map((url, index) => (
          <button
            key={index}
            onClick={() => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={url}
              alt={`Destination photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      <ImageLightbox
        images={photoUrls}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default PhotoGallery;
