# Media credits

Demo media used on the homepage for the client preview. All files live in
`public/media/demo/` and are referenced only from `src/data/media.ts`. Every item here is
marked `isDemo: true` there and must be replaced with the client's own, permitted content
before launch (see "Before launch checklist" in CLAUDE.md).

Nothing was hotlinked: every file was downloaded once and re-encoded locally.

- Videos: 720p H.264 MP4, no audio track, 7-10 seconds, all under 1.4 MB, each with a
  WebP poster frame in `public/media/demo/posters/`.
- Photos: WebP, at most 1400px wide (landscape) or 1000px wide (portrait).

## Licenses

- **Mixkit Free License**: free for commercial and personal use, no attribution required.
  Only clips marked "Free License" on Mixkit were used. Mixkit "Restricted License" clips
  are personal-use only and were skipped.
  https://mixkit.co/license/#videoFree
- **Pexels License**: free for commercial and personal use, no attribution required. Not
  allowed: selling unaltered copies, implying endorsement by people shown, or redistributing
  the photos as a stock collection. https://www.pexels.com/license/

## Videos (Mixkit)

| File                          | Used in                     | Author         | Source                                                                                            |
| ----------------------------- | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `videos/tea-steeping.mp4`     | How it works, TCM 101 modal | jibaroartz     | https://mixkit.co/free-stock-video/woman-preparing-a-cup-of-warm-tea-with-tea-bag-1511/           |
| `videos/tea-steam.mp4`        | Hero                        | franklandgrave | https://mixkit.co/free-stock-video/steaming-mug-808/                                              |
| `videos/morning-window.mp4`   | Product row, Stories        | edgarfernandez | https://mixkit.co/free-stock-video/young-sleepy-woman-in-the-morning-opens-her-window-31401/      |
| `videos/window-calm.mp4`      | Product row                 | Mixkit         | https://mixkit.co/free-stock-video/woman-looking-at-nature-through-the-window-42728/              |
| `videos/skincare-routine.mp4` | Stories                     | Mixkit         | https://mixkit.co/free-stock-video/a-young-woman-gently-rubs-cream-on-her-face-in-51177/          |
| `videos/skincare-closeup.mp4` | Product row                 | Mixkit         | https://mixkit.co/free-stock-video/a-young-woman-delicately-applies-a-beauty-face-cream-to-51185/ |
| `videos/leaves-sunlight.mp4`  | Product row                 | edgarfernandez | https://mixkit.co/free-stock-video/sunlight-passing-through-the-leaves-of-a-tree-34371/           |
| `videos/flowers-breeze.mp4`   | Stories                     | rubenvelasco   | https://mixkit.co/free-stock-video/white-flowers-in-the-breeze-1187/                              |

Each video has a matching poster: `posters/<same name>.webp`.

## Photos (Pexels)

| File                         | Used in              | Photographer        | Source                                                                                                      |
| ---------------------------- | -------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `photos/window-tea.webp`     | Product row, Stories | Вальдемар           | https://www.pexels.com/photo/cross-legged-sitting-woman-holding-cup-of-tea-looking-through-window-11012771/ |
| `photos/red-dates.webp`      | Sourcing             | Towfiqu barbhuiya   | https://www.pexels.com/photo/full-frame-of-drying-red-dates-12625117/                                       |
| `photos/ginger-lemon.webp`   | Product row          | Angele J            | https://www.pexels.com/photo/ginger-and-2-lemon-fruit-128403/                                               |
| `photos/glass-teapot.webp`   | Bundle collage       | Teejay              | https://www.pexels.com/photo/clear-glass-teapot-set-1362537/                                                |
| `photos/teacup-mint.webp`    | Stories              | Mareefe             | https://www.pexels.com/photo/peppermint-tea-on-teacup-1417945/                                              |
| `photos/herbal-flatlay.webp` | Product row          | Olena Bohovyk       | https://www.pexels.com/photo/clear-glass-bowl-with-herbs-and-tea-3604314/                                   |
| `photos/bathroom-shelf.webp` | Bundle collage       | Karola G            | https://www.pexels.com/photo/set-of-skin-care-products-in-contemporary-bathroom-4239013/                    |
| `photos/bathroom-sink.webp`  | Closing CTA          | Monstera Production | https://www.pexels.com/photo/sink-with-skincare-products-in-bathroom-6781117/                               |
| `photos/hands-glass.webp`    | Stories              | Vlada Karpovich     | https://www.pexels.com/photo/a-person-holding-a-cup-of-tea-6802967/                                         |
| `photos/hands-cup.webp`      | Bundle collage       | Teona Swift         | https://www.pexels.com/photo/anonymous-woman-drinking-cup-of-hot-tea-at-home-6874185/                       |

## Still missing (download by hand if wanted)

Pexels, Pixabay and most Mixkit tea clips could not be used automatically: Pexels and
Pixabay block scripted downloads, and the Mixkit clips below are "Restricted" (personal use
only). For these slots the page uses a photo instead. To add a video, download it at 720p,
put it in `public/media/demo/videos/`, add a poster frame, and change one line in
`src/data/media.ts`.

| Slot                                  | Search on                             | Search terms                                          | Save as                   |
| ------------------------------------- | ------------------------------------- | ----------------------------------------------------- | ------------------------- |
| Tea blooming in a clear glass cup     | pexels.com/videos, pixabay.com/videos | "tea steeping glass", "flower tea blooming"           | `videos/tea-glass.mp4`    |
| Hot water pouring into a glass teapot | pexels.com/videos                     | "pouring tea glass teapot", "hot water teapot"        | `videos/tea-pour.mp4`     |
| Hands holding a warm cup, morning     | pexels.com/videos                     | "hands holding tea cup morning", "warm cup hands"     | `videos/hands-cup.mp4`    |
| Red dates / goji / ginger close-up    | pexels.com/videos, pixabay.com/videos | "goji berries close up", "red dates", "ginger slices" | `videos/ingredients.mp4`  |
| White snow fungus (tremella) photo    | pexels.com, pixabay.com               | "tremella", "snow fungus", "white fungus"             | `photos/snow-fungus.webp` |

Check the license line on each download page before using it.

## Existing site images

Also used on the homepage (marked `isDemo: false` in `src/data/media.ts`): `brew-3.jpg`,
`hero-1.jpg`, `hero-2.jpg`, `ritual.jpg`, `journal-3.jpg` and the four `ing-*.jpg`
ingredient photos in `src/assets/`. They came with the original site; the client should
confirm they own them. The SkinFusion pouch photo is still missing
(`src/assets/skinfusion-pouch.jpg.asset.json` is a pointer to the old builder, not an image),
so the hero shows the tea cup photo in its place.
