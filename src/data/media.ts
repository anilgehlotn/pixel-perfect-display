// Every photo and video on the homepage, grouped by section. Components read media ONLY from
// this file, so replacing a demo clip or photo is a one-line change here.
//
// isDemo: true  = free stock media (Mixkit / Pexels) used for the client preview. Replace with
//                 the client's own, permitted content before launch (see MEDIA_CREDITS.md and
//                 "Before launch checklist" in CLAUDE.md).
// isDemo: false = images that were already part of the SkinFusion site.
//
// Videos: 720p H.264 MP4, no audio, 7-10 s, under 3 MB, each with a WebP poster frame.
// width/height are the file's real pixel size; they reserve space so nothing jumps.
import brew from "@/assets/brew-3.jpg";
import heroFlatlay from "@/assets/hero-1.jpg";
import heroCups from "@/assets/hero-2.jpg";
import ritual from "@/assets/ritual.jpg";
import jujube from "@/assets/ing-jujube.jpg";
import goji from "@/assets/ing-goji.jpg";
import snowFungus from "@/assets/ing-snowfungus.jpg";
import ginger from "@/assets/ing-ginger.jpg";
import evening from "@/assets/journal-3.jpg";

type Credit = { credit: string; source: string; license: string; isDemo: boolean };
export type MediaImage = Credit & {
  kind: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
};
export type MediaVideo = Credit & {
  kind: "video";
  src: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
};
export type Media = MediaImage | MediaVideo;

const MIXKIT = "Mixkit Free License (free for commercial use, no attribution required)";
const PEXELS = "Pexels License (free for commercial use, no attribution required)";
const OWN = "SkinFusion site asset";

const video = (
  name: string,
  alt: string,
  size: [number, number],
  credit: string,
  source: string,
): MediaVideo => ({
  kind: "video",
  src: `/media/demo/videos/${name}.mp4`,
  poster: `/media/demo/posters/${name}.webp`,
  alt,
  width: size[0],
  height: size[1],
  credit,
  source,
  license: MIXKIT,
  isDemo: true,
});

const photo = (
  name: string,
  alt: string,
  size: [number, number],
  credit: string,
  source: string,
): MediaImage => ({
  kind: "image",
  src: `/media/demo/photos/${name}.webp`,
  alt,
  width: size[0],
  height: size[1],
  credit,
  source,
  license: PEXELS,
  isDemo: true,
});

const own = (src: string, alt: string, size: [number, number]): MediaImage => ({
  kind: "image",
  src,
  alt,
  width: size[0],
  height: size[1],
  credit: "SkinFusion",
  source: "Existing site image (src/assets)",
  license: OWN,
  isDemo: false,
});

const LANDSCAPE: [number, number] = [1280, 720];
const PORTRAIT: [number, number] = [720, 1280];

/* Demo videos (Mixkit) */
const videos = {
  teaSteeping: video(
    "tea-steeping",
    "A tea bag steeping in a white cup of hot water",
    LANDSCAPE,
    "jibaroartz on Mixkit",
    "https://mixkit.co/free-stock-video/woman-preparing-a-cup-of-warm-tea-with-tea-bag-1511/",
  ),
  teaSteam: video(
    "tea-steam",
    "Steam rising from a cup on a wooden shelf in warm light",
    LANDSCAPE,
    "franklandgrave on Mixkit",
    "https://mixkit.co/free-stock-video/steaming-mug-808/",
  ),
  morningWindow: video(
    "morning-window",
    "A woman opening a window in soft morning light",
    LANDSCAPE,
    "edgarfernandez on Mixkit",
    "https://mixkit.co/free-stock-video/young-sleepy-woman-in-the-morning-opens-her-window-31401/",
  ),
  windowCalm: video(
    "window-calm",
    "A woman in a knit sweater resting by a window",
    LANDSCAPE,
    "Mixkit",
    "https://mixkit.co/free-stock-video/woman-looking-at-nature-through-the-window-42728/",
  ),
  skincareRoutine: video(
    "skincare-routine",
    "A woman in a bathrobe smoothing cream onto her face at a mirror",
    LANDSCAPE,
    "Mixkit",
    "https://mixkit.co/free-stock-video/a-young-woman-gently-rubs-cream-on-her-face-in-51177/",
  ),
  skincareCloseup: video(
    "skincare-closeup",
    "Close-up of a woman dabbing cream under her eyes",
    PORTRAIT,
    "Mixkit",
    "https://mixkit.co/free-stock-video/a-young-woman-delicately-applies-a-beauty-face-cream-to-51185/",
  ),
  leavesSunlight: video(
    "leaves-sunlight",
    "Sunlight shining through green leaves",
    LANDSCAPE,
    "edgarfernandez on Mixkit",
    "https://mixkit.co/free-stock-video/sunlight-passing-through-the-leaves-of-a-tree-34371/",
  ),
  flowersBreeze: video(
    "flowers-breeze",
    "White flowers moving in a light breeze against a blue sky",
    PORTRAIT,
    "rubenvelasco on Mixkit",
    "https://mixkit.co/free-stock-video/white-flowers-in-the-breeze-1187/",
  ),
};

/* Demo photos (Pexels) */
const photos = {
  windowTea: photo(
    "window-tea",
    "A woman in a cream cardigan holding a cup of tea by a tall window",
    [1000, 1500],
    "Вальдемар on Pexels",
    "https://www.pexels.com/photo/cross-legged-sitting-woman-holding-cup-of-tea-looking-through-window-11012771/",
  ),
  redDates: photo(
    "red-dates",
    "Dried red dates spread out to dry",
    [1000, 1500],
    "Towfiqu barbhuiya on Pexels",
    "https://www.pexels.com/photo/full-frame-of-drying-red-dates-12625117/",
  ),
  gingerLemon: photo(
    "ginger-lemon",
    "Fresh ginger root beside two lemons on a wooden table",
    [1400, 934],
    "Angele J on Pexels",
    "https://www.pexels.com/photo/ginger-and-2-lemon-fruit-128403/",
  ),
  glassTeapot: photo(
    "glass-teapot",
    "A glass teapot and two glass cups of golden tea",
    [1400, 934],
    "Teejay on Pexels",
    "https://www.pexels.com/photo/clear-glass-teapot-set-1362537/",
  ),
  teacupMint: photo(
    "teacup-mint",
    "A glass cup of amber tea on a linen mat with fresh leaves",
    [1400, 964],
    "Mareefe on Pexels",
    "https://www.pexels.com/photo/peppermint-tea-on-teacup-1417945/",
  ),
  herbalFlatlay: photo(
    "herbal-flatlay",
    "A glass bowl of herbal tea with sprigs of thyme on a white table",
    [1000, 1500],
    "Olena Bohovyk on Pexels",
    "https://www.pexels.com/photo/clear-glass-bowl-with-herbs-and-tea-3604314/",
  ),
  bathroomShelf: photo(
    "bathroom-shelf",
    "Skincare bottles on a wooden tray beside a white basin and linen towel",
    [1400, 934],
    "Karola G on Pexels",
    "https://www.pexels.com/photo/set-of-skin-care-products-in-contemporary-bathroom-4239013/",
  ),
  bathroomSink: photo(
    "bathroom-sink",
    "Amber skincare bottles and a soap bar on a bathroom counter",
    [1000, 1500],
    "Monstera Production on Pexels",
    "https://www.pexels.com/photo/sink-with-skincare-products-in-bathroom-6781117/",
  ),
  handsGlass: photo(
    "hands-glass",
    "Hands holding a small glass of tea",
    [1000, 1500],
    "Vlada Karpovich on Pexels",
    "https://www.pexels.com/photo/a-person-holding-a-cup-of-tea-6802967/",
  ),
  handsCup: photo(
    "hands-cup",
    "Hands in a knit sweater holding a cup of tea",
    [1000, 1500],
    "Teona Swift on Pexels",
    "https://www.pexels.com/photo/anonymous-woman-drinking-cup-of-hot-tea-at-home-6874185/",
  ),
};

/* Existing SkinFusion images */
const site = {
  brew: own(brew, "A glass cup of golden tea with whole jujubes and goji berries", [1024, 1024]),
  flatlay: own(
    heroFlatlay,
    "Glass cups of golden tea with jujubes, snow fungus, goji berries and pink blossoms",
    [1920, 1088],
  ),
  cups: own(heroCups, "Hands pouring golden tea from a glass teapot", [1920, 1088]),
  ritual: own(ritual, "A woman in bed holding a glass cup of golden tea", [1024, 1280]),
  evening: own(evening, "A teapot, candle and open notebook by a window at sunset", [1280, 960]),
  jujube: own(jujube, "Whole dried jujubes in a ceramic bowl", [1024, 1024]),
  goji: own(goji, "Dried goji berries scattered on marble", [1024, 1024]),
  snowFungus: own(snowFungus, "Dried snow fungus on linen", [1024, 1024]),
  ginger: own(ginger, "Sliced fresh ginger on a wooden board", [1024, 1024]),
};

export const media = {
  hero: {
    // Replace with the SkinFusion pouch photo when it arrives (src/assets/skinfusion-pouch).
    centerpiece: site.brew,
    orbit: [site.jujube, site.goji, site.snowFungus, site.ginger],
    video: videos.teaSteam,
  },
  // Product row: keyed by Shopify product handle. `video` plays on hover (desktop) or in view
  // (phones); `fallback` shows when the product has no image yet.
  products: {
    "skin-glow-tea": { video: videos.skincareCloseup, fallback: site.brew },
    "calm-night": { video: videos.windowCalm, fallback: photos.windowTea },
    "gut-balance": { video: videos.leavesSunlight, fallback: photos.gingerLemon },
    "glow-bundle": { video: videos.morningWindow, fallback: photos.herbalFlatlay },
  } as Record<string, { video: MediaVideo; fallback: MediaImage } | undefined>,
  productDefault: { video: videos.teaSteeping, fallback: site.brew },
  bundle: [photos.glassTeapot, site.jujube, photos.handsCup, photos.bathroomShelf],
  howItWorks: { video: videos.teaSteeping },
  tcm: { thumbnail: site.cups, video: videos.teaSteeping },
  stories: {
    edgeStart: site.goji,
    portraitA: photos.windowTea,
    stadium: photos.teacupMint,
    videoA: videos.skincareRoutine,
    portraitB: photos.handsGlass,
    videoB: videos.flowersBreeze,
    portraitC: site.ritual,
    videoC: videos.morningWindow,
    edgeEnd: site.snowFungus,
  },
  sourcing: photos.redDates,
  closing: photos.bathroomSink,
  closingSecondary: site.evening,
  flatlay: site.flatlay,
} as const;

/** Every demo item, for MEDIA_CREDITS.md and the launch checklist. */
export const demoMedia: Media[] = [...Object.values(videos), ...Object.values(photos)];
