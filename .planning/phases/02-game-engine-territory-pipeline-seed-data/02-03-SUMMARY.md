# Plan 02-03 Summary: DynamoDB Single-Table Seed Pipeline

## Overview
Implemented the complete database seed pipeline and supporting shared domain schemas for QR sources, merchants, and coupons. Successfully verified the item generator and 25-item chunked batch-writer with automated unit tests and a verified dry-run execution generating 158 single-table DynamoDB items.

## Key Deliverables
- **Shared Domain Schemas:**
  - `packages/shared/src/schemas/qr.ts`: `QrSourceSchema` and `QrSourceTypeSchema` (`dustbin_static`, `truck_rotating`, `ewaste_static`).
  - `packages/shared/src/schemas/merchant.ts`: `MerchantSchema`, `MerchantCategorySchema`, and `CouponSchema`.
- **Seed Pipeline (`scripts/seed.ts`):**
  - **68 Territories:** Populated from `generateDelhiTerritories()` with initial health, mood, mascot, and centroid coordinates.
  - **40 QR Sources:**
    - 25 Smart Dustbins across Connaught Place, Hauz Khas, Lodhi Gardens, Chandni Chowk, Saket, etc. (75m radius).
    - 10 Waste Collection Vehicles with HMAC secret keys for rotating QR codes (150m radius).
    - 5 E-Waste Collection Hubs (Nehru Place, Okhla, Laxmi Nagar, Janakpuri, Wazirpur) (100m radius).
  - **6 Eco-Merchants & 15 Coupons:**
    - Khadi India, Blue Tokai, Delhi Organic Farmers Market, Mother Dairy, FabIndia, Chaayos.
    - 15 coupons with Green Credits costs ranging from 20 to 220 GC.
  - **25 Demo Users:**
    - 20 Citizens across Beej, Ankur, Paudha, Vriksh, and Van Rakshak tiers with realistic Green Credits balances (20 to 420 GC) and streak records.
    - 3 Municipal Waste Truck Collectors (`collector` role).
    - 2 Municipal Ward Admins (`ward_admin` role for Ward 34 and Ward 12).
    - 4 Historical ledger entries showcasing multi-category civic actions.
  - **Batching & Resiliency:**
    - `batchWriteItems` chunks operations into 25 items per request (DynamoDB maximum).
    - Automatic exponential backoff retry loop for `UnprocessedItems`.
    - CLI `--dry-run` flag support.
- **Verification:**
  - 5/5 Vitest unit tests passing in `scripts/test/seed.test.ts`.
  - CLI dry run test: `pnpm seed --dry-run` validates 158 single-table items with zero errors.
