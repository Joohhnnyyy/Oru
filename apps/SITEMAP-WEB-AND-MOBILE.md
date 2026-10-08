# SaafSafari (working name) - Pages, Sections and Options

Complete information architecture for the **website** and the **mobile app**, listed separately. Replace "SaafSafari" with the final name once chosen.

Priority tags match the build plan:
- **[P0]** must work in the demo
- **[P1]** strong differentiator, build on Day 2-3
- **[P2]** only if time permits

Roles:
- **Citizen** - default user
- **Collector** - garbage truck driver, kabadiwala, e-waste point operator
- **Ward Admin** - municipal officer or RWA representative
- **Merchant** - coupon partner

---

# PART A - WEBSITE

The website has three zones:
1. **Public site** - no login
2. **Citizen web app** - login, role `citizen`
3. **Municipal Console** - login, roles `ward_admin` and `merchant`

## A0. Global elements (all web pages)

### A0.1 Top navigation bar
- Public site: Logo, How it works, Live map, For municipalities, Leaderboard, FAQ, Language switch (EN/HI), Sign in, Get the app
- Citizen app: Logo, Home, Map, Tasks, Scan, Wallet, Coupons, Leaderboards, notification bell, avatar menu
- Console: Logo + "Console" label, ward selector (if admin has more than one ward), notification bell, avatar menu, "Switch to citizen view"

### A0.2 Avatar menu
- Profile
- Settings
- Language (EN / HI)
- Theme (Light / Dark / System)
- Help and support
- Sign out

### A0.3 Footer (public site only)
- About, Privacy policy, Terms, Contact
- Built on AWS badge
- Hackathon credit line (WeMakeDevs x AWS, Bharat Builds Tour)
- App download link (APK / QR code)

### A0.4 Shared states on every data page
- Loading: skeleton placeholders, never a blank screen
- Empty: illustration + one-line explanation + primary action
- Error: plain-language message + Retry button + error code in small text
- Offline banner: "You are offline - showing last saved data"

### A0.5 Toasts and dialogs
- Success toast (credits earned, coupon redeemed)
- Error toast mapped from API error codes: COOLDOWN_ACTIVE, OUT_OF_RANGE, TOKEN_EXPIRED, DAILY_CAP_REACHED, INSUFFICIENT_BALANCE, VALIDATION_ERROR
- Confirmation dialog for irreversible actions (redeem coupon, change home territory, reject submission)

---

## A1. Public site

### A1.1 Landing page `/` [P0]

**Section 1 - Hero**
- Headline: one line on the promise (clean your area, heal your territory, earn rewards)
- Sub-headline: one line on how (scan, verify, earn)
- Primary button: Start now (goes to sign in)
- Secondary button: Download the app
- Visual: animated territory hex with a mascot moving from Sick to Thriving

**Section 2 - The problem**
- 3 stat cards: mixed waste, invisible informal recyclers, recurring dump spots
- One-line source note under each stat

**Section 3 - How it works (4 steps)**
- Step 1: Get your territory and its animal
- Step 2: Do daily, weekly and monthly tasks
- Step 3: Verify by QR scan or photo
- Step 4: Earn Green Credits, redeem coupons, heal your territory

**Section 4 - Live city map (read-only)**
- Embedded map with territories coloured by animal and health
- Legend: animal types, mood states
- Counter strip: verified actions today, active citizens, hotspots resolved this week
- Button: Explore full map

**Section 5 - Meet the mascots**
- Grid of animal cards: name, land type, colour, the four mood states
- Hover/tap shows the mood progression

**Section 6 - Task examples**
- Tabs: Daily / Weekly / Monthly
- 3-4 example task cards per tab with credit value and verification icon

**Section 7 - For municipalities**
- Short pitch: ward dashboard, hotspot heatmap, collector inclusion
- Screenshot of the console
- Button: Request a ward demo

**Section 8 - Built on AWS**
- Architecture diagram
- One line per service on what it does

**Section 9 - Rewards and partners**
- Coupon category tiles (kirana, metro and bike rentals, compost kits, repair shops)
- Note that demo merchants are illustrative

**Section 10 - FAQ preview**
- 5 most common questions, link to full FAQ

**Section 11 - Final call to action**
- Start now button + app QR code

### A1.2 How it works `/how-it-works` [P1]
- Section: Territories explained (H3 hex map, home territory, Explorer bonus)
- Section: Tasks explained (daily, weekly, monthly, bounties, community goals)
- Section: Verification methods (rotating QR, static QR, photo with AI check, document, self-declared) with trust weights
- Section: Credit formula in plain language with a worked example
- Section: Territory health and mascot moods
- Section: Fair play rules (cooldowns, daily caps, duplicate photo detection)

### A1.3 Live map `/map/public` [P1]
- Full-screen map, read-only
- Layer toggles: territories, drop points, live trucks, resolved hotspots
- Search bar: locality name
- Territory side panel on click: name, animal, mood, health, weekly gain, top 3 citizens (first names only)
- Button: Join this territory (sign in)

### A1.4 For municipalities `/municipalities` [P1]
- Section: Problems the console solves
- Section: Features (ward KPIs, review queue, QR registry, bounties, reports)
- Section: Collector inclusion (kabadiwalas and drivers earn credits)
- Section: Data and privacy approach
- Contact form: name, organisation, ward/city, email, phone, message

### A1.5 Public leaderboard `/leaderboard` [P1]
- Tabs: Territories (by weekly health gain) / Citizens (city, weekly)
- Filters: this week / all time
- Rows: rank, name or territory, mascot, score, change since last week

### A1.6 FAQ `/faq` [P1]
- Categories: Getting started, Tasks and verification, Credits and coupons, Territories, Privacy, For collectors, For municipalities
- Accordion list per category
- Search box

### A1.7 Legal pages [P1]
- `/privacy`: what is collected (location at action time, photos, email), retention, deletion request
- `/terms`: fair play, fraud consequences, coupon terms
- `/contact`: form + email

### A1.8 Download `/download` [P0]
- APK download button + QR code
- Install steps for Android (allow unknown sources)
- Minimum Android version and device notes

---

## A2. Authentication and onboarding (web)

### A2.1 Sign in `/signin` [P0]
- Email field
- Button: Send code
- Divider "or"
- Button: Continue with Google
- Language switch
- Links: Terms, Privacy

### A2.2 Verify code `/verify` [P0]
- Six-digit code input, auto-advance
- Resend code (with countdown timer)
- Change email link
- Error states: wrong code, expired code, too many attempts

### A2.3 Onboarding step 1 - Language `/onboarding/language` [P0]
- Options: English, Hindi
- Continue button

### A2.4 Onboarding step 2 - How it works (3 slides) [P1]
- Slide 1: Do real actions in your area
- Slide 2: Verify with QR or photo
- Slide 3: Earn credits and heal your territory
- Skip button, progress dots

### A2.5 Onboarding step 3 - Location `/onboarding/location` [P0]
- Explanation of why location is needed
- Button: Use my current location
- Fallback: search locality or drop a pin on the map
- Privacy note

### A2.6 Onboarding step 4 - Home territory reveal `/onboarding/home` [P0]
- Map zooms to the assigned hex
- Mascot animation in current mood
- Territory name, health score, one-line status message
- First 3 daily tasks preview
- Button: Let's start

---

## A3. Citizen web app

### A3.1 Home `/home` [P0]

**Section 1 - Territory card**
- Mascot image in current mood
- Territory name and animal
- Health ring (0-100) with today's change
- Mood label (Sick / Recovering / Thriving / Legendary)
- Link: View territory

**Section 2 - Status strip**
- Green Credits balance
- XP, level and rank title
- Streak count with flame and "at risk" warning after 20:00 IST

**Section 3 - Today's tasks**
- 3 daily task cards, each with:
  - icon
  - title
  - expected credits including current multipliers
  - verification type
  - progress
  - action button (Scan / Upload proof / Start)
- Daily completion bonus progress (0/3)
- Link: All tasks

**Section 4 - Nearby**
- Truck near you chip (distance, ETA) [P1]
- Nearest drop points (bin, e-waste, refill) with distance
- Open bounties within 2 rings [P1]

**Section 5 - Community goal**
- Territory monthly goal progress bar
- Number of participants

**Section 6 - Recent activity**
- Last 5 ledger entries with credits and source

### A3.2 Map `/map` [P0]

**Section 1 - Map canvas**
- Territory fill by animal colour, opacity by health
- Home territory outlined
- Mascot icons at zoom 11 and above
- User location dot

**Section 2 - Layer controls**
- Toggles: Territories, Drop points, Live trucks [P1], Bounties [P1], My activity
- Drop point type filter: Public bin, E-waste, Hazardous, Refill, Multi-layer plastic, Kabadiwala, Repair shop

**Section 3 - Search and locate**
- Search locality
- Recenter on me
- Go to home territory

**Section 4 - Bottom sheet on territory tap**
- Name, animal, mood, health
- Explorer bonus percentage relative to home territory
- Open tasks and bounties here
- Button: View territory

**Section 5 - Bottom sheet on drop point tap**
- Type, name, distance
- Accepted items
- Cooldown status for this user
- Button: Get directions

**Section 6 - Legend**
- Animal colours, mood icons, marker types

### A3.3 Territory detail `/t/:h3` [P1]
- Header: mascot, name, animal, land type breakdown (percentage bars)
- Health section: current score, 14-day trend chart, mood history
- This week: credits earned here, active citizens, actions by type
- Leaderboard tab: top citizens this week
- Bounties tab: open bounties with reward and slots left
- Hotspots tab: reported, validated, resolved
- Drop points tab: list with distance
- Neighbours: adjacent territories with their mascots and Explorer bonus

### A3.4 Tasks `/tasks` [P0]

**Tabs: Daily / Weekly / Monthly / Bounties**
- Each tab shows:
  - refresh countdown (resets at 00:00 IST, Monday, 1st)
  - completion bonus progress
  - task cards
- Task card:
  - title
  - tier badge (Easy / Medium / Hard / Epic / Legendary)
  - expected credits
  - verification type
  - progress bar
  - expiry
  - status (Open / In review / Done / Expired)
- Monthly tab extra: territory community goal panel

**Filters**
- Status: Open / In review / Done
- Verification type

### A3.5 Task detail `/tasks/:taskId` [P0]
- Title, tier, credits, expiry
- What to do (steps)
- How it is verified (with example photo for photo tasks)
- Credit breakdown preview (base, verification weight, multipliers)
- Nearest places to complete it (for QR tasks)
- Action button: Scan QR / Upload proof / Start quiz
- Rules: cooldown and cap notes

### A3.6 Scan `/scan` [P0]
- Webcam QR scanner view with frame overlay
- Camera selector (front/back/external)
- Location status indicator (accuracy in metres)
- Manual fallback: paste QR code text [P2]
- Result panel (same as A3.7)

### A3.7 Scan result (panel/modal) [P0]
- Credit pop animation
- Credit breakdown: base, verification weight, streak, Explorer, territory need, event, flat bonuses, total
- Tasks updated (ticks)
- Territory health change and mood change animation if any
- Buttons: Scan again, Back to home

### A3.8 Submit proof `/submit/:taskId` [P1]
- Task rubric reminder
- Upload mode: Single photo / Before and after
- File picker (JPEG only, size note)
- Location confirmation
- Optional note
- Submit button with upload progress

### A3.9 Submission status `/submissions/:id` [P1]
- Status stepper: Uploaded, Safety check, Duplicate check, AI check, Decision
- Result: Approved (credits shown) / Under review / Rejected (reason)
- Photos submitted
- Option: Appeal (sends to admin review) [P2]

### A3.10 My submissions `/submissions` [P1]
- List with status filters: All / Pending / In review / Approved / Rejected
- Each row: task, date, status, credits

### A3.11 Report hotspot `/hotspots/new` [P1]
- Map pin (prefilled with current location)
- Photo upload
- Category: Mixed garbage dump, Plastic, Construction debris, Burning waste, E-waste dump, Other
- Severity: Small / Medium / Large
- Note
- Submit

### A3.12 Wallet `/wallet` [P0]
- Balance card: Green Credits, XP, level, next level progress
- Earned this week / this month
- Ledger list:
  - date
  - description
  - source (scan / photo / bonus / redeem / collector)
  - amount (+ / -)
  - territory
- Filters: Earned / Spent / Bonuses, date range
- Ledger item detail: full credit breakdown

### A3.13 Coupons `/coupons` [P0]
- Category filter: Grocery, Transport, Home and compost, Repair, Food
- Sort: Lowest price, Newest, Most popular
- Coupon card: merchant, offer, price in credits, availability, "you can afford" indicator
- Coupon detail dialog: terms, validity, redeem button
- Redeem confirmation dialog: price, balance after redemption

### A3.14 My vouchers `/vouchers` [P0]
- Tabs: Active / Used / Expired
- Voucher card:
  - merchant
  - code with copy button
  - QR of code
  - validity
  - Mark as used

### A3.15 Leaderboards `/leaderboards` [P1]
- Scope switch: My territory / City / Friends [P2] / Territories
- Period: This week / All time
- Your rank pinned at top
- Rows: rank, avatar, name, level, score, change

### A3.16 Saaf Mitra assistant `/assistant` [P2]
- Chat thread
- Input: text, upload photo of an item
- Answer card: which bin, how to prepare the item, nearest drop point with map link
- Suggested questions chips

### A3.17 Notifications `/notifications` [P1]
- List grouped by Today / Earlier
- Types: credits earned, submission decision, bounty nearby, truck nearby, mood change, streak at risk, coupon expiring
- Mark all as read

### A3.18 Profile `/profile` [P0]
- Avatar, name, level, rank title
- Home territory with change option (once in 30 days)
- Stats:
  - total actions
  - territories visited
  - longest streak
  - waste actions by type
- Badges / achievements [P2]
- Referral code with share link [P2]

### A3.19 Settings `/settings` [P1]
- Account: name, email (read-only), sign-out of all devices
- Language
- Theme
- Notifications: email on/off per type
- Privacy: download my data, delete account request
- About: version, credits, open-source licences

### A3.20 Help `/help` [P1]
- FAQ search
- Contact support form
- Report a problem with a QR source

---

## A4. Municipal Console (web only)

### A4.1 Console overview `/console` [P1]

**Section 1 - KPI cards (last 7 days, with change vs previous)**
- Verified actions
- Active citizens
- Segregation handovers
- E-waste drops
- Hotspots open / resolved
- Average territory health

**Section 2 - Charts**
- Actions by type per day (stacked bar)
- Health trend for ward territories (line)
- Verification method split (donut)

**Section 3 - Alerts**
- Territories that dropped to Sick
- Submissions waiting more than 24 hours
- QR sources with suspicious scan patterns

**Section 4 - Quick actions**
- Review queue, Add QR source, Create bounty, Download report

### A4.2 Territories `/console/territories` [P1]
- View toggle: Map / Table
- Table columns:
  - name
  - animal
  - health
  - mood
  - 7-day change
  - actions
  - active citizens
  - open hotspots
- Sort and filter by mood, health range
- Row click: territory console detail

### A4.3 Territory console detail `/console/territories/:h3` [P1]
- Health trend
- Action breakdown
- QR sources in territory
- Hotspots and bounties
- Top citizens and collectors
- Button: Run double-credit event here

### A4.4 Review queue `/console/review` [P1]
- Filters: task type, AI confidence range, age
- Review card:
  - before and after photos side by side
  - zoom
  - task rubric
  - Rekognition labels
  - Bedrock verdict, confidence and reason
  - map pin
  - user trust stats (approval rate, account age)
- Actions:
  - Approve
  - Reject with reason (Not matching task, Duplicate, Stock or screenshot, Wrong location, Unsafe content, Other)
  - Skip
- Keyboard shortcuts: J / K to move, A approve, R reject
- Bulk mode for clear cases [P2]

### A4.5 QR sources `/console/qr` [P0]
- Table columns:
  - name
  - type
  - mode (static / rotating)
  - territory
  - owner (collector)
  - scans today
  - status (active / paused)
- Filters: type, status, territory
- Button: Add source

### A4.6 Add / edit QR source `/console/qr/new`, `/console/qr/:id` [P0]
- Name
- Type: Public bin, Garbage truck, Kabadiwala, E-waste point, Hazardous drop, Refill station, Multi-layer plastic point, Event, Repair shop
- Mode: Static (printed) / Rotating (collector phone)
- Location: drop pin on map, radius slider (25-200 m)
- Assigned collector (for rotating)
- Cooldown hours (default by type)
- Accepted items (for drop points)
- Active toggle
- Save, Pause, Delete

### A4.7 Print QR sheet `/console/qr/print` [P0]
- Select sources
- Layout: 1, 4 or 6 per A4 page
- Each tile: QR, source name, type, short Hindi and English instructions
- Print / Download PDF

### A4.8 Collectors `/console/collectors` [P1]
- Table: name, type (driver / kabadiwala / e-waste operator), linked source, on route now, scans today, credits earned
- Invite collector (email) and assign role
- Collector detail: route history map, daily scans chart

### A4.9 Hotspots `/console/hotspots` [P1]
- Heatmap layer with time slider (last 7 / 30 days)
- List: photo, category, severity, reporter count, status
- Actions per hotspot:
  - Validate
  - Mark duplicate
  - Reject
  - Create bounty
  - Mark resolved

### A4.10 Bounties `/console/bounties` [P1]
- List: hotspot, reward credits, slots used / total, status, expiry
- Create bounty: hotspot, reward, slots, expiry, description (auto-translate to Hindi option [P2])
- Close bounty early

### A4.11 Events `/console/events` [P2]
- List of cleanup and awareness events
- Create event: name, date and time, location, event QR, credit multiplier, max participants
- Attendance list after event

### A4.12 Reports `/console/reports` [P1]
- Date range picker
- Report sections:
  - actions by type
  - estimated waste diverted by category
  - hotspots trend
  - top territories
  - collector participation
- Export: CSV, PDF

### A4.13 Users and fraud `/console/users` [P2]
- Search user by email
- User detail: actions, approval rate, flags
- Actions: Flag, Unflag, Reverse a ledger entry (with reason)

### A4.14 Merchants and coupons `/console/merchants` (ward_admin, merchant) [P1]
- Merchant list: name, category, coupons available, redemptions
- Add merchant: name, category, logo, terms
- Coupon inventory:
  - upload CSV of codes
  - set price in credits
  - validity
  - per-user weekly limit
- Redemption log

### A4.15 Console settings `/console/settings` [P2]
- Ward profile: name, boundary, contact
- Default cooldowns and caps
- Admin team: invite, remove
- Audit log: who changed what

---

# PART B - MOBILE APP (Android first, Expo)

Bottom tab bar (citizen):
- Home
- Map
- Scan (large centre button)
- Tasks
- Profile

Collector mode replaces the tab bar with its own simplified screens.

## B0. Global elements

### B0.1 App shell
- Bottom tab bar with badge counts (tasks due, notifications)
- Offline pill at top when disconnected
- Pull to refresh on every list screen
- Haptic feedback on scan success and credit award

### B0.2 Permission primer screens (shown before the OS prompt)
- Camera: for QR scanning and proof photos
- Location (foreground): for territory and drop point verification
- Location (background, collectors only): to show the truck or cart on the map
- Notifications: truck nearby, bounties, streak reminders
- Each screen: illustration, one-line reason, Allow button, Not now link
- Permission denied state: explanation + Open settings button

### B0.3 Shared states
- Skeleton loading
- Empty states with an action
- Error with Retry
- Offline: cached data with last-updated time

---

## B1. Launch, authentication and onboarding

### B1.1 Splash [P0]
- Logo, mascot animation
- Silent token refresh and route decision (signed in / onboarding / home)

### B1.2 Welcome [P0]
- 3 swipeable cards: Do, Verify, Earn and heal
- Buttons: Get started, I already have an account
- Language switch

### B1.3 Sign in [P0]
- Email field, Send code
- Continue with Google
- Terms and privacy links

### B1.4 Verify code [P0]
- Six-digit input with auto-fill from email paste
- Resend timer
- Change email

### B1.5 Language [P0]
- English / Hindi

### B1.6 Location setup [P0]
- Permission primer
- Use current location / search locality / drop pin

### B1.7 Home territory reveal [P0]
- Map zoom to hex
- Mascot Lottie in current mood
- Territory name, health, message
- First tasks preview
- Let's start

### B1.8 Notification opt-in [P1]
- Shown after the first credit award, not at signup

---

## B2. Tab 1 - Home [P0]

**Section 1 - Territory hero**
- Mascot in mood
- Territory name, health ring, today's change
- Tap: territory detail

**Section 2 - Stats row**
- Credits balance (tap: wallet)
- Level and XP bar
- Streak flame (tap: streak details)

**Section 3 - Today's tasks**
- Horizontal or stacked cards with expected credits and action button
- Daily bonus progress

**Section 4 - Truck nearby card [P1]**
- Distance, ETA, "Get ready to hand over segregated waste"
- Button: Open scanner

**Section 5 - Nearby**
- Nearest drop points (3) with distance
- Bounties near you [P1]

**Section 6 - Community goal**
- Territory monthly goal bar

**Section 7 - Recent activity**
- Last 5 credit events

### B2.1 Streak details (sheet) [P1]
- Current streak, longest streak
- Current multiplier and next milestone (3, 7, 14, 30 days)
- Calendar of active days this month

---

## B3. Tab 2 - Map [P0]
- Full-screen map with territories, mascots, user dot
- Floating controls: recenter, home territory, layers
- Layers sheet: territories, drop points (by type), live trucks [P1], bounties [P1], my activity
- Search bar: locality
- Territory bottom sheet: name, animal, mood, health, Explorer bonus, open tasks, View territory
- Drop point bottom sheet: type, accepted items, distance, cooldown status, Directions (opens Google Maps intent)
- Truck marker sheet: last update time, route status [P1]

### B3.1 Territory detail screen [P1]
- Header with mascot and land-type breakdown
- Tabs: Overview (health trend, mood history), Leaders, Bounties, Hotspots, Drop points
- Neighbours carousel with Explorer bonus values

---

## B4. Tab 3 - Scan [P0]

### B4.1 Scanner screen
- Full-screen camera with QR frame
- Torch toggle
- Location accuracy indicator ("Good" / "Move to open sky")
- Hint text: "Scan the QR on the truck, bin or collector's phone"
- Ignore non-app QR codes with a gentle message

### B4.2 Scan result sheet
- Credit pop animation and haptic
- Breakdown: base, verification weight, streak, Explorer, territory need, event, flat bonuses, total
- Tasks progressed
- Territory health change; mascot mood change animation if triggered
- Buttons: Done, Scan another

### B4.3 Scan error sheet
- Cooldown active: time remaining
- Out of range: distance from source
- Token expired: "Ask the collector to refresh the QR"
- Daily cap reached
- Retry / Report a problem with this QR

### B4.4 Quick actions from scan tab (secondary row)
- Upload proof for a task
- Report hotspot
- Ask Saaf Mitra [P2]

---

## B5. Tab 4 - Tasks [P0]
- Segmented control: Daily / Weekly / Monthly / Bounties
- Refresh countdown per period
- Completion bonus progress per period
- Task cards: tier badge, credits, verification icon, progress, expiry, status
- Monthly: community goal panel

### B5.1 Task detail screen
- What to do, how it is verified, example photo
- Credit preview with current multipliers
- Nearest places to complete (QR tasks) with distances
- Primary action: Scan / Take photo / Start quiz

### B5.2 Photo proof flow [P1]
- Step 1: Rubric reminder
- Step 2: Camera capture (camera only, no gallery)
- Step 3 (before/after tasks): ghost overlay of the "before" photo to match angle
- Step 4: Review photos, retake option
- Step 5: Upload with progress
- Step 6: Status screen (stepper: uploaded, safety, duplicate, AI, decision)

### B5.3 Quiz flow [P1]
- 5 questions, one per screen
- Instant feedback with a short explanation
- Score and credits at the end

### B5.4 Walk / cycle trip tracker [P2]
- Start trip, live distance, stop trip
- Speed check warning if above 25 km/h
- Submit for credits

### B5.5 Document upload (electricity bill) [P2]
- Capture or pick a PDF/photo
- Extracted units shown for confirmation
- Submit

---

## B6. Tab 5 - Profile [P0]
- Avatar, name, level, rank title, XP bar
- Home territory with change option (30-day lock shown)
- Stats: total actions, territories visited, longest streak, actions by waste type
- Menu list:
  - Wallet
  - My vouchers
  - Coupons
  - Leaderboards
  - My submissions
  - Report hotspot
  - Saaf Mitra [P2]
  - Notifications
  - Settings
  - Help
  - Switch to Collector mode (visible only to collectors)

### B6.1 Wallet [P0]
- Balance card, earned this week/month
- Ledger list with filters (earned / spent / bonus)
- Ledger item sheet with full breakdown

### B6.2 Coupons [P0]
- Category chips, sort
- Coupon cards with price and affordability
- Coupon detail: terms, validity, Redeem
- Redeem confirmation: price and balance after

### B6.3 My vouchers [P0]
- Tabs: Active / Used / Expired
- Voucher detail: code, QR, copy button, validity, Mark as used

### B6.4 Leaderboards [P1]
- Scope: My territory / City / Territories
- Period: This week / All time
- Your rank pinned

### B6.5 My submissions [P1]
- Status filter list, tap for status screen

### B6.6 Report hotspot [P1]
- Camera capture, auto location
- Category, severity, note
- Submit

### B6.7 Saaf Mitra assistant [P2]
- Chat with text and photo input
- Answer card: bin type, preparation tips, nearest drop point

### B6.8 Notifications [P1]
- Grouped list, mark all read
- Tap opens the relevant screen (deep link)

### B6.9 Settings [P1]
- Language
- Theme
- Notification toggles per type
- Data saver mode: lower map detail, no autoplay animations [P2]
- Privacy: download my data, delete account request
- About: version, licences
- Sign out

### B6.10 Help [P1]
- FAQ
- Contact support
- Report a QR problem

---

## B7. Collector mode (role `collector`) [P0 for rotating QR, P1 for the rest]

Simplified UI:
- large text
- Hindi by default
- high contrast
- usable with one hand

### B7.1 Collector home
- Large rotating QR (about 70% of screen width), screen brightness forced to max
- Countdown ring (refreshes every 25 seconds automatically)
- Source name and type
- Today: citizen scans count, credits earned
- On route toggle (starts or stops location sharing)

### B7.2 Route status [P1]
- Location sharing status and last sent time
- Battery saver warning
- Today's route trace on map

### B7.3 Collector earnings [P1]
- Daily and weekly scans chart
- Credits earned, payout history (credits only in the demo)

### B7.4 Collector settings [P1]
- Language
- Linked source details (read-only)
- Switch to citizen mode
- Sign out

### B7.5 Background location notification (Android foreground service)
- Persistent notification: "Sharing route location - tap to stop"

---

## B8. System screens (mobile)

- **Force update** [P2]: shown when the API rejects an old app version
- **Maintenance**: friendly message and retry
- **No internet**: cached view with offline pill; queued actions count [P2]
- **Deep link handler**: `saafsafari://task/:id`, `saafsafari://territory/:h3`, `saafsafari://voucher/:id`
- **Push notification routing**: each notification type opens its matching screen

---

# PART C - Web vs mobile feature matrix

| Feature | Website | Mobile app |
|---|---|---|
| Public landing, FAQ, municipality pitch | Yes | No |
| Sign in (email OTP, Google) | Yes | Yes |
| Onboarding and home territory reveal | Yes | Yes |
| Home dashboard | Yes | Yes |
| Territory map | Yes | Yes |
| QR scanning | Webcam fallback | Primary (camera) |
| Photo proof | File upload | Camera only, before/after guide |
| Walk/cycle tracker | No | Yes [P2] |
| Wallet, coupons, vouchers | Yes | Yes |
| Leaderboards | Yes | Yes |
| Hotspot reporting | Yes | Yes (camera) |
| Saaf Mitra assistant | Yes [P2] | Yes [P2] |
| Collector mode (rotating QR, live location) | No | Yes |
| Municipal console (review, QR registry, reports) | Yes | No |
| Merchant coupon management | Yes | No |
| Push notifications | No (email only) | Yes |
| Offline cache | Limited | Yes |
