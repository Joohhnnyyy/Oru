import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHARACTER, SAD_CHARACTER, TRUCK, characterForHealth } from '../content/media';

describe('guardian artwork', () => {
  it('uses supplied artwork files and switches at the sick health threshold', () => {
    for (const path of [...Object.values(CHARACTER), ...Object.values(SAD_CHARACTER), ...Object.values(TRUCK)]) {
      expect(existsSync(`public${path}`), path).toBe(true);
    }
    for (const id of Object.keys(CHARACTER) as (keyof typeof CHARACTER)[]) {
      expect(characterForHealth(id, 30)).toBe(SAD_CHARACTER[id] ?? CHARACTER[id]);
      expect(characterForHealth(id, 31)).toBe(CHARACTER[id]);
      expect(characterForHealth(id)).toBe(CHARACTER[id]);
    }
    expect(characterForHealth('dolphin', 0)).toBe(SAD_CHARACTER.dolphin);
    expect(characterForHealth('dolphin', 30.4)).toBe(SAD_CHARACTER.dolphin);
    expect(characterForHealth('dolphin', 30.5)).toBe(CHARACTER.dolphin);
  });
});
