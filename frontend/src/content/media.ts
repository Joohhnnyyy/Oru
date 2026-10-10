/**
 * Every image and video slot on the landing page, in one place.
 *
 * To swap in your own media:
 *   1. Put the file in `frontend/public/media/` (videos: `public/media/videos/`).
 *   2. Change the path below. For a video slot, set `video` to the .mp4/.webm path;
 *      the `poster` shows until it plays (and for reduced-motion visitors).
 * Slots with `video: null` show the poster with a "Video coming soon" tag.
 */

export interface MediaSlot {
  /** Still image shown immediately and as the video poster. */
  poster: string;
  /** Muted, looping video. `null` = not supplied yet (placeholder shown). */
  video: string | null;
}

export type CharacterId = 'buddy' | 'leopard' | 'bustard' | 'dolphin' | 'crane' | 'turtle' | 'sparrow';

/** Transparent cut-outs used for floating / tilting characters. */
export const CHARACTER: Record<CharacterId, string> = {
  buddy: '/media/characters/buddy.webp',
  leopard: '/media/characters/leopard.webp',
  bustard: '/media/characters/bustard.webp',
  dolphin: '/media/characters/dolphin.webp',
  crane: '/media/characters/crane.webp',
  turtle: '/media/characters/turtle.webp',
  sparrow: '/media/characters/sparrow.webp',
};

/** The recycling truck (loader, scroll-progress road). */
export const TRUCK = {
  side: '/media/characters/truck-side.webp',
  front: '/media/characters/truck-front34.webp',
  hero: '/media/characters/truck-hero.webp',
};

/** Painted habitat scenes (with backgrounds) for cards and bubbles. */
export const SCENE: Record<Exclude<CharacterId, 'buddy'> | 'plaza' | 'plazaSmall', string> = {
  plaza: '/media/scenes/plaza.webp',
  plazaSmall: '/media/scenes/plaza-960.webp',
  leopard: '/media/scenes/leopard.webp',
  bustard: '/media/scenes/bustard.webp',
  dolphin: '/media/scenes/dolphin.webp',
  crane: '/media/scenes/crane.webp',
  turtle: '/media/scenes/turtle.webp',
  sparrow: '/media/scenes/sparrow.webp',
};

export const BRAND = {
  wordmark: '/media/brand/wordmark.webp',
  /** Opaque sticker version for dark backgrounds (hero), see scripts/art/6_wordmark_on_dark.py. */
  wordmarkOnDark: '/media/brand/wordmark-on-dark.webp',
  /** 2x upscale for the giant footer logo. TODO: replace with a high-res/SVG export of the logo. */
  wordmarkLarge: '/media/brand/wordmark-large.webp',
  icon: '/icons/icon-192.png',
};

/** Hero highlight cards (bottom-right carousel). */
export const HIGHLIGHTS: { id: 'n1' | 'n2' | 'n3'; href: string; media: MediaSlot }[] = [
  { id: 'n1', href: '/how-it-works', media: { poster: SCENE.sparrow, video: null } },
  { id: 'n2', href: '/guardians', media: { poster: SCENE.leopard, video: null } },
  { id: 'n3', href: '/play', media: { poster: SCENE.dolphin, video: null } },
];

/** Large split cards. */
export const SPLIT_MEDIA: Record<'day1', MediaSlot> = {
  day1: { poster: SCENE.plaza, video: null },
};
