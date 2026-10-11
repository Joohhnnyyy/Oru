import type { CivicActionType } from './credits';

export interface TaskItem {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  actionType: CivicActionType;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  targetCount: number;
  rewardGC: number;
  rewardXP: number;
  isTerritoryGoal?: boolean;
}

/**
 * 32-bit FNV-1a hash algorithm converting string seed into integer
 */
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 seeded pseudo-random number generator
 * Returns a function that outputs deterministic numbers in [0, 1)
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Predefined pools of civic tasks
const HABIT_TASKS = [
  {
    titleEn: 'Segregate Kitchen Wet Waste',
    titleHi: 'रसोई का गीला कचरा अलग करें',
    descEn: 'Keep fruit peels and food scraps separate from plastic.',
    descHi: 'सब्जियों और फलों के छिलकों को प्लास्टिक से अलग रखें।',
    actionType: 'HABIT_SEGREGATION' as CivicActionType,
    rewardGC: 5,
    rewardXP: 10,
  },
  {
    titleEn: 'Rinse & Dry Recyclables',
    titleHi: 'प्लास्टिक पैकेट धोकर सुखाएं',
    descEn: 'Rinse milk pouches and food wrappers before disposal.',
    descHi: 'दूध की थैली और प्लास्टिक रैपर को धोकर ही कूड़ेदान में डालें।',
    actionType: 'HABIT_SEGREGATION' as CivicActionType,
    rewardGC: 5,
    rewardXP: 10,
  },
  {
    titleEn: 'Home Composting Check-in',
    titleHi: 'घरेलू खाद चेक-इन',
    descEn: 'Add vegetable waste to your household compost pot.',
    descHi: 'घर के गीले कचरे को खाद वाले बर्तन में डालें।',
    actionType: 'HABIT_SEGREGATION' as CivicActionType,
    rewardGC: 10,
    rewardXP: 15,
  },
];

const STATIC_BIN_TASKS = [
  {
    titleEn: 'Scan a Neighborhood Smart Dustbin',
    titleHi: 'मोहल्ले का स्मार्ट डस्टबिन स्कैन करें',
    descEn: 'Dispose dry waste in any QR-tagged municipal bin.',
    descHi: 'किसी भी क्यूआर कोड वाले नगर निगम डस्टबिन में सूखा कचरा डालें।',
    actionType: 'STATIC_BIN_SCAN' as CivicActionType,
    rewardGC: 10,
    rewardXP: 25,
  },
  {
    titleEn: 'Park Cleanup Bin Scan',
    titleHi: 'पार्क के डस्टबिन पर स्कैन करें',
    descEn: 'Dispose waste responsibly during your morning walk.',
    descHi: 'सुबह की सैर के दौरान पार्क के डस्टबिन का उपयोग करें।',
    actionType: 'STATIC_BIN_SCAN' as CivicActionType,
    rewardGC: 15,
    rewardXP: 30,
  },
];

const T2_HANDOVER_TASKS = [
  {
    titleEn: 'Handover Waste to Municipal Truck',
    titleHi: 'सफाई गाड़ी को सूखा और गीला कचरा दें',
    descEn: 'Scan the collector rotating QR code on the collection vehicle.',
    descHi: 'कचरा उठाने वाली गाड़ी पर लगा डिजिटल क्यूआर कोड स्कैन करें।',
    actionType: 'TRUCK_COLLECTOR_SCAN' as CivicActionType,
    rewardGC: 25,
    rewardXP: 50,
  },
  {
    titleEn: 'E-Waste Drop-off',
    titleHi: 'पुराना इलेक्ट्रॉनिक कचरा जमा करें',
    descEn: 'Drop dead batteries, chargers, or cables at an e-waste hub.',
    descHi: 'पुरानी बैटरी या खराब चार्जर ई-कचरा केंद्र में जमा करें।',
    actionType: 'E_WASTE_DROPOFF' as CivicActionType,
    rewardGC: 50,
    rewardXP: 100,
  },
];

/**
 * Deterministically generates exactly 3 daily tasks for a user on a given date (YYYY-MM-DD)
 */
export function generateDailyTaskBoard(userId: string, dateStr: string): TaskItem[] {
  const seed = hashString(`${userId}:daily:${dateStr}`);
  const prng = createMulberry32(seed);

  const habitIndex = Math.floor(prng() * HABIT_TASKS.length);
  const binIndex = Math.floor(prng() * STATIC_BIN_TASKS.length);
  const t2Index = Math.floor(prng() * T2_HANDOVER_TASKS.length);

  const habit = HABIT_TASKS[habitIndex];
  const bin = STATIC_BIN_TASKS[binIndex];
  const t2 = T2_HANDOVER_TASKS[t2Index];

  return [
    {
      id: `daily_${dateStr}_h_${habitIndex}`,
      period: 'daily',
      actionType: habit.actionType,
      titleEn: habit.titleEn,
      titleHi: habit.titleHi,
      descriptionEn: habit.descEn,
      descriptionHi: habit.descHi,
      targetCount: 1,
      rewardGC: habit.rewardGC,
      rewardXP: habit.rewardXP,
    },
    {
      id: `daily_${dateStr}_b_${binIndex}`,
      period: 'daily',
      actionType: bin.actionType,
      titleEn: bin.titleEn,
      titleHi: bin.titleHi,
      descriptionEn: bin.descEn,
      descriptionHi: bin.descHi,
      targetCount: 1,
      rewardGC: bin.rewardGC,
      rewardXP: bin.rewardXP,
    },
    {
      id: `daily_${dateStr}_t2_${t2Index}`,
      period: 'daily',
      actionType: t2.actionType,
      titleEn: t2.titleEn,
      titleHi: t2.titleHi,
      descriptionEn: t2.descEn,
      descriptionHi: t2.descHi,
      targetCount: 1,
      rewardGC: t2.rewardGC,
      rewardXP: t2.rewardXP,
    },
  ];
}

/**
 * Deterministically generates 3 weekly challenge tasks for a user
 */
export function generateWeeklyTaskBoard(userId: string, weekStr: string): TaskItem[] {
  const seed = hashString(`${userId}:weekly:${weekStr}`);
  const prng = createMulberry32(seed);

  return [
    {
      id: `weekly_${weekStr}_habit_streak`,
      period: 'weekly',
      actionType: 'HABIT_SEGREGATION',
      titleEn: '5-Day Segregation Streak',
      titleHi: '5 दिन लगातार कचरा अलगाव',
      descriptionEn: 'Complete home segregation check-in on 5 distinct days.',
      descriptionHi: 'सप्ताह में 5 दिन घर पर कचरा अलग करने का नियम पूरा करें।',
      targetCount: 5,
      rewardGC: 50,
      rewardXP: 100,
    },
    {
      id: `weekly_${weekStr}_bin_explorer`,
      period: 'weekly',
      actionType: 'STATIC_BIN_SCAN',
      titleEn: 'Urban Dustbin Explorer',
      titleHi: 'डस्टबिन खोजकर्ता',
      descriptionEn: 'Scan 3 different public dustbins across Delhi.',
      descriptionHi: 'दिल्ली के 3 अलग-अलग सार्वजनिक डस्टबिन पर स्कैन करें।',
      targetCount: 3,
      rewardGC: 40,
      rewardXP: 75,
    },
    {
      id: `weekly_${weekStr}_truck_handovers`,
      period: 'weekly',
      actionType: 'TRUCK_COLLECTOR_SCAN',
      titleEn: 'Collection Truck Champion',
      titleHi: 'सफाई गाड़ी सहयोगी',
      descriptionEn: 'Hand over waste to municipal vehicle collectors 3 times.',
      descriptionHi: 'सफाई वाहन कर्मचारियों को 3 बार कचरा सौंपें।',
      targetCount: 3,
      rewardGC: 80,
      rewardXP: 150,
    },
  ];
}

/**
 * Deterministically generates monthly challenges including a collective territory goal
 */
export function generateMonthlyTaskBoard(
  userId: string,
  monthStr: string,
  territoryName: string = 'Your Territory',
): TaskItem[] {
  return [
    {
      id: `monthly_${monthStr}_ewaste_warrior`,
      period: 'monthly',
      actionType: 'E_WASTE_DROPOFF',
      titleEn: 'E-Waste Champion',
      titleHi: 'ई-कचरा विजेता',
      descriptionEn: 'Properly dispose of 2 obsolete electronics or batteries at verified centers.',
      descriptionHi: '2 पुराने इलेक्ट्रॉनिक सामान या बैटरी प्रमाणित केंद्र पर जमा करें।',
      targetCount: 2,
      rewardGC: 120,
      rewardXP: 250,
    },
    {
      id: `monthly_${monthStr}_cleanup_hero`,
      period: 'monthly',
      actionType: 'COMMUNITY_CLEANUP_PROOF',
      titleEn: 'Community Cleanup Hero',
      titleHi: 'सामुदायिक सफाई नायक',
      descriptionEn: 'Submit AI-verified proof of a local community or park cleanup.',
      descriptionHi: 'पार्क या मोहल्ले की सफाई की तस्वीर ऐप पर अपलोड करें।',
      targetCount: 1,
      rewardGC: 150,
      rewardXP: 300,
    },
    {
      id: `monthly_${monthStr}_territory_thrive`,
      period: 'monthly',
      actionType: 'HABIT_SEGREGATION',
      isTerritoryGoal: true,
      titleEn: `Elevate ${territoryName} Health`,
      titleHi: `${territoryName} का स्वास्थ्य सुधारें`,
      descriptionEn: `Contribute to collective civic actions to lift ${territoryName} into Thriving status (>60 health).`,
      descriptionHi: `अपने मोहल्ले ${territoryName} को 'स्वस्थ' श्रेणी में लाने के लिए सामूहिक योगदान दें।`,
      targetCount: 10,
      rewardGC: 200,
      rewardXP: 400,
    },
  ];
}
