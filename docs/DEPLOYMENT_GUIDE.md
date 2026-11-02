# THERMOCORE — Complete Production Deployment Guide

**Project Title:** KJS-CES-02 – AI-Enabled Micro-channel Battery Thermal Management System for Electric Vehicles  
**Target Architecture:**
- **Frontend:** Vercel (React 18 + Vite + Tailwind CSS + Lucide + Recharts)
- **Backend:** Render (Java 21 + Spring Boot 3 + Docker / Native)
- **Database:** Supabase (Cloud PostgreSQL 15+ with SSL)

---

## 📋 Pre-Flight Checklist

All configuration files have been prepared and tested:
- ✅ `frontend/vercel.json`: Handles SPA HTML5 route rewrites and security headers.
- ✅ `frontend/src/api/client.js`: Dynamically consumes `VITE_API_URL` with automatic `/api` prefix fallback.
- ✅ `backend/Dockerfile`: Multi-stage Java 21 Temurin build with non-root security and dynamic `$PORT` binding.
- ✅ `render.yaml` & `backend/render.yaml`: Render Blueprint configuration for zero-setup deployment.
- ✅ `backend/src/main/resources/application-postgres.properties`: Environment-variable driven HikariCP connection to Supabase.
- ✅ `database/schema.sql`: Full DDL schema for PostgreSQL.

---

## STEP 1: Push Repository to GitHub

If you haven't yet pushed `thermocore` to your GitHub account:

1. Create a new repository on [GitHub](https://github.com/new), named e.g. `thermocore-ev-battery`. Keep it Public or Private.
2. In your terminal, navigate to the `thermocore` folder:
   ```bash
   cd c:\Users\Vipul\Downloads\wp\thermocore
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/thermocore-ev-battery.git
   git branch -M main
   git push -u origin main
   ```

---

## STEP 2: Database Configuration (Supabase PostgreSQL)

Your database is already configured and verified with Supabase! 

### Connection Parameters Reference:
- **Host / Pooler:** `aws-0-eu-north-1.pooler.supabase.com`
- **Port:** `5432`
- **Database Name:** `postgres`
- **User:** `postgres.taiaqrtkldbasxvqxhlj`
- **Password:** `Sarvesh@2004`
- **JDBC Connection String:**
  ```
  jdbc:postgresql://aws-0-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require
  ```

> **Note:** Spring Boot JPA `hibernate.ddl-auto=update` is already enabled. When the backend boots, it automatically creates and updates all tables (`thermocore_battery_packs`, `thermocore_sensor_readings`, `thermocore_cell_temperatures`, `thermocore_alerts`, `thermocore_recommendations`, `thermocore_simulation_sessions`, `thermocore_system_config`) and seeds 4 industrial EV battery packs (`BP-LFP-01`, `BP-NMC-02`, `BP-NMC-03`, `BP-SS-04`).

---

## STEP 3: Deploy Backend on Render

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`thermocore-ev-battery`).

### Option A: Using Docker (Recommended for 100% consistency)
- **Name:** `thermocore-backend`
- **Region:** Frankfurt (EU Central) or closest to Supabase region
- **Branch:** `main`
- **Root Directory:** *(leave blank if root, or set `backend` if deploying only the backend folder)*
  - If Root Directory is blank:
    - **Runtime:** `Docker`
    - **Dockerfile Path:** `backend/Dockerfile`
    - **Docker Context:** `backend`
  - If Root Directory is set to `backend`:
    - **Runtime:** `Docker`
    - **Dockerfile Path:** `Dockerfile`
    - **Docker Context:** `.`
- **Plan:** Free

### Option B: Using Render Native Java (Alternative)
- **Root Directory:** `backend`
- **Runtime:** `Java`
- **Build Command:** `./mvnw clean package -DskipTests`
- **Start Command:** `java -Dserver.port=$PORT -jar target/thermocore-backend-1.0.0.jar`

### Environment Variables on Render
Add the following in the **Environment** tab:

| Key | Value | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `postgres` | Activates PostgreSQL datasource profile |
| `DATABASE_URL` | `jdbc:postgresql://aws-0-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require` | Supabase JDBC URL |
| `DATABASE_USERNAME` | `postgres.taiaqrtkldbasxvqxhlj` | Supabase username |
| `DATABASE_PASSWORD` | `Sarvesh@2004` | Supabase password |

### Health Check Path
- **Health Check Path:** `/actuator/health`

Click **Create Web Service**.  
Once deployed, copy your Render Web Service URL (e.g. `https://thermocore-backend.onrender.com`).  
Verify by visiting `https://thermocore-backend.onrender.com/actuator/health` in your browser — it should return `{"status":"UP"}`!

---

## STEP 4: Deploy Frontend on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`thermocore-ev-battery`).
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. **Environment Variables**:
   Add this environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://thermocore-backend.onrender.com` *(Replace with your actual Render URL from Step 3)*
6. Click **Deploy**.

Within 60 seconds, your site will be live at `https://<your-project>.vercel.app`!

---

## STEP 5: End-to-End Verification

Once deployed:

1. **Dashboard Overview:** Open your Vercel URL. You should see 4 active battery packs, live average temperature, cooling system indicators, and the dark industrial Tesla-style UI.
2. **Live Sensor Simulation:** Go to **Thermal Simulator** (`/simulator`) or **Live Monitoring** (`/live`). Click **Start Simulation**. Observe individual cell temperatures, real-time coolant flow, and temperature gradients updating dynamically.
3. **What-If Scenarios:** Trigger an **Overheating** or **Coolant Pump Failure** scenario. Confirm that the Thermal Intelligence Engine detects high risk, marks cell hotspots, raises Critical Alerts in the **Alerts & Actions** page, and recommends cooling actions (e.g., *Ramp Coolant Flow to 100%*).
4. **OpenAPI / Swagger Documentation:** Visit `https://<your-render-url>/swagger-ui.html` to test all 25+ REST API endpoints directly.
