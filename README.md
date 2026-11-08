# 🍊 ORANGE PULP JUICE POINT – STUDENT DISCOUNT SCRATCH GAME

A complete, production-ready, mobile-first web application designed for **Orange Pulp Juice Point**.
College students scan a counter QR code, enter their college roll number, select 3 different mystery gift boxes from a 3×3 grid, scratch digital cards with realistic finger/mouse canvas erasing, and unlock a verified juice discount between 5% and 10%.

---

## 🥤 1. Core Game Rules & Mechanics

- **9 Mystery Boxes:** Arranged in a 3 × 3 grid.
- **3 Chances:** Each student gets exactly 3 chances to pick 3 distinct boxes.
- **Randomized Discount Distribution (5% to 10%):**
  - **5% OFF:** 2 boxes
  - **6% OFF:** 2 boxes
  - **7% OFF:** 2 boxes
  - **8% OFF:** 1 box
  - **9% OFF:** 1 box
  - **10% OFF:** 1 box
- **The Golden Rule:** Only the **third discount** decides the final applicable discount!
  - First chance: e.g. 5% (Not final)
  - Second chance: e.g. 8% (Not final)
  - Third chance: e.g. 7% (**FINAL APPLICABLE DISCOUNT = 7% OFF**)
  - *Never added or combined.*
- **Zero Pre-Registration Required:** Student roll numbers are normalized (`trim + uppercase`) and used as unique identity for the campaign.
- **Duplicate Prevention:** MongoDB compound unique index on `campaignId + rollNumber`.
- **Full Refresh / Session Recovery:** Page reloads or device changes restore saved progress instantly from the authoritative backend database.
- **Tamper-Proof:** Server-side discount assignment, signed JWT tokens, atomic selection updates, and rate limiting.

---

## 🛠️ 2. Technology Stack

- **Frontend:**
  - React 19 (TypeScript)
  - Vite
  - Tailwind CSS (Orange Pulp commercial brand theme)
  - Framer Motion (smooth mobile transitions & animations)
  - HTML5 Canvas (dual touch & pointer scratching)
  - canvas-confetti (celebration bursts)
  - Lucide React (commercial icons)
- **Backend:**
  - Node.js & Express.js (TypeScript)
  - Mongoose ODM & MongoDB Atlas (with in-memory fallback for local dev & testing)
  - Zod (runtime request validation)
  - Helmet & CORS (security headers)
  - express-rate-limit (abuse & brute-force defense)
  - jsonwebtoken (cryptographically signed participation tokens)
  - Node crypto (secure random reward codes & Fisher-Yates shuffle)
- **Testing:**
  - Jest & Supertest (14 automated test suites covering 3-chance lifecycle, concurrency, duplicate prevention, and tamper resistance)

---

## 📁 3. Project Directory Structure

```
orange/
├── backend/
│   ├── src/
│   │   ├── config/env.ts              # Zod-validated environment config
│   │   ├── db/
│   │   │   ├── connection.ts          # Mongoose with MongoMemoryServer fallback
│   │   │   └── models/
│   │   │       ├── Campaign.ts        # 9-box arrangement & discount configuration
│   │   │       └── Participation.ts   # Roll number unique compound index & rewards
│   │   ├── middleware/
│   │   │   ├── auth.ts                # Signed JWT participation token guard
│   │   │   ├── rateLimiter.ts         # IP and route rate limiting
│   │   │   ├── errorHandler.ts        # Centralized HTTP error handler
│   │   │   └── validation.ts          # Zod request validators
│   │   ├── controllers/
│   │   │   ├── student.controller.ts  # Roll number verification
│   │   │   └── game.controller.ts     # Game start, box listing, atomic selection, status
│   │   ├── services/
│   │   │   ├── campaign.service.ts    # Secure randomized box shuffling
│   │   │   ├── game.service.ts        # 3-chance business logic & atomic operations
│   │   │   └── token.service.ts       # Cryptographic JWT signing
│   │   ├── utils/
│   │   │   ├── crypto.ts              # Secure HMAC codes & Fisher-Yates shuffle
│   │   │   └── rollNumber.ts          # Roll number normalizer & regex validator
│   │   ├── types/index.ts             # Shared backend types
│   │   ├── app.ts                     # Express application configuration
│   │   └── server.ts                  # HTTP server entry point
│   ├── tests/
│   │   ├── student.test.ts            # Roll number validation & casing tests
│   │   ├── game.test.ts               # Critical 3-chance lifecycle & final discount calculation
│   │   ├── security.test.ts           # Token tampering & injection rejection tests
│   │   └── concurrency.test.ts        # Parallel race condition protection tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                # Fresh orange slice favicon
│   │   ├── orange-pulp-qr.png         # High-resolution printable counter QR code
│   │   └── orange-pulp-qr.svg         # Scalable vector QR code
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Brand header with roll badge
│   │   │   ├── Footer.tsx             # Commercial stall footer
│   │   │   ├── MysteryBox.tsx         # 3D interactive gift box
│   │   │   ├── ScratchCardCanvas.tsx  # Dual-touch mobile & desktop scratch canvas
│   │   │   ├── ProgressPills.tsx      # "Chance 1 of 3", "Chance 2 of 3", "Chance 3 of 3"
│   │   │   ├── PreviousRewardsList.tsx# Previous rounds history (clearly marked Not Applicable)
│   │   │   ├── JuiceMascot.tsx        # Brand SVG juice illustrations
│   │   │   └── ConfettiEffect.tsx     # Celebration confetti burst
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # "A Little Scratch. A Juicy Surprise!"
│   │   │   ├── RollNumberEntryPage.tsx# Normalized roll number input
│   │   │   ├── MysteryBoxesPage.tsx   # 3x3 interactive mystery grid
│   │   │   ├── ScratchCardPage.tsx    # Scratch card reveal screen
│   │   │   ├── ProgressPage.tsx       # Interim recap between rounds
│   │   │   ├── FinalResultPage.tsx    # "YOUR FINAL DISCOUNT: 7% OFF" + Cashier code
│   │   │   └── AlreadyCompletedPage.tsx# Read-only screen for returning students
│   │   ├── services/api.ts            # Fetch API client with automatic token attachment
│   │   ├── types/index.ts             # Frontend game interfaces
│   │   ├── App.tsx                    # Game state machine & session recovery
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── netlify.toml                   # Netlify redirect and security rules
│   └── .env.example
├── scripts/
│   └── generate-qr.js                 # Standalone script to generate stall QR code
├── render.yaml                        # Render deployment blueprint
├── package.json                       # Root monorepo orchestration scripts
└── README.md
```

---

## 🚀 4. Quick Start (Local Development)

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### A. Clone and Install Dependencies
```bash
# Clone repository
git clone <repo-url>
cd orange

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### B. Run Automated Tests
The backend features an integrated zero-config in-memory MongoDB runner. Tests run without needing a local MongoDB installation!
```bash
cd backend
npm test
```
*Expected: 4 passed test suites, 14 passed tests.*

### C. Start Local Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
Backend starts on `http://localhost:5000`. Health check available at `http://localhost:5000/api/health`.

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
Frontend opens on `http://localhost:5173`.

---

## 🍃 5. MongoDB Atlas Setup Guide

To connect the application to a cloud MongoDB Atlas database:

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Create a free **M0 Sandbox** cluster (e.g. in `AWS / Mumbai` or your closest region).
3. Under **Database Access**:
   - Create a database user (e.g. `orange_admin`) with a strong password.
   - Assign the **Read and write to any database** role.
4. Under **Network Access**:
   - Add an IP address rule: Click **Allow Access from Anywhere** (`0.0.0.0/0`) so Netlify/Render servers can communicate with the database.
5. In your cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection string.
   ```
   mongodb+srv://orange_admin:<password>@cluster0.mongodb.net/orange_pulp?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in `backend/.env` or in Render environment variables.

---

## 🌐 6. Production Deployment Guide

### A. Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service** -> Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A long random secure string>`
   - `CLIENT_URL`: `https://your-frontend-site.netlify.app`
   - `CAMPAIGN_ID`: `CAMP-ORANGE-2025`
5. Click **Deploy**. Note your live backend URL (e.g., `https://orange-pulp-backend.onrender.com`).

### B. Deploy Frontend to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project** -> Select your GitHub repository.
3. Configure settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://orange-pulp-backend.onrender.com/api`
5. Click **Deploy site**.
   *(The included `frontend/netlify.toml` automatically configures SPA routing redirects).*

---

## 📱 7. Generating Counter QR Codes

Once your frontend is deployed, generate printable QR codes for the Orange Pulp juice counter:

```bash
# Generate QR code for your live site
node scripts/generate-qr.js https://your-frontend-site.netlify.app
```

This creates:
- `frontend/public/orange-pulp-qr.png`: High-resolution 800×800 image ready for counter printing.
- `frontend/public/orange-pulp-qr.svg`: Scalable vector graphic for menu boards and posters.
- Renders an interactive ASCII QR code directly inside your terminal for instant phone testing!

---

## 🔒 8. Security & Business Verification

- **Authoritative Database:** The server controls all discounts, chance counting, and reward generation. Frontend state is purely visual.
- **Idempotency Protection:** Double-clicking boxes or repeated API calls return the saved reward rather than skipping chances.
- **Atomic Concurrency:** Concurrency barriers using atomic `$push`, `$inc`, and `$ne` eliminate simultaneous tab exploits.
- **Cashier Verification:** Final vouchers generate a cryptographically derived verification code (e.g. `OP-7-K89X24`) that encodes the roll number, discount, and timestamp for stall staff confirmation.

---

*🍊 Orange Pulp Juice Point — Fresh Juice, Pure Pulp!*
