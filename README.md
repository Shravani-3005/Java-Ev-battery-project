# ⚡ THERMOCORE – Intelligent Battery Thermal Intelligence & Monitoring
### Institute Project Code: `KJS-CES-02` (Clean Energy & Mobility / Climate, Energy & Sustainability)
**Full Stack Development Laboratory (Java) | Course Code: `316P07L103`**  
**Engineering Theme:** *Matte Black (`#0B0B0D`) + Metallic Silver (`#C0C0C0`) + Safety Orange (`#FF7900`)*

---

## 📋 1. Project Overview & Objective
High-performance Electric Vehicles (EVs) experience significant internal heat generation during sprint driving, hill climbing, and high-current DC fast charging. Without intelligent micro-channel thermal management, localized cell temperature variances lead to **thermal hotspots**, rapid capacity degradation, and catastrophic **thermal runaway**.

**THERMOCORE** is an industrial-grade EV battery thermal intelligence and monitoring platform designed with an automotive engineering aesthetic. It provides:
1. **Fleet Battery Asset Management:** Multi-chemistry pack configurations (LFP, NMC 811, NMC 622, NCA, Solid-State).
2. **Realistic Sensor Simulation System:** Time-series streaming of battery pack parameters (temps, voltage, current, coolant flow, inlet/outlet temps, SOC, SOH, 12-cell physical matrices).
3. **Physics-Informed Thermal Risk Engine:** Multi-factor risk calculation ($0-100$), Joulean heat generation ($Q = I^2R$), inter-cell gradient ($\Delta T = T_{max} - T_{min}$), C-rate stress index, and micro-channel coolant sufficiency.
4. **Closed-Loop Actuation Directives:** Automatically prescribes liquid pump flow rate (L/min), radiator fan duty (%), and powertrain derating (%) to mitigate hotspots.
5. **Interactive What-If Sandbox:** Slider-based simulation with instant AI inference and database commit capabilities.
6. **Safety Alert & Resolution Workflow:** Lifecycle tracking for active alerts (`ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`).
7. **Historical Telemetry Database & Analytics:** Recharts time-series visualization with CSV export.

---

## 🏛️ 2. Technology Stack

```text
┌────────────────────────────────────────────────────────┐
│             React 18 + Vite (Port 5174)                │
│  - Tesla-style Industrial Matte Black Theme            │
│  - Tailwind CSS + Lucide Icons + Recharts              │
│  - 9 Complete Navigation Modules                       │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON APIs (Port 8082)
┌───────────────────────────▼────────────────────────────┐
│          Java 21 + Spring Boot 3 (Port 8082)           │
│  - Spring Web REST Controllers & DTOs                  │
│  - Spring Data JPA (Hibernate ORM)                     │
│  - Physics & Thermal Intelligence Rule-Engine          │
│  - Automated Real-Time Sensor Simulator Engine         │
│  - Springdoc OpenAPI / Swagger UI                      │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Connection
┌───────────────────────────▼────────────────────────────┐
│         PostgreSQL Database (Supabase Cloud)           │
│  - Tables: battery_packs, sensor_readings, cell_temps, │
│    thermal_alerts, cooling_recommendations, config     │
│  - H2 Database profile available for offline running   │
└────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|---|---|
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
