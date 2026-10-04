# Extracted Context & Background

## Civic Waste Management in Indian Urban Centers
- source: docs/00-PROJECT-CONTEXT.md
Indian cities generate ~1.5 lakh tonnes of municipal solid waste daily. Compliance with Solid Waste Management Rules 2016 remains low at the household level, preventing effective composting or recycling. The informal sector (kabadiwalas, waste pickers) performs the vast majority of real recycling but operates invisibly without municipal integration or formal compensation. Traditional government awareness campaigns lack continuous, rewarding daily feedback loops.

## Bharat Builds Hackathon Context & Evaluation
- source: docs/00-PROJECT-CONTEXT.md
SaafSafari is developed for the Environmental Hacks event (Track 03: Waste and Energy). The judging rubric prioritizes deep native AWS integration, tangible civic impact, polished user experience, and a working deployed demo video over wide but shallow implementations. The core demo flow requires demonstrating a dirty territory with an ailing mascot progressing to health as verified actions and coupon redemptions occur.

## Animal Mascot and Land-Cover Ecology
- source: docs/05-GAME-DESIGN.md
Territories are classified based on OpenStreetMap land-cover signatures into 13 indigenous Indian animal species:
1. Water (>= 25%): Gangetic River Dolphin (#2BB3E0)
2. Wetland (>= 15%): Flamingo (#F27BA8)
3. Sand/bare/quarry (>= 25%): Camel (#E8C547)
4. Forest (>= 35%): Bengal Tiger (#F28C28)
5. Park/grass/trees (>= 20%): Indian Star Tortoise (#4CAF50)
6. Hills/high altitude: Red Panda / Snow Leopard
7. Farmland (>= 30%): Indian Peafowl (#3F51B5)
8. Industrial (>= 20%): Indian Pangolin (#A97142)
9. Coastal (< 2km): Olive Ridley Turtle (#00897B)
10. Metro Core (top 10% density): Black Kite (#546E7A)
11. Dense Old City/Markets (top 25% density): Rhesus Macaque (#8D6E63)
12. Planned Residential/Suburbs (>= 40%): Indian Palm Squirrel (#9E9E9E)
13. Fallback: House Sparrow (#A1887F)

## Frontend Web Architecture & Municipal Operations
- source: docs/03-WEB-CONTEXT.md
The web client is built with Vite, React 19, TypeScript, and Tailwind CSS, hosted on AWS Amplify Hosting. It provides two core portals:
1. Citizen Web Portal: Light client for onboarding, viewing territory health, leaderboard browsing, and coupon redemption.
2. Municipal Admin Console: Operation dashboard with Ward-level aggregations, MapLibre GL heatmap of garbage hotspots, registered QR source management, printable QR batch exports, and a human-in-the-loop review queue for flagged photo submissions.

## Mobile Architecture & Collector Mechanics
- source: docs/04-MOBILE-CONTEXT.md
The mobile application is built with Expo (React Native) targeting low-end and mid-range Android devices, deployed via EAS APK builds.
Key features include:
- Bi-modal interface: Citizen Mode for scanning and reporting; Collector Mode for truck drivers and kabadiwalas.
- Live rotating QR display with 30-second HMAC token generation.
- Amazon Location background location streaming for active garbage trucks.
- Offline SQLite queue to buffer action tokens when mobile network connectivity drops.
