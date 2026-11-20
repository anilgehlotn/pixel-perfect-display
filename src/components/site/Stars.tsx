import { Star } from "@phosphor-icons/react";

export function Stars({
  value,
  size = 14,
  className = "text-primary",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      className={`inline-flex gap-0.5 ${className}`}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} weight={s <= Math.round(value) ? "fill" : "light"} />
      ))}
    </span>
  );
}
