export const CHAPTERS = [
  { id: 'why', key: 'why' },
  { id: 'day-1', key: 'day1' },
  { id: 'guardians', key: 'guardians' },
  { id: 'growth', key: 'growth' },
  { id: 'places', key: 'places' },
  { id: 'impact', key: 'impact' },
  { id: 'next', key: 'next' },
] as const;

export type ChapterKey = (typeof CHAPTERS)[number]['key'];
export const CHAPTER_IDS: readonly string[] = CHAPTERS.map((c) => c.id);
