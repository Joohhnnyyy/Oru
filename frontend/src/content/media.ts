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
  buddy: '/media/characters/buddy.png',
  leopard: '/media/characters/leopard.png',
  bustard: '/media/characters/bustard.png',
  dolphin: '/media/characters/dolphin.png',
  crane: '/media/characters/crane.webp',
  turtle: '/media/characters/turtle.png',
  sparrow: '/media/characters/sparrow.png',
};

/** Supplied sad artwork; guardians without a variant keep their normal artwork. */
export const SAD_CHARACTER: Partial<Record<CharacterId, string>> = {
  buddy: '/media/characters/Sad_buddy.png',
  bustard: '/media/characters/sad_bustard.png',
  dolphin: '/media/characters/Sad_dolphine.png',
  crane: '/media/characters/Sad_crane.png',
  turtle: '/media/characters/Sad_turtle.png',
};

/** Matches the territory rules' sick threshold (rounded health <= 30). */
export function characterForHealth(id: CharacterId, health?: number): string {
  return health !== undefined && Math.round(health) <= 30
    ? SAD_CHARACTER[id] ?? CHARACTER[id]
    : CHARACTER[id];
}

/** The recycling truck (loader, scroll-progress road). */
export const TRUCK = {
  side: '/media/characters/truck-side.webp',
  front: '/media/characters/truck-front34.webp',
  hero: '/media/characters/truck-hero.png',
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
  /** High-resolution full-color logo. */
  wordmark: '/media/brand/oru-color.png',
  /** High-resolution full-color logo for dark backgrounds (hero). */
  wordmarkOnDark: '/media/brand/oru-color.png',
  /** High-resolution full-color logo for the footer. */
  wordmarkLarge: '/media/brand/oru-color.png',
  icon: '/icons/oru-nav.png',
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
