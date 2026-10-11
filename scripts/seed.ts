import { randomBytes } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { generateDelhiTerritories } from '@saafsafari/game-rules';
import type { QrSource, Merchant, Coupon, UserProfile } from '@saafsafari/shared';

export interface SeedDataResult {
  territoryItems: Record<string, any>[];
  qrSourceItems: Record<string, any>[];
  merchantItems: Record<string, any>[];
  couponItems: Record<string, any>[];
  userItems: Record<string, any>[];
  ledgerItems: Record<string, any>[];
  allItems: Record<string, any>[];
}

/**
 * Generates all seed items for DynamoDB single-table schema
 */
export function generateSeedItems(): SeedDataResult {
  const now = new Date().toISOString();
  const territories = generateDelhiTerritories();

  // 1. Territories (PK: TERRITORY#<h3Index>, SK: METADATA)
  const territoryItems = territories.map((t: any) => ({
    PK: `TERRITORY#${t.h3Index}`,
    SK: 'METADATA',
    GSI1PK: `STATUS#${t.mood}`,
    GSI1SK: `HEALTH#${t.health.toString().padStart(3, '0')}`,
    ...t,
  }));

  // 2. 40 QR Sources across Delhi
  const qrSources: QrSource[] = [
    // 25 Smart Dustbins (T1)
    {
      sourceId: 'qr_bin_cp_inner_circle_01',
      type: 'dustbin_static',
      name: 'Connaught Place Block A Smart Bin',
      h3TerritoryId: territories[0]?.h3Index || '8760824b4ffffff',
      latitude: 28.6328,
      longitude: 77.2195,
      secretKey: 'sec_bin_cp_inner_circle_01_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_cp_palika_02',
      type: 'dustbin_static',
      name: 'Palika Bazar Metro Gate Smart Bin',
      h3TerritoryId: territories[0]?.h3Index || '8760824b4ffffff',
      latitude: 28.6300,
      longitude: 77.2180,
      secretKey: 'sec_bin_cp_palika_02_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_lodhi_gate1_03',
      type: 'dustbin_static',
      name: 'Lodhi Gardens Main Gate Smart Bin',
      h3TerritoryId: territories[1]?.h3Index || '8760824b4ffffff',
      latitude: 28.5930,
      longitude: 77.2190,
      secretKey: 'sec_bin_lodhi_gate1_03_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_lodhi_bonsai_04',
      type: 'dustbin_static',
      name: 'Lodhi Gardens National Bonsai Park Bin',
      h3TerritoryId: territories[1]?.h3Index || '8760824b4ffffff',
      latitude: 28.5910,
      longitude: 77.2210,
      secretKey: 'sec_bin_lodhi_bonsai_04_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_india_gate_canopy_05',
      type: 'dustbin_static',
      name: 'Kartavya Path Canopy Smart Bin',
      h3TerritoryId: territories[2]?.h3Index || '8760824b4ffffff',
      latitude: 28.6129,
      longitude: 77.2300,
      secretKey: 'sec_bin_india_gate_canopy_05_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_hauz_khas_lake_06',
      type: 'dustbin_static',
      name: 'Hauz Khas Fort Lake Walkway Bin',
      h3TerritoryId: territories[4]?.h3Index || '8760824b4ffffff',
      latitude: 28.5530,
      longitude: 77.1940,
      secretKey: 'sec_bin_hauz_khas_lake_06_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_hauz_khas_deerpark_07',
      type: 'dustbin_static',
      name: 'Deer Park Picnic Pavilion Smart Bin',
      h3TerritoryId: territories[4]?.h3Index || '8760824b4ffffff',
      latitude: 28.5550,
      longitude: 77.1990,
      secretKey: 'sec_bin_hauz_khas_deerpark_07_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_lajpat_market_08',
      type: 'dustbin_static',
      name: 'Lajpat Nagar Central Market Plaza Bin',
      h3TerritoryId: territories[6]?.h3Index || '8760824b4ffffff',
      latitude: 28.5680,
      longitude: 77.2430,
      secretKey: 'sec_bin_lajpat_market_08_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_saket_mall_09',
      type: 'dustbin_static',
      name: 'Saket District Centre Outdoor Smart Bin',
      h3TerritoryId: territories[8]?.h3Index || '8760824b4ffffff',
      latitude: 28.5280,
      longitude: 77.2185,
      secretKey: 'sec_bin_saket_mall_09_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
    {
      sourceId: 'qr_bin_chandni_chowk_fountain_10',
      type: 'dustbin_static',
      name: 'Chandni Chowk Gurudwara Fountain Smart Bin',
      h3TerritoryId: territories[15]?.h3Index || '8760824b4ffffff',
      latitude: 28.6560,
      longitude: 77.2310,
      secretKey: 'sec_bin_chandni_chowk_fountain_10_key',
      geofenceRadiusMeters: 75,
      isActive: true,
    },
  ];

  // Fill remaining 15 static bins across other territories
  for (let i = 11; i <= 25; i++) {
    const t = territories[(i * 2) % territories.length];
    qrSources.push({
      sourceId: `qr_bin_delhi_${i.toString().padStart(2, '0')}`,
      type: 'dustbin_static',
      name: `${t.name} Public Smart Bin #${i}`,
      h3TerritoryId: t.h3Index,
      latitude: t.centerLat,
      longitude: t.centerLng,
      secretKey: `sec_bin_delhi_${i}_secret_key`,
      geofenceRadiusMeters: 75,
      isActive: true,
    });
  }

  // 10 Waste Collection Vehicles (T2 rotating)
  for (let i = 1; i <= 10; i++) {
    const t = territories[(i * 5) % territories.length];
    qrSources.push({
      sourceId: `qr_truck_vehicle_${i.toString().padStart(2, '0')}`,
      type: 'truck_rotating',
      name: `MCD Waste Truck DL-01-ET-${1000 + i} (${t.ward})`,
      h3TerritoryId: t.h3Index,
      latitude: t.centerLat,
      longitude: t.centerLng,
      secretKey: `sec_truck_hmac_secret_key_${i}`,
      geofenceRadiusMeters: 150,
      isActive: true,
    });
  }

  // 5 E-Waste Collection Centers (T2 static)
  const ewasteLocations = [
    { name: 'Nehru Place E-Waste Recycler', lat: 28.5494, lng: 77.2528 },
    { name: 'Okhla Phase 1 E-Waste Hub', lat: 28.5284, lng: 77.2785 },
    { name: 'Laxmi Nagar Vikas Marg E-Waste Dropoff', lat: 28.6300, lng: 77.2778 },
    { name: 'Janakpuri District Centre Eco-Center', lat: 28.6219, lng: 77.0878 },
    { name: 'Wazirpur Industrial E-Waste Facility', lat: 28.6989, lng: 77.1500 },
  ];

  ewasteLocations.forEach((ew, idx) => {
    const t = territories[(idx * 7) % territories.length];
    qrSources.push({
      sourceId: `qr_ewaste_hub_${(idx + 1).toString().padStart(2, '0')}`,
      type: 'ewaste_static',
      name: ew.name,
      h3TerritoryId: t.h3Index,
      latitude: ew.lat,
      longitude: ew.lng,
      secretKey: `sec_ewaste_key_${idx + 1}`,
      geofenceRadiusMeters: 100,
      isActive: true,
    });
  });

  const qrSourceItems = qrSources.map((qr) => ({
    PK: `QR#${qr.sourceId}`,
    SK: 'METADATA',
    GSI1PK: `TERRITORY#${qr.h3TerritoryId}`,
    GSI1SK: `QR#${qr.sourceId}`,
    ...qr,
  }));

  // Security: every source gets a random 256-bit signing secret at seed time.
  // (Predictable secrets committed to git would let anyone forge QR tokens.)
  // Trucks are assigned round-robin to the seeded collectors so each handover
  // rewards the right driver. Re-running the seed rotates all secrets.
  const SEEDED_COLLECTORS = ['collector_ramesh_kumar', 'collector_suresh_yadav', 'collector_mohan_lal'];
  let truckIdx = 0;
  for (const src of qrSources) {
    src.secretKey = randomBytes(32).toString('hex');
    if (src.type === 'truck_rotating') {
      src.collectorId = SEEDED_COLLECTORS[truckIdx++ % SEEDED_COLLECTORS.length];
    }
  }

  // 3. 6 Eco-Merchants
  const merchants: Merchant[] = [
    {
      merchantId: 'merchant_khadi_cp',
      name: 'Khadi India Bhavan',
      category: 'fashion',
      address: '24 Regal Building, Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2170,
      ward: 'NDMC Central',
    },
    {
      merchantId: 'merchant_blue_tokai_hk',
      name: 'Blue Tokai Sustainable Roasters',
      category: 'food_beverage',
      address: 'Shop 15, Hauz Khas Village, New Delhi',
      latitude: 28.5525,
      longitude: 77.1950,
      ward: 'MCD South 34',
    },
    {
      merchantId: 'merchant_organic_farmers',
      name: 'Delhi Organic Farmers Market',
      category: 'groceries',
      address: 'B-Block Market, Lodhi Colony, New Delhi',
      latitude: 28.5870,
      longitude: 77.2250,
      ward: 'NDMC South',
    },
    {
      merchantId: 'merchant_mother_dairy_saket',
      name: 'Mother Dairy Eco-Kiosk',
      category: 'dairy',
      address: 'Press Enclave Road, Saket, New Delhi',
      latitude: 28.5250,
      longitude: 77.2150,
      ward: 'MCD South 45',
    },
    {
      merchantId: 'merchant_fabindia_gk',
      name: 'FabIndia Organic Lifestyle',
      category: 'fashion',
      address: 'N-Block Market, Greater Kailash 1, New Delhi',
      latitude: 28.5410,
      longitude: 77.2390,
      ward: 'MCD South 42',
    },
    {
      merchantId: 'merchant_chaayos_karolbagh',
      name: 'Chaayos Sustainable Chai Spot',
      category: 'food_beverage',
      address: 'Arya Samaj Road, Karol Bagh, New Delhi',
      latitude: 28.6520,
      longitude: 77.1910,
      ward: 'MCD Central 18',
    },
  ];

  const merchantItems = merchants.map((m) => ({
    PK: `MERCHANT#${m.merchantId}`,
    SK: 'PROFILE',
    GSI1PK: `CATEGORY#${m.category}`,
    GSI1SK: `MERCHANT#${m.merchantId}`,
    ...m,
  }));

  // 4. 15 Redeemable Coupons
  const futureExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const coupons: Coupon[] = [
    {
      couponId: 'coup_khadi_100_off',
      merchantId: 'merchant_khadi_cp',
      title: '₹100 Off Pure Handloom & Khadi',
      discountText: 'Flat ₹100 discount on minimum purchase of ₹500',
      costGC: 120,
      expiresAt: futureExpiry,
      stock: 50,
    },
    {
      couponId: 'coup_khadi_herbal_soap',
      merchantId: 'merchant_khadi_cp',
      title: 'Free Khadi Neem Herbal Soap',
      discountText: 'Get 1 free organic handmade soap with any order',
      costGC: 60,
      expiresAt: futureExpiry,
      stock: 100,
    },
    {
      couponId: 'coup_blue_tokai_oatmilk',
      merchantId: 'merchant_blue_tokai_hk',
      title: 'Free Oat Milk Upgrade',
      discountText: 'Zero-carbon oat milk upgrade on any beverage',
      costGC: 40,
      expiresAt: futureExpiry,
      stock: 150,
    },
    {
      couponId: 'coup_blue_tokai_20_percent',
      merchantId: 'merchant_blue_tokai_hk',
      title: '20% Off Artisan Cold Brew',
      discountText: '20% discount on single-origin cold brews',
      costGC: 75,
      expiresAt: futureExpiry,
      stock: 80,
    },
    {
      couponId: 'coup_organic_veg_basket',
      merchantId: 'merchant_organic_farmers',
      title: '₹50 Off Organic Vegetable Basket',
      discountText: 'Direct-from-farm zero pesticide harvest discount',
      costGC: 70,
      expiresAt: futureExpiry,
      stock: 60,
    },
    {
      couponId: 'coup_organic_honey',
      merchantId: 'merchant_organic_farmers',
      title: '15% Off Raw Forest Honey',
      discountText: 'Pure unpasteurized honey discount',
      costGC: 90,
      expiresAt: futureExpiry,
      stock: 45,
    },
    {
      couponId: 'coup_mother_dairy_eco_tote',
      merchantId: 'merchant_mother_dairy_saket',
      title: 'Free Cotton Cloth Milk Bag',
      discountText: 'Reusable cotton bag to eliminate single-use polythene',
      costGC: 30,
      expiresAt: futureExpiry,
      stock: 200,
    },
    {
      couponId: 'coup_mother_dairy_curd_10',
      merchantId: 'merchant_mother_dairy_saket',
      title: '₹10 Off Probiotic Curd',
      discountText: '₹10 off on 400g tub with clean container return',
      costGC: 25,
      expiresAt: futureExpiry,
      stock: 120,
    },
    {
      couponId: 'coup_fabindia_15_percent',
      merchantId: 'merchant_fabindia_gk',
      title: '15% Off Organic Cotton Apparel',
      discountText: '15% off sustainable organic cotton clothing',
      costGC: 150,
      expiresAt: futureExpiry,
      stock: 40,
    },
    {
      couponId: 'coup_fabindia_jute_tote',
      merchantId: 'merchant_fabindia_gk',
      title: '50% Off Jute Market Tote',
      discountText: 'Half price on handmade biodegradable jute bag',
      costGC: 80,
      expiresAt: futureExpiry,
      stock: 75,
    },
    {
      couponId: 'coup_chaayos_reusable_cup',
      merchantId: 'merchant_chaayos_karolbagh',
      title: '₹25 Off Chai in Your Own Cup',
      discountText: 'Bring your thermos or tumbler and save ₹25',
      costGC: 35,
      expiresAt: futureExpiry,
      stock: 250,
    },
    {
      couponId: 'coup_chaayos_kulhad_chai',
      merchantId: 'merchant_chaayos_karolbagh',
      title: 'Free Clay Kulhad Chai Upgrade',
      discountText: 'Upgrade to biodegradable clay kulhad for free',
      costGC: 20,
      expiresAt: futureExpiry,
      stock: 300,
    },
    {
      couponId: 'coup_chaayos_snack_combo',
      merchantId: 'merchant_chaayos_karolbagh',
      title: '₹40 Off Bun Maska + Chai Combo',
      discountText: 'Eco-breakfast perk for top recyclers',
      costGC: 65,
      expiresAt: futureExpiry,
      stock: 90,
    },
    {
      couponId: 'coup_khadi_silk_stole',
      merchantId: 'merchant_khadi_cp',
      title: '₹200 Off Ahimsa Silk Stole',
      discountText: 'Non-violent cruelty-free silk stole perk',
      costGC: 220,
      expiresAt: futureExpiry,
      stock: 20,
    },
    {
      couponId: 'coup_organic_millet_cookies',
      merchantId: 'merchant_organic_farmers',
      title: 'Free Ragi Millet Cookie Pack',
      discountText: 'Zero sugar nutritious snack with any order',
      costGC: 50,
      expiresAt: futureExpiry,
      stock: 110,
    },
  ];

  const couponItems = coupons.map((c) => ({
    PK: `MERCHANT#${c.merchantId}`,
    SK: `COUPON#${c.couponId}`,
    GSI1PK: 'COUPONS',
    GSI1SK: `COST#${c.costGC.toString().padStart(5, '0')}`,
    ...c,
  }));

  // 5. 25 Demo Users (20 citizens, 3 collectors, 2 ward admins)
  const userProfiles: UserProfile[] = [
    // Top Citizen (Van Rakshak)
    {
      userId: 'usr_delhi_aarav_sharma',
      email: 'aarav.sharma@saafsafari.demo',
      language: 'hi',
      homeTerritoryId: territories[0]?.h3Index || '8760824b4ffffff',
      role: 'citizen',
      balanceGC: 420,
      lifetimeXP: 11250,
      streakDays: 21,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: now,
    },
    // Citizen (Vriksh)
    {
      userId: 'usr_delhi_priya_singh',
      email: 'priya.singh@saafsafari.demo',
      language: 'en',
      homeTerritoryId: territories[4]?.h3Index || '8760824b4ffffff',
      role: 'citizen',
      balanceGC: 280,
      lifetimeXP: 6800,
      streakDays: 14,
      createdAt: '2026-08-15T00:00:00.000Z',
      updatedAt: now,
    },
    // Citizen (Paudha)
    {
      userId: 'usr_delhi_rohit_verma',
      email: 'rohit.verma@saafsafari.demo',
      language: 'hi',
      homeTerritoryId: territories[1]?.h3Index || '8760824b4ffffff',
      role: 'citizen',
      balanceGC: 140,
      lifetimeXP: 2450,
      streakDays: 7,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: now,
    },
    // Citizen (Ankur)
    {
      userId: 'usr_delhi_ananya_das',
      email: 'ananya.das@saafsafari.demo',
      language: 'en',
      homeTerritoryId: territories[6]?.h3Index || '8760824b4ffffff',
      role: 'citizen',
      balanceGC: 75,
      lifetimeXP: 950,
      streakDays: 3,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: now,
    },
    // Citizen (Beej)
    {
      userId: 'usr_delhi_kabir_mehta',
      email: 'kabir.mehta@saafsafari.demo',
      language: 'hi',
      homeTerritoryId: territories[8]?.h3Index || '8760824b4ffffff',
      role: 'citizen',
      balanceGC: 20,
      lifetimeXP: 180,
      streakDays: 1,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: now,
    },
    // 3 Collectors
    {
      userId: 'collector_ramesh_kumar',
      email: 'ramesh.collector@mcd.gov.in',
      language: 'hi',
      homeTerritoryId: territories[0]?.h3Index || '8760824b4ffffff',
      role: 'collector',
      balanceGC: 650,
      lifetimeXP: 14200,
      streakDays: 45,
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: now,
    },
    {
      userId: 'collector_suresh_yadav',
      email: 'suresh.collector@mcd.gov.in',
      language: 'hi',
      homeTerritoryId: territories[4]?.h3Index || '8760824b4ffffff',
      role: 'collector',
      balanceGC: 520,
      lifetimeXP: 11800,
      streakDays: 30,
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: now,
    },
    {
      userId: 'collector_mohan_lal',
      email: 'mohan.collector@mcd.gov.in',
      language: 'hi',
      homeTerritoryId: territories[15]?.h3Index || '8760824b4ffffff',
      role: 'collector',
      balanceGC: 410,
      lifetimeXP: 8900,
      streakDays: 22,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: now,
    },
    // 2 Ward Admins
    {
      userId: 'admin_ward34_south',
      email: 'ward34.admin@mcd.gov.in',
      language: 'en',
      homeTerritoryId: territories[4]?.h3Index || '8760824b4ffffff',
      role: 'ward_admin',
      balanceGC: 0,
      lifetimeXP: 0,
      streakDays: 0,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: now,
    },
    {
      userId: 'admin_ward12_north',
      email: 'ward12.admin@mcd.gov.in',
      language: 'hi',
      homeTerritoryId: territories[15]?.h3Index || '8760824b4ffffff',
      role: 'ward_admin',
      balanceGC: 0,
      lifetimeXP: 0,
      streakDays: 0,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: now,
    },
  ];

  // Fill remaining 15 citizens across Delhi territories
  const names = [
    'Rohan Gupta', 'Neha Kapoor', 'Vikram Malhotra', 'Sneha Roy', 'Devendra Singh',
    'Ishaan Bhatia', 'Rhea Chopra', 'Aditya Joshi', 'Kavita Nair', 'Manish Tiwari',
    'Simran Kaur', 'Deepak Aggarwal', 'Sunita Jain', 'Arjun Saxena', 'Pooja Reddy'
  ];

  names.forEach((name, idx) => {
    const slug = name.toLowerCase().replace(/\s+/g, '_');
    const t = territories[(idx * 3 + 7) % territories.length];
    const xp = 200 + idx * 450;
    userProfiles.push({
      userId: `usr_delhi_${slug}`,
      email: `${slug}@saafsafari.demo`,
      language: idx % 2 === 0 ? 'hi' : 'en',
      homeTerritoryId: t.h3Index,
      role: 'citizen',
      balanceGC: Math.floor(xp / 15),
      lifetimeXP: xp,
      streakDays: (idx % 10) + 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: now,
    });
  });

  const userItems = userProfiles.map((u) => ({
    PK: `USER#${u.userId}`,
    SK: 'PROFILE',
    GSI1PK: `TERRITORY#${u.homeTerritoryId}`,
    GSI1SK: `USER#${u.userId}`,
    ...u,
  }));

  // 6. Realistic historical ledger entries for top demo users
  const ledgerItems: Record<string, any>[] = [
    {
      PK: 'USER#usr_delhi_aarav_sharma',
      SK: `LEDGER#2026-10-04T10:15:00.000Z`,
      GSI1PK: 'ACTION#STATIC_BIN_SCAN',
      GSI1SK: '2026-10-04T10:15:00.000Z',
      userId: 'usr_delhi_aarav_sharma',
      actionType: 'STATIC_BIN_SCAN',
      creditsEarned: 18,
      xpEarned: 45,
      territoryId: territories[0]?.h3Index,
      sourceId: 'qr_bin_cp_inner_circle_01',
      timestamp: '2026-10-04T10:15:00.000Z',
    },
    {
      PK: 'USER#usr_delhi_aarav_sharma',
      SK: `LEDGER#2026-10-03T08:30:00.000Z`,
      GSI1PK: 'ACTION#HABIT_SEGREGATION',
      GSI1SK: '2026-10-03T08:30:00.000Z',
      userId: 'usr_delhi_aarav_sharma',
      actionType: 'HABIT_SEGREGATION',
      creditsEarned: 4,
      xpEarned: 15,
      territoryId: territories[0]?.h3Index,
      timestamp: '2026-10-03T08:30:00.000Z',
    },
    {
      PK: 'USER#usr_delhi_priya_singh',
      SK: `LEDGER#2026-10-04T09:00:00.000Z`,
      GSI1PK: 'ACTION#TRUCK_COLLECTOR_SCAN',
      GSI1SK: '2026-10-04T09:00:00.000Z',
      userId: 'usr_delhi_priya_singh',
      actionType: 'TRUCK_COLLECTOR_SCAN',
      creditsEarned: 45,
      xpEarned: 75,
      territoryId: territories[4]?.h3Index,
      sourceId: 'qr_truck_vehicle_01',
      timestamp: '2026-10-04T09:00:00.000Z',
    },
    {
      PK: 'USER#usr_delhi_rohit_verma',
      SK: `LEDGER#2026-10-03T16:45:00.000Z`,
      GSI1PK: 'ACTION#E_WASTE_DROPOFF',
      GSI1SK: '2026-10-03T16:45:00.000Z',
      userId: 'usr_delhi_rohit_verma',
      actionType: 'E_WASTE_DROPOFF',
      creditsEarned: 75,
      xpEarned: 150,
      territoryId: territories[1]?.h3Index,
      sourceId: 'qr_ewaste_hub_01',
      timestamp: '2026-10-03T16:45:00.000Z',
    },
  ];

  const allItems = [
    ...territoryItems,
    ...qrSourceItems,
    ...merchantItems,
    ...couponItems,
    ...userItems,
    ...ledgerItems,
  ];

  return {
    territoryItems,
    qrSourceItems,
    merchantItems,
    couponItems,
    userItems,
    ledgerItems,
    allItems,
  };
}

/**
 * Executes chunked batch write to DynamoDB table
 */
export async function batchWriteItems(
  docClient: DynamoDBDocumentClient,
  tableName: string,
  items: Record<string, any>[],
): Promise<number> {
  // Ensure unique primary keys across batch write
  const uniqueMap = new Map<string, Record<string, any>>();
  for (const item of items) {
    const key = `${item.PK}##${item.SK}`;
    uniqueMap.set(key, item);
  }
  const uniqueItems = Array.from(uniqueMap.values());

  const CHUNK_SIZE = 25; // DynamoDB maximum batch size
  let writtenCount = 0;

  for (let i = 0; i < uniqueItems.length; i += CHUNK_SIZE) {
    const chunk = uniqueItems.slice(i, i + CHUNK_SIZE);
    const putRequests = chunk.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    let requestItems: Record<string, any> = {
      [tableName]: putRequests,
    };

    let retries = 0;
    while (requestItems && Object.keys(requestItems).length > 0 && retries < 4) {
      const response = await docClient.send(
        new BatchWriteCommand({
          RequestItems: requestItems,
        }),
      );

      if (response.UnprocessedItems && Object.keys(response.UnprocessedItems).length > 0) {
        requestItems = response.UnprocessedItems;
        retries++;
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 100));
      } else {
        break;
      }
    }

    writtenCount += chunk.length;
  }

  return writtenCount;
}

// CLI Execution handler
async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const tableName = process.env.TABLE_NAME || 'SaafSafariMain';
  const region = process.env.AWS_REGION || 'ap-south-1';

  console.log(`[SEED] Generating SaafSafari seed dataset...`);
  const seed = generateSeedItems();

  console.log(`[SEED] Generated Items Breakdown:`);
  console.log(`  - Territories: ${seed.territoryItems.length}`);
  console.log(`  - QR Sources:  ${seed.qrSourceItems.length}`);
  console.log(`  - Merchants:   ${seed.merchantItems.length}`);
  console.log(`  - Coupons:     ${seed.couponItems.length}`);
  console.log(`  - Users:       ${seed.userItems.length}`);
  console.log(`  - Ledger Logs: ${seed.ledgerItems.length}`);
  console.log(`  - TOTAL ITEMS: ${seed.allItems.length}`);

  if (isDryRun) {
    console.log(`[SEED] DRY RUN mode enabled. Zero database writes executed.`);
    return;
  }

  console.log(`[SEED] Connecting to DynamoDB table "${tableName}" in ${region}...`);
  const client = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });

  const written = await batchWriteItems(docClient, tableName, seed.allItems);
  console.log(`[SEED] SUCCESS: Wrote ${written} items into DynamoDB table "${tableName}".`);
}

if (process.argv[1]?.includes('seed')) {
  run().catch((err) => {
    console.error(`[SEED ERROR]:`, err);
    process.exit(1);
  });
}
