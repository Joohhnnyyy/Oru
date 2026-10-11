/**
 * Territory guardians shown on the map.
 * Each H3 territory has a habitat mascot (see @saafsafari/shared MASCOT_REGISTRY); the app
 * presents it through one of its six illustrated guardians with the matching civic mission.
 */
export type GuardianId = 'dolphin' | 'turtle' | 'leopard' | 'sparrow' | 'bustard' | 'crane';

export interface GuardianInfo {
  id: GuardianId;
  name: string;
  role: string;
}

export const GUARDIANS: Record<GuardianId, GuardianInfo> = {
  dolphin: { id: 'dolphin', name: 'Dolphin', role: 'Water & River Guardian' },
  turtle: { id: 'turtle', name: 'Turtle', role: 'Zero Waste Guardian' },
  leopard: { id: 'leopard', name: 'Snow Leopard', role: 'Cool Canopy Guardian' },
  sparrow: { id: 'sparrow', name: 'Sparrow', role: 'Urban Habitat Guardian' },
  bustard: { id: 'bustard', name: 'Bustard', role: 'Clean Energy Guardian' },
  crane: { id: 'crane', name: 'Crane', role: 'Wetland Sanctuary Guardian' },
};

/** Habitat mascot → guardian with the closest mission. */
const GUARDIAN_FOR_MASCOT: Record<string, GuardianId> = {
  blackbuck: 'dolphin', // Yamuna floodplains & wetlands
  peafowl: 'sparrow', // urban parks & green belt
  macaque: 'turtle', // dense markets → zero-waste
  nilgai: 'leopard', // ridge & forest corridors → canopy
  jackal: 'bustard', // semi-arid outskirts → clean energy
};

export function guardianFor(mascot: string | undefined): GuardianInfo {
  return GUARDIANS[(mascot && GUARDIAN_FOR_MASCOT[mascot]) || 'crane'];
}
