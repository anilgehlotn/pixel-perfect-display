import { beforeEach, describe, expect, it } from "vitest";

import { localProducts } from "@/data/content";
import type { Cart, CartLine } from "@/lib/cart/context";
import { localCartStore } from "@/lib/cart/store";

const product = localProducts[0]!;
const merch = (i: number): CartLine["merchandise"] => {
  const v = product.variants[i]!;
  return {
    id: v.id,
    title: v.title,
    price: v.price,
    image: product.featuredImage,
    product: { handle: product.handle, title: product.title },
  };
};

describe("localCartStore", () => {
  beforeEach(() => localStorage.clear());

  it("merges the same variant into one line and keeps packs separate", async () => {
    let cart: Cart = await localCartStore.load();
    cart = await localCartStore.add(cart, merch(0), 1);
    cart = await localCartStore.add(cart, merch(0), 2);
    cart = await localCartStore.add(cart, merch(1), 1);
    expect(cart.lines.map((l) => [l.merchandise.title, l.quantity])).toEqual([
      ["1 Pouch", 3],
      ["2 Pouches", 1],
    ]);
  });

  it("survives a reload and removes a line at quantity 0", async () => {
    let cart = await localCartStore.add(await localCartStore.load(), merch(0), 1);
    expect((await localCartStore.load()).lines).toHaveLength(1);
    cart = await localCartStore.update(cart, cart.lines[0]!.id, 0);
    expect(cart.lines).toHaveLength(0);
    expect((await localCartStore.load()).lines).toHaveLength(0);
  });
});
