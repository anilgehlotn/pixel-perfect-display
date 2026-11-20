import {
  Drop,
  Eye,
  Flower,
  Heart,
  Leaf,
  LockSimple,
  Moon,
  Plant,
  ShieldCheck,
  Sparkle,
  Truck,
  YinYang,
  type IconProps,
} from "@phosphor-icons/react";
import type { IconName } from "@/data/content";

const ICONS = {
  Drop,
  Eye,
  Flower,
  Heart,
  Leaf,
  LockSimple,
  Moon,
  Plant,
  ShieldCheck,
  Sparkle,
  Truck,
  YinYang,
} satisfies Record<IconName, unknown>;

/** Phosphor icon by the name used in content.ts. Always light weight, decorative. */
export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];
  return <Component weight="light" aria-hidden="true" {...props} />;
}
