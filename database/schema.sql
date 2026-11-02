-- =========================================================================
-- THERMOCORE: EV Battery Thermal Intelligence & Monitoring System
-- Database Schema Script for PostgreSQL
-- =========================================================================

-- 1. Battery Packs
CREATE TABLE IF NOT EXISTS thermocore_battery_packs (
    id BIGSERIAL PRIMARY KEY,
    pack_code VARCHAR(50) UNIQUE NOT NULL,
    pack_name VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    chemistry VARCHAR(50) NOT NULL,
    capacity_kwh NUMERIC(8,2) NOT NULL,
    nominal_voltage NUMERIC(8,2) NOT NULL,
    cell_count INT NOT NULL DEFAULT 96,
    cooling_type VARCHAR(100) DEFAULT 'Micro-channel Liquid Cold Plate',
    max_safe_temp NUMERIC(5,2) DEFAULT 45.0,
    critical_temp NUMERIC(5,2) DEFAULT 55.0,
    status VARCHAR(30) DEFAULT 'NORMAL',
    installation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sensor Readings (Time-series observations)
CREATE TABLE IF NOT EXISTS thermocore_sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    battery_pack_id BIGINT NOT NULL REFERENCES thermocore_battery_packs(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    battery_temp NUMERIC(5,2) NOT NULL,
    min_cell_temp NUMERIC(5,2) NOT NULL,
    max_cell_temp NUMERIC(5,2) NOT NULL,
    temp_gradient NUMERIC(5,2) NOT NULL,
    voltage NUMERIC(6,2) NOT NULL,
    current NUMERIC(6,2) NOT NULL,
    coolant_inlet_temp NUMERIC(5,2) NOT NULL,
    coolant_outlet_temp NUMERIC(5,2) NOT NULL,
    coolant_flow_rate NUMERIC(5,2) NOT NULL,
    state_of_charge NUMERIC(5,2) NOT NULL,
    state_of_health NUMERIC(5,2) NOT NULL,
    calculated_heat_gen_w NUMERIC(8,2),
    c_rate NUMERIC(5,2),
    thermal_risk_score NUMERIC(5,2),
    thermal_risk_level VARCHAR(30) DEFAULT 'NORMAL',
    is_hotspot_detected BOOLEAN DEFAULT FALSE,
    test_scenario VARCHAR(100) DEFAULT 'Normal Driving'
);

-- 3. Individual Cell Temperatures
CREATE TABLE IF NOT EXISTS thermocore_cell_temperatures (
    id BIGSERIAL PRIMARY KEY,
    sensor_reading_id BIGINT NOT NULL REFERENCES thermocore_sensor_readings(id) ON DELETE CASCADE,
    cell_index INT NOT NULL,
    cell_label VARCHAR(20) NOT NULL,
    temperature NUMERIC(5,2) NOT NULL,
    is_hotspot BOOLEAN DEFAULT FALSE,
    delta_from_avg NUMERIC(5,2) NOT NULL
);

-- 4. Thermal Alerts
CREATE TABLE IF NOT EXISTS thermocore_thermal_alerts (
    id BIGSERIAL PRIMARY KEY,
    battery_pack_id BIGINT NOT NULL REFERENCES thermocore_battery_packs(id) ON DELETE CASCADE,
    sensor_reading_id BIGINT REFERENCES thermocore_sensor_readings(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- INFO, WARNING, DANGER, CRITICAL
    description TEXT NOT NULL,
    detected_parameter VARCHAR(50),
    observed_value VARCHAR(50),
    recommended_action TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    acknowledged_by VARCHAR(50),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cooling Recommendations
CREATE TABLE IF NOT EXISTS thermocore_cooling_recommendations (
    id BIGSERIAL PRIMARY KEY,
    battery_pack_id BIGINT NOT NULL REFERENCES thermocore_battery_packs(id) ON DELETE CASCADE,
    sensor_reading_id BIGINT REFERENCES thermocore_sensor_readings(id) ON DELETE SET NULL,
    urgency_level VARCHAR(20) NOT NULL, -- LOW, MODERATE, HIGH, EMERGENCY
    action_type VARCHAR(50) NOT NULL,
    target_coolant_flow_lpm NUMERIC(5,2),
    target_radiator_speed_percent INT,
    powertrain_derate_percent INT DEFAULT 0,
    recommendation_details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Simulation Sessions
CREATE TABLE IF NOT EXISTS thermocore_simulation_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    speed_multiplier NUMERIC(3,1) DEFAULT 1.0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for time-series and query performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_pack_time ON thermocore_sensor_readings(battery_pack_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cell_temps_reading ON thermocore_cell_temperatures(sensor_reading_id);
CREATE INDEX IF NOT EXISTS idx_alerts_pack_status ON thermocore_thermal_alerts(battery_pack_id, status);
