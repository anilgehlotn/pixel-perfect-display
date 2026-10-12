import { brand } from "@/data/content";

// Markup for the CSS intro loader (see src/lib/animations/intro.ts). Always in the HTML,
// shown only when the inline head script sets html[data-intro].
export function IntroLoader() {
  return (
    <div className="sf-intro" aria-hidden="true">
      <span className="sf-intro__word">
        {brand.name.split("").map((letter, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
    </div>
  );
}
