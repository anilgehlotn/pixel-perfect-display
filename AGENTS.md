<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- All storefront content (products, prices, copy, image paths) lives in src/data/content.ts — so a backend/Shopify can replace it later.
- Cart is in-memory React context (src/lib/cart.tsx) mounted in __root — frontend-only scope.
- Shared site sections live in src/components/site/ (Chrome = header/footer/cart, Sections = homepage blocks).
