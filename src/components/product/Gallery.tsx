import { useState } from "react";
import type { GalleryImage } from "./gallery-image";

/**
 * Product photos: one large square image and a row of thumbnails. The first image is in the
 * server HTML and loads eagerly; thumbnails swap the large image without a page load.
 */
export function Gallery({ images, label }: { images: GalleryImage[]; label: string }) {
  const [index, setIndex] = useState(0);
  // Fade only after a thumbnail click, never on the first paint (keeps LCP fast).
  const [touched, setTouched] = useState(false);
  const current = images[index] ?? images[0];
  if (!current) return <div className="aspect-square w-full bg-beige" />;
  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-beige">
        <img
          key={current.src}
          src={current.src}
          srcSet={current.srcSet}
          sizes="(min-width: 1024px) 42rem, 100vw"
          alt={current.alt}
          width={current.width}
          height={current.height}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
          decoding="async"
          className={`h-full w-full object-cover ${touched ? "animate-[gallery-in_600ms_var(--ease-soft)]" : ""}`}
        />
        {images.length > 1 && (
          <p className="absolute bottom-3 right-3 bg-surface/90 px-2.5 py-1 text-xs tabular-nums tracking-[0.12em] text-ink">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
      {images.length > 1 && (
        <ul
          aria-label={`${label} photos`}
          className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1"
        >
          {images.map((img, i) => (
            <li key={img.src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  setIndex(i);
                }}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index ? "true" : undefined}
                className={`block h-[4.5rem] w-[4.5rem] overflow-hidden border transition-colors md:h-20 md:w-20 ${i === index ? "border-ink" : "border-transparent opacity-75 hover:opacity-100"}`}
              >
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="5rem"
                  alt=""
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
