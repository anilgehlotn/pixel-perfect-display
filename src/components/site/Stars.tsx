import { Star } from "@phosphor-icons/react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span role="img" className="inline-flex text-primary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} weight={s <= Math.round(value) ? "fill" : "light"} />
      ))}
    </span>
  );
}
