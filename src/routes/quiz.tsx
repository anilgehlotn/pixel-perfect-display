import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { quiz, product, images } from "@/data/content";
import { useCart } from "@/lib/cart/context";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Skin Quiz | Find your glow ritual | SkinFusion" },
      {
        name: "description",
        content: "Answer four quick questions to find a SkinFusion tea ritual that fits your day.",
      },
      { property: "og:title", content: "SkinFusion Skin Quiz" },
      { property: "og:description", content: "Find your glow ritual in 60 seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

const timing = [
  "first thing in the morning",
  "as your afternoon pause",
  "after dinner to wind down",
  "whenever you need a calm moment",
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { add } = useCart();
  const done = step >= quiz.length;

  const pick = (k: number) => {
    setAnswers([...answers, k]);
    setStep(step + 1);
  };

  return (
    <main className="section-y pt-48">
      <div className="container-x max-w-2xl">
        {!done ? (
          <div key={step} className="reveal is-in">
            <p className="label-caps text-teal">
              Question {step + 1} of {quiz.length}
            </p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-blush">
              <div
                className="h-full origin-left bg-primary transition-transform duration-500"
                style={{ transform: `scaleX(${step / quiz.length})` }}
              />
            </div>
            <h1 className="mt-10 text-4xl md:text-5xl">{quiz[step]!.q}</h1>
            <div className="mt-10 grid gap-3">
              {quiz[step]!.options.map((o, k) => (
                <button
                  key={o}
                  onClick={() => pick(k)}
                  className="min-h-14 rounded-lg border bg-background px-5 text-left transition-colors hover:border-foreground"
                >
                  {o}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                onClick={() => {
                  setStep(step - 1);
                  setAnswers(answers.slice(0, -1));
                }}
                className="label-caps mt-8 text-muted-foreground"
              >
                Back
              </button>
            )}
          </div>
        ) : (
          <div className="reveal is-in">
            <p className="label-caps text-teal">Your glow ritual</p>
            <h1 className="mt-4 text-4xl md:text-5xl">
              One warm cup, <span>{timing[answers[3] ?? 0]}.</span>
            </h1>
            <div className="mt-10 grid items-center gap-8 rounded-banner bg-blush p-6 sm:grid-cols-[0.8fr_1fr] md:p-10">
              <img
                src={images.pouch}
                alt={product.name}
                className="aspect-[4/5] w-full rounded-lg object-cover"
              />
              <div>
                <p className="label-caps text-[0.7rem]">{product.name}</p>
                <p className="mt-3 text-muted-foreground">
                  A gentle, caffeine-free blend of jujube, snow fungus and goji. We suggest the
                  2-pouch pack to settle into a 21-day ritual.
                </p>
                <p className="mt-5">
                  <span className="text-2xl">{inr(product.price)}</span>{" "}
                  <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
                </p>
                <button
                  onClick={() =>
                    add({
                      key: "1-false",
                      name: product.short,
                      image: images.pouch,
                      packLabel: "1 Pouch",
                      unitPrice: product.price,
                      qty: 1,
                      subscribe: false,
                    })
                  }
                  className="btn btn-primary mt-6 w-full"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers([]);
                  }}
                  className="label-caps mt-4 w-full text-center text-muted-foreground"
                >
                  Retake quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
