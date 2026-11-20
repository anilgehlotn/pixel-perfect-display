import type { MediaImage } from "@/data/media";
import type { ShopifyImage } from "@/lib/shopify/types";

export type GalleryImage = {
  src: string;
  srcSet?: string | undefined;
  alt: string;
  width: number;
  height: number;
};

export const fromShopify = (img: ShopifyImage, fallbackAlt: string): GalleryImage => ({
  src: img.webpUrl ?? img.url,
  alt: img.altText ?? fallbackAlt,
  width: img.width,
  height: img.height,
});

export const fromMedia = (m: MediaImage): GalleryImage => ({
  src: m.src,
  srcSet: m.srcSet,
  alt: m.alt,
  width: m.width,
  height: m.height,
});
