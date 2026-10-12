import type { ShopifyImage } from "@/lib/shopify/types";

// Product photo with a WebP source and JPG fallback. width/height reserve the space so the
// layout does not jump while it loads; className sets the displayed size and crop.
export function ProductImage({
  image,
  alt,
  className = "",
  loading = "lazy",
}: {
  image: ShopifyImage;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const img = (
    <img
      src={image.url}
      alt={alt ?? image.altText ?? ""}
      width={image.width}
      height={image.height}
      loading={loading}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
  if (!image.webpUrl) return img;
  return (
    <picture className="contents">
      <source srcSet={image.webpUrl} type="image/webp" />
      {img}
    </picture>
  );
}
