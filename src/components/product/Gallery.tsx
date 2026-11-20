import { useState, type ReactNode } from "react";
import type { GalleryImage } from "./gallery-image";

type Slide =
  | { kind: "node"; node: ReactNode; background: string; label: string }
  | { kind: "image"; image: GalleryImage };

/**
 * Product pictures: one large square and a row of thumbnails. `lead` (the pouch render on its
 * backdrop) comes first when there is no packshot yet. The first slide is in the server HTML
 * and loads eagerly; thumbnails swap the large picture without a page load.
 */
export function Gallery({
  images,
  label,
  lead,
}: {
  images: GalleryImage[];
  label: string;
  lead?: { node: ReactNode; background: string } | undefined;
}) {
  const slides: Slide[] = [
    ...(lead ? [{ kind: "node" as const, ...lead, label: `${label} pouch` }] : []),
    ...images.map((image) => ({ kind: "image" as const, image })),
  ];
  const [index, setIndex] = useState(0);
  // Fade only after a thumbnail click, never on the first paint (keeps LCP fast).
  const [touched, setTouched] = useState(false);
  const current = slides[index] ?? slides[0];
  if (!current) return <div className="aspect-square w-full bg-sand" />;
  const fade = touched ? "animate-[gallery-in_600ms_var(--ease-soft)]" : "";
  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-sand">
        {current.kind === "node" ? (
          <div
            key="lead"
            className={`absolute inset-0 ${fade}`}
            style={{ background: current.background }}
          >
            {current.node}
          </div>
        ) : (
          <img
            key={current.image.src}
            src={current.image.src}
            srcSet={current.image.srcSet}
            sizes="(min-width: 1024px) 42rem, 100vw"
            alt={current.image.alt}
            width={current.image.width}
            height={current.image.height}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
            decoding="async"
            className={`h-full w-full object-cover ${fade}`}
          />
        )}
      </div>
      {slides.length > 1 && (
        <ul
          aria-label={`${label} pictures`}
          className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1"
        >
          {slides.map((s, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  setIndex(i);
                }}
                aria-label={`Show picture ${i + 1} of ${slides.length}`}
                aria-current={i === index ? "true" : undefined}
                className={`relative block h-[4.5rem] w-[4.5rem] overflow-hidden border-2 transition-opacity md:h-20 md:w-20 ${i === index ? "border-coral" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                {s.kind === "node" ? (
                  <span className="absolute inset-0" style={{ background: s.background }}>
                    {s.node}
                  </span>
                ) : (
                  <img
                    src={s.image.src}
                    srcSet={s.image.srcSet}
                    sizes="5rem"
                    alt=""
                    width={s.image.width}
                    height={s.image.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
