/**
 * Smart-bin fill model.
 * We don't have fill sensors, so fill is estimated from time since the last pickup plus
 * citizen reports. Only a collector explicitly confirming a pickup resets it.
 */
export const BIN_BASE_FILL = 15; // % right after a pickup (residue)
export const BIN_FILL_PER_HOUR = 2.5; // ≈ 34 h from empty to full
export const BIN_FILLING_AT = 45;
export const BIN_PICKUP_AT = 75;
export const BIN_MANUAL_EMPTY_RADIUS_M = 100;

export type BinStatus = 'OK' | 'FILLING' | 'NEEDS_PICKUP' | 'DAMAGED';

export interface BinRecord {
  fillLevel?: number;
  fillUpdatedAt?: string;
  lastEmptiedAt?: string;
  damagedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Current estimated fill 0–100. */
export function estimateFill(bin: BinRecord, nowMs = Date.now()): number {
  const base = typeof bin.fillLevel === 'number' ? bin.fillLevel : BIN_BASE_FILL;
  const since = bin.fillUpdatedAt || bin.lastEmptiedAt || bin.updatedAt || bin.createdAt;
  const sampledAt = since ? Date.parse(since) : NaN;
  const hours = Number.isFinite(sampledAt) ? Math.max(0, (nowMs - sampledAt) / 3_600_000) : 0;
  return Math.max(0, Math.min(100, Math.round(base + hours * BIN_FILL_PER_HOUR)));
}

export function binStatus(bin: BinRecord, fill: number): BinStatus {
  const damaged = !!bin.damagedAt;
  if (damaged) return 'DAMAGED';
  if (fill >= BIN_PICKUP_AT) return 'NEEDS_PICKUP';
  if (fill >= BIN_FILLING_AT) return 'FILLING';
  return 'OK';
}
