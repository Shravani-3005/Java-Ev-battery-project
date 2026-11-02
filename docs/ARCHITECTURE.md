# THERMOCORE Architecture & Design Documentation
**Project Code:** KJS-CES-02  
**Vertical:** Clean Energy & Mobility / Climate, Energy, & Sustainability

## 1. Architectural Philosophy
THERMOCORE implements an automotive-grade, layered micro-channel battery thermal management platform.

### Layer Separation
1. **Presentation Layer (React 18 + Vite):**
   - Single Page Application with persistent dark-mode sidebar.
   - Recharts for high-frequency time-series graphs.
   - Strict palette: Matte Black `#0B0B0D`, Metallic Silver `#C0C0C0`, Safety Orange `#FF7900`.
2. **Application Layer (Spring Boot 3 + Java 21):**
   - REST Controllers exposing validated endpoints.
   - Separation of physics-based AI evaluation from data persistence.
   - Dynamic sensor simulator executing thread-safe background ticks.
3. **Data Layer (PostgreSQL):**
   - Normalized relational tables with foreign keys and time-series indexing.
   - Seed data for 4 EV battery architectures.

## 2. Thermal Physics Formulation
- **Joulean Heat:** $Q = I^2 \cdot R_{pack} + |I| \cdot 1.5$ (W)
- **Thermal Gradient:** $\Delta T = T_{max} - T_{min}$
- **C-Rate:** $C = \frac{|I|}{\text{Capacity (Ah)}}$
- **Cooling Delta:** $\Delta T_{coolant} = T_{out} - T_{in}$

## 3. Predefined Operating Scenarios
1. `NORMAL_DRIVING`: 35A current, ~30-33°C, balanced cooling.
2. `HIGH_LOAD_ACCELERATION`: 180-250A, rising ΔT, active cooling boost.
3. `RAPID_CHARGING`: 150-240A DC charging, high heat generation.
4. `HOT_WEATHER`: 42°C ambient environmental stress.
5. `COOLANT_FLOW_REDUCTION`: Flow throttled to < 1.0 L/min.
6. `COOLANT_PUMP_FAILURE`: 0 L/min flow rate, contactor isolation warning.
7. `CELL_OVERHEATING`: Isolated cell thermal runaway trigger (ΔT > 10°C).
