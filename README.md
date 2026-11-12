# AI-Based Real-Time Crop Image Analytics for Crop Insurance Claim Assessment (PMFBY)

A full-stack, enterprise-grade AI-powered web platform built for the **Pradhan Mantri Fasal Bima Yojana (PMFBY)** scheme. The platform bridges the trust deficit between insured farmers and insurance providers through automated cadastral geo-tagging, computer vision crop diagnostics (YOLOv8 & OpenCV), and cross-verification against IMD meteorological data.

---

## 🏛️ System Architecture Overview

The system operates across two dedicated, role-segregated portals:

1. **Farmer Self-Service Portal**
   - Aadhaar-linked OTP and password authentication.

   s
   - Sowing registration with cadastral survey numbers, GPS coordinates, and soil/irrigation metadata.
   - Real-time foliar imagery capture with EXIF geo-verification.
   - Automated AI disease detection and pest classification.
   - Quantitative damage severity estimation and instant loss intimation.
   - PFMS DBT (Direct Benefit Transfer) claim tracking with full milestone timeline.

2. **Insurance Officer & Surveyor Portal**
   - Role-Based Access Control (RBAC) with district scrutiny credentials.
   - Live analytics dashboard displaying pending claims queue, loss severity maps, and DBT disbursement metrics.
   - Algorithmic discrepancy detection between farmer claims and AI loss estimates.
   - Crop Cutting Experiment (CCE) field inspection scheduler.
   - Multi-tier claim approval/rejection with official remarks and PFMS settlement dispatches.

---

## 💻 Tech Stack

- **Frontend:** React.js 18, Tailwind CSS, Lucide React, Recharts, React Router v6, Vite
- **Backend:** Python FastAPI, SQLAlchemy ORM, Pydantic v2, Passlib (bcrypt), PyJWT (HS256)
- **Database:** MySQL 8.0 (with automated fallback to persistent SQLite `pmfby_crop.db`)
- **AI/CV Engine (Phase 4):** YOLOv8, PyTorch, OpenCV, IMD Agro-meteorological APIs

---

## 🗄️ Database Architecture (16 Tables)

1. `users` — Base authentication table (Farmer vs Officer roles, hashed passwords)
2. `farmers` — Farmer profile (Aadhaar masked, DBT bank account, IFSC, land size)
3. `officers` — Government officer profile (Official designation, zone jurisdiction)
4. `crops` — Sowing records (Khasra, survey numbers, GPS latitude/longitude, sowing date)
5. `insurance_policies` — Active PMFBY coverage details (Sum insured, premium, cut-off dates)
6. `crop_images` — Uploaded foliar telemetry with EXIF metadata and upload timestamps
7. `ai_analysis_reports` — Consolidated AI assessment (health score, damage %, recommendation)
8. `disease_detections` — Detected phytopathologies (Blight, Rust, Blast, Spot)
9. `pest_detections` — Detected entomological pests (Fall Armyworm, Aphids, Stem Borer)
10. `treatment_recommendations` — Chemical & organic agrochemical dosage prescriptions
11. `treatment_history` — Logged farmer remedial applications with efficacy ratings
12. `insurance_claims` — Claim lifecycle records (Cause of loss, claimed amount, status)
13. `claim_verifications` — Officer audit trail (Decision, approved amount, remarks)
14. `field_inspections` — CCE on-site inspection schedules and surveyor notes
15. `weather_records` — IMD Doppler precipitation, hail, and humidity sensor readings
16. `notifications` — Real-time farmer alerts (SMS/portal dispatch logs)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.9+** (Tested on Python 3.10 - 3.14)
- **Node.js 18+** and **npm**
- **MySQL 8.0** (Optional: SQLite auto-fallback engages automatically if MySQL is offline)

---

### Step 1: Backend Setup & Execution

1. Open a terminal and navigate to the project directory:
   ```bash
   cd AI_CROP_INSURANCE_PMFBY
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. (Optional) Configure MySQL database in `.env`:
   ```env
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/pmfby_crop_db
   ```
   *Note: If MySQL server is unreachable, the application automatically mounts a persistent SQLite engine `pmfby_crop.db` with identical schema and seeding.*

5. Run the FastAPI development server:
   ```bash
   python -m uvicorn backend.app.main:app --reload --port 8000
   ```
   The backend will start at: `http://localhost:8000`
   Interactive Swagger documentation: `http://localhost:8000/docs`

---

### Step 2: Frontend Setup & Execution

1. In a separate terminal, navigate to the `frontend` folder:
   ```bash
   cd AI_CROP_INSURANCE_PMFBY/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run at: `http://localhost:5173` (or `http://localhost:3000`)

---

## 🔑 Pre-Configured Demo Credentials

### 👨‍🌾 Farmer Account
- **Mobile Number:** `+91 98234 56789` (or `9823456789`)
- **Password:** `farmer123`
- **OTP (Demo):** `4819`
- **Farmer Name:** Rameshwar Singh Patel
- **Registered Parcel:** Sambhalkha, Gharaunda, Karnal, Haryana (5.4 Acres)

### 👮‍♂️ Insurance Scrutiny Officer Account
- **Officer ID:** `OFF-HR-402`
- **Password / Passkey:** `officer123`
- **Officer Name:** Dr. Vikramaditya Sharma
- **Jurisdiction:** District Scrutiny Officer, Karnal & Kurukshetra Zone

---

## 🧪 Automated Backend Test Suites

### 1. Core Platform & RBAC Tests (Phase 3)
```bash
python test_backend.py
```
*Tests 10 scenarios: Root, Health, Farmer Login, Profile, Crops, Policies, Officer Login, Dashboard Stats, RBAC 403 Forbidden enforcement, and Claim verification.*

### 2. Image Management, OpenCV Quality & GPS Test Suite (Phase 4)
```bash
python test_image_management.py
```
*Tests 11 scenarios:*
1. Farmer authentication and session issuance.
2. Officer authentication and scrutiny role verification.
3. Secure image upload with isolated physical filesystem storage.
4. OpenCV quality assessment (Blur detection via Laplacian variance, brightness, resolution ≥ 480p).
5. Duplicate image rejection via cryptographic SHA-256 hash match.
6. GPS Haversine distance verification & automatic flagging of out-of-bounds imagery (> 1000m from registered parcel).
7. Location comparison endpoint with legal evidence disclaimer.
8. Farmer "my-images" query with audit trail.
9. Officer queue retrieval with discrepancy metrics.
10. Officer verification decision (`VERIFIED`, `FLAGGED_LOCATION_MISMATCH`).
11. Officer recapture request with automated farmer in-app notification & RBAC enforcement (403 on unauthorized attempt).

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Service and subsystem health status | Public |
| `POST` | `/api/v1/auth/farmer/register` | Self-service farmer onboarding | Public |
| `POST` | `/api/v1/auth/farmer/login` | Mobile + OTP farmer login | Public |
| `POST` | `/api/v1/auth/officer/login` | Officer ID + passkey authentication | Public |
| `GET` | `/api/v1/auth/me` | Current authenticated session details | Bearer JWT |
| `GET` | `/api/v1/farmers/profile` | Farmer cadastral and DBT bank records | Farmer |
| `GET` | `/api/v1/farmers/policies` | Farmer insurance policy list | Farmer |
| `GET` | `/api/v1/crops` | List registered crops | Farmer / Officer |
| `POST` | `/api/v1/crops` | Register new sown crop parcel | Farmer |
| `POST` | `/api/v1/images/upload` | Secure foliar image upload + OpenCV quality + GPS | Farmer |
| `GET` | `/api/v1/images/my-images` | View authenticated farmer's uploaded images | Farmer |
| `GET` | `/api/v1/images/{id}` | Single image metadata record | Farmer / Officer |
| `GET` | `/api/v1/images/{id}/file` | Securely retrieve image binary file | Farmer / Officer |
| `GET` | `/api/v1/images/{id}/location` | Haversine distance vs registered crop parcel | Farmer / Officer |
| `DELETE`| `/api/v1/images/{id}` | Delete image (permitted when pending scrutiny) | Farmer / Officer |
| `GET` | `/api/v1/images/officer/queue` | Officer queue of all submitted images | Officer Only |
| `PUT` | `/api/v1/images/officer/{id}/verification` | Record officer verification decision | Officer Only |
| `POST` | `/api/v1/images/officer/{id}/request-recapture` | Dispatch recapture order to farmer | Officer Only |
| `GET` | `/api/v1/claims` | View insurance claim ledger | Farmer / Officer |
| `POST` | `/api/v1/claims` | Intimate new PMFBY crop loss claim | Farmer |
| `GET` | `/api/v1/officers/dashboard-stats`| Aggregated scrutiny and disbursement KPIs | Officer Only |
| `GET` | `/api/v1/officers/farmers` | List registered farmers in jurisdiction | Officer Only |
| `POST` | `/api/v1/officers/claims/{id}/verify` | Approve or reject claim with payout DBT | Officer Only |
| `POST` | `/api/v1/officers/inspections` | Schedule Crop Cutting Experiment (CCE) | Officer Only |
| `GET` | `/api/v1/officers/settlements` | PFMS DBT settlement audit trail | Officer Only |

