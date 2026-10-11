export const CHARACTERS = {
  buddy: require('../../assets/characters/buddy.png'),
  dolphin: require('../../assets/characters/dolphin.png'),
  turtle: require('../../assets/characters/turtle.png'),
  leopard: require('../../assets/characters/leopard.png'),
  sparrow: require('../../assets/characters/sparrow.png'),
  bustard: require('../../assets/characters/bustard.png'),
  crane: require('../../assets/characters/crane.png'),
  truck: require('../../assets/characters/truck.png'),
} as const;

export type CharacterId = keyof typeof CHARACTERS;

export const SAD_CHARACTERS: Partial<Record<CharacterId, number>> = {
  buddy: require('../../assets/characters/Sad_buddy.png'),
  dolphin: require('../../assets/characters/Sad_dolphine.png'),
  turtle: require('../../assets/characters/Sad_turtle.png'),
  bustard: require('../../assets/characters/sad_bustard.png'),
  crane: require('../../assets/characters/Sad_crane.png'),
};

/** Matches the territory rules' sick threshold. Missing variants keep normal art. */
export function characterForHealth(id: CharacterId, health?: number | null): number {
  return health != null && Math.round(health) <= 30
    ? SAD_CHARACTERS[id] ?? CHARACTERS[id]
    : CHARACTERS[id];
}

export interface GuardianInfo {
  id: CharacterId;
  name: string;
  species: string;
  role: string;
  mission: string;
  bg: string;
  accent: string;
}

export const GUARDIANS: GuardianInfo[] = [
  {
    id: 'dolphin',
    name: 'Dolphin',
    species: 'Ganges River Dolphin',
    role: 'Water & River Guardian',
    mission: 'Yamuna Riverbank & Watershed Care',
    bg: '#E0F2FE',
    accent: '#0284C7',
  },
  {
    id: 'turtle',
    name: 'Turtle',
    species: 'Indian Flapshell Turtle',
    role: 'Zero Waste Guardian',
    mission: 'Household Wet & Dry Sorting',
    bg: '#DCFCE7',
    accent: '#16A34A',
  },
  {
    id: 'leopard',
    name: 'Snow Leopard',
    species: 'Himalayan Snow Leopard',
    role: 'Cool Canopy Guardian',
    mission: 'Urban Heat Island Reduction',
    bg: '#EDE9FE',
    accent: '#7C3AED',
  },
  {
    id: 'sparrow',
    name: 'Sparrow',
    species: 'House Sparrow',
    role: 'Urban Habitat Guardian',
    mission: 'Terrace Gardens & Green Balconies',
    bg: '#FFE4E6',
    accent: '#E11D48',
  },
  {
    id: 'bustard',
    name: 'Bustard',
    species: 'Great Indian Bustard',
    role: 'Clean Energy Guardian',
    mission: 'Solar Adoption & Efficiency',
    bg: '#FEF3C7',
    accent: '#D97706',
  },
  {
    id: 'crane',
    name: 'Crane',
    species: 'Sarus Crane',
    role: 'Wetland Sanctuary Guardian',
    mission: 'Marshland & Pond Restoration',
    bg: '#CCFBF1',
    accent: '#0D9488',
  },
];
