# ⚡ THERMOCORE – Intelligent Battery Thermal Intelligence & Monitoring
### Institute Project Code: `KJS-CES-02` (Clean Energy & Mobility / Climate, Energy & Sustainability)
**Full Stack Development Laboratory (Java) | Course Code: `316P07L103` | AY 2026-27**  
**Department of Computer Engineering, K. J. Somaiya School of Engineering**  
**Team Members:** Shravani Mangale & Sarvesh  

---

## 📋 1. Project Overview & Objective (Phase 1, 2, 3 Complete)
High-performance Electric Vehicles (EVs) experience significant internal heat generation during sprint driving, hill climbing, and high-current DC fast charging. Without intelligent micro-channel thermal management, localized cell temperature variances lead to **thermal hotspots**, rapid capacity degradation, and catastrophic **thermal runaway**.

**THERMOCORE** is an industrial-grade EV battery thermal intelligence and monitoring platform implementing:
1. **Fleet Battery Asset Management:** Multi-chemistry pack configurations (Lithium-Ion NMC, LFP, Solid-State).
2. **Realistic Sensor Simulation System:** Real-time telemetry streaming of battery pack parameters (temps, voltage, current, coolant flow, inlet/outlet temps, SOC, SOH, 24-cell physical matrices).
3. **Physics-Informed Thermal Risk Engine (Phase 2):** Multi-factor risk calculation ($0-100$), Joulean heat generation ($P = I^2R$), inter-cell gradient ($\Delta T = T_{max} - T_{min}$), C-rate stress index, and micro-channel coolant sufficiency.
4. **Automated Cooling Directives & Persistence (Phase 2):** Automatically prescribes liquid pump flow rate (L/min) and writes diagnostic history to the database.
5. **Spring Security & JWT Authentication (Phase 3):** BCrypt password hashing, stateless JWT Bearer token generation, and role-protected operational routes.
6. **OpenAPI / Swagger UI Documentation (Phase 3):** Complete interactive API specification at `/swagger-ui.html` with Bearer token authorization support.
7. **Interactive What-If Sandbox:** Slider-based simulation with instant AI inference, input validation error handling, and PostgreSQL persistence.

---

## 🏛️ 2. Technology Stack & Architecture

```text
┌────────────────────────────────────────────────────────┐
│             React 18 + Vite (Port 5174)                │
│  - Tailwind CSS + Lucide Icons + Recharts              │
│  - JWT Bearer Token Storage & Header Injection         │
│  - 9 Modules: Dashboard, Packs, Live, Hotspot, Sim... │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON APIs (Port 8082)
                            │ Bearer <JWT_TOKEN>
┌───────────────────────────▼────────────────────────────┐
│          Java 21 + Spring Boot 3 (Port 8082)           │
│  - Spring Security 6 + JJWT (Stateless Auth Filter)    │
│  - Spring Web Controllers + Input Validation DTOs      │
│  - Spring Data JPA (Hibernate ORM)                     │
│  - Physics & Thermal Intelligence Rule-Engine          │
│  - Springdoc OpenAPI 3 / Swagger UI with Bearer Auth   │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Connection
┌───────────────────────────▼────────────────────────────┐
│         PostgreSQL Database (Supabase Cloud)           │
│  - Tables: battery_packs, sensor_readings, users,      │
│    thermocore_ai_evaluations, alerts, recommendations  │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 3. Security & Authentication Specification (Phase 3)

The application implements Spring Security stateless authentication with signed HMAC-SHA256 JWT tokens.

### Pre-Configured Operator & Admin Credentials:
| Username | Password | Role | Permissions |
|---|---|---|---|
| `operator` | `operator123` | `ROLE_OPERATOR` | Execute AI Diagnostics, Register Packs, Acknowledge Alerts |
| `admin` | `admin123` | `ROLE_ADMIN` | Full System Access |

### Protected vs Public Routes:
- **Public Routes:**
  - `POST /api/auth/login`, `POST /api/auth/register`
  - `GET /swagger-ui/**`, `GET /v3/api-docs/**`, `GET /swagger-ui.html`
  - `GET /api/dashboard/**`, `GET /api/batteries`, `GET /api/sensors/**` (Read-only monitoring)
- **Protected Routes (Requires `Authorization: Bearer <TOKEN>`):**
  - `POST /api/thermal/evaluate` (Phase 2 Intelligent Diagnostic Evaluation)
  - `POST /api/batteries`, `PUT /api/batteries/{id}`, `DELETE /api/batteries/{id}`
  - `PUT /api/alerts/{id}/resolve`

---

## 🚀 4. Execution & Quick-Start Guide

### Prerequisites
- Java Development Kit (JDK 21 or 17+)
- Apache Maven 3.8+
- Node.js 18+ and npm

### Step 1: Start the Spring Boot Backend (Port 8082)
```powershell
cd backend
./mvnw spring-boot:run
```
*(Runs against cloud PostgreSQL or offline H2 fallback)*

### Step 2: Start the React Frontend (Port 5174)
```powershell
cd frontend
npm install
npm run dev
```

### Access URLs:
- **Web Application:** `http://localhost:5174` (or deployed at `https://java-ev-battery-project.vercel.app`)
- **Swagger UI (Interactive API Docs):** `http://localhost:8082/swagger-ui.html`
- **OpenAPI JSON Spec:** `http://localhost:8082/v3/api-docs`

---

## 📡 5. Key REST API Endpoints & Verification

| Endpoint | Method | Security | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user and receive JWT Bearer token |
| `/api/auth/register` | `POST` | Public | Register new operator account |
| `/api/auth/me` | `GET` | Bearer JWT | Returns current authenticated user profile |
| `/api/thermal/evaluate` | `POST` | Bearer JWT | Phase 2 Intelligent Diagnostic evaluation & DB save |
| `/api/thermal/evaluations` | `GET` | Public | Historical persisted evaluations list |
| `/api/batteries` | `GET` | Public | List all battery packs |
| `/api/batteries` | `POST` | Bearer JWT | Register a new EV battery pack |
| `/api/dashboard/summary` | `GET` | Public | High-level fleet KPIs |

---

## 🧪 6. Final Evaluation Test Cases

### 1. Successful End-to-End Workflow:
1. Log in via `POST /api/auth/login` with `operator` / `operator123` to obtain token.
2. Open **Thermal Simulator**, adjust sliders, click **"Run & Persist AI Thermal Diagnostic"**.
3. Result displays risk score and stores record into PostgreSQL.

### 2. Validation / Failure Handling Case:
1. Send `POST /api/thermal/evaluate` with `maxCellTemp < minCellTemp` (e.g. $T_{\max} = 20^\circ\text{C}, T_{\min} = 40^\circ\text{C}$).
2. System returns **`400 Bad Request`**: *"Peak cell temperature cannot be lower than minCellTemp"*.

### 3. Security Unauthorized Access Case:
1. Call `POST /api/thermal/evaluate` without the `Authorization` header.
2. System returns **`403 Forbidden`** / **`401 Unauthorized`**.
3. Re-try with `Authorization: Bearer <VALID_JWT>` $\to$ Returns **`200 OK`**.
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router DOM |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Spring Validation |
| **Database** | PostgreSQL (Primary) / Persistent H2 (Fallback Profile) |
| **API Docs** | Springdoc OpenAPI / Swagger UI 2.6.0 |
| **Architecture** | Layered Enterprise Architecture (Controller &rarr; Service &rarr; Repository &rarr; Entity) |

---

## 🧠 3. Physics & AI Thermal Intelligence Engine (`KJS-CES-02`)

The thermal analysis service models micro-channel battery thermodynamics:
1. **Inter-Cell Thermal Gradient ($\Delta T$):**
   $$\Delta T = T_{max} - T_{min}$$
   - If $\Delta T \ge 5.0^\circ\text{C}$: Flagged as localized hotspot.
   - If $\Delta T \ge 8.0^\circ\text{C}$: Severe non-uniform thermal distribution.
2. **Joulean & Polarization Heat Generation ($W$):**
   $$Q = I^2 \cdot R_{pack} + |I| \cdot 1.5$$
3. **C-Rate Stress Index:**
   $$C = \frac{|I|}{\text{Pack Capacity (Ah)}}$$
4. **Coolant Heat Absorption:**
   $$\Delta T_{coolant} = T_{outlet} - T_{inlet}$$
5. **Classification & Actuation Hierarchy:**
   - **`NORMAL` (Risk < 35):** Passive Eco circulation ($1.5\text{ L/min}$), 25% Radiator duty, 0% Derate.
   - **`MODERATE` (Risk 35 - 55):** Moderate Pump ($4.5\text{ L/min}$), 50% Radiator duty, 0% Derate.
   - **`HIGH` (Risk 55 - 80):** Turbo Micro-channel Boost ($8.5\text{ L/min}$), 85% Radiator duty, 35% Powertrain Derate.
   - **`CRITICAL` (Risk > 80 or $T_{max} \ge 55^\circ\text{C}$):** Emergency Contactor Isolation, Max Turbo Flush ($12.0\text{ L/min}$), 100% Fan, Evacuation advisory.

---

## 🚀 4. Execution & Quick-Start Guide

### Prerequisites
- Java Development Kit (JDK 21 or 17+)
- Apache Maven 3.8+
- Node.js 18+ and npm

### Step 1: Start the Spring Boot Backend (Port 8082)
```powershell
cd thermocore/backend
mvn spring-boot:run
```
*Note: The backend automatically connects to the configured PostgreSQL database (or runs with `-Dspring-boot.run.profiles=h2` for offline H2 mode).*

### Step 2: Start the React Frontend (Port 5174)
```powershell
cd thermocore/frontend
npm run dev
```

### Access Points
- **THERMOCORE Dashboard:** `http://localhost:5174`
- **Swagger OpenAPI Documentation:** `http://localhost:8082/swagger-ui.html`
- **Actuator Health Endpoint:** `http://localhost:8082/actuator/health`

---

## 📡 5. REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard/summary` | `GET` | Fleet KPIs, status distribution, and cooling efficiency |
| `/api/dashboard/thermal-overview` | `GET` | Historical temperature curves for main dashboard |
| `/api/batteries` | `GET`, `POST` | List all battery packs or register a new one |
| `/api/batteries/{id}` | `GET`, `PUT`, `DELETE` | CRUD endpoints for single pack asset |
| `/api/sensors/latest` | `GET` | Most recent observations across entire active fleet |
| `/api/sensors/history/{id}` | `GET` | Paginated sensor observations for a pack |
| `/api/sensors/cells/{readingId}` | `GET` | 12-cell physical array temperatures for a reading |
| `/api/thermal/status/{id}` | `GET` | AI physics diagnostic report for a pack |
| `/api/thermal/analyze` | `POST` | What-If simulation inference endpoint |
| `/api/alerts` | `GET` | Filterable thermal alerts by severity, pack, or status |
| `/api/alerts/{id}/acknowledge` | `PUT` | Acknowledge alert workflow |
| `/api/alerts/{id}/resolve` | `PUT` | Resolve alert with operator remarks |
| `/api/recommendations` | `GET` | Stored micro-channel cooling directives |
| `/api/simulation/status` | `GET` | Status of sensor simulation thread |
| `/api/simulation/scenario` | `POST` | Inject edge-case scenario (e.g. `COOLANT_PUMP_FAILURE`) |
| `/api/simulation/pause` / `resume` | `POST` | Pause or resume live sensor generation |
| `/api/settings` | `GET`, `PUT` | Configure thermal thresholds and simulation rate |
