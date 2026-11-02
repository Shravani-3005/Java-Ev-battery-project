package com.thermocore.thermal;

import com.thermocore.dto.HotspotDetailDto;
import com.thermocore.dto.SensorInputDto;
import com.thermocore.dto.ThermalAnalysisResultDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.SystemConfig;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.ThermalRiskLevel;
import com.thermocore.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ThermalIntelligenceService {

    private final SystemConfigRepository configRepository;
    private static final double INTERNAL_RESISTANCE_OHMS = 0.035;

    public ThermalIntelligenceService(SystemConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public ThermalAnalysisResultDto analyze(SensorInputDto input, BatteryPack pack) {
        SystemConfig config = configRepository.findFirstByOrderByIdAsc().orElseGet(SystemConfig::new);
        ThermalAnalysisResultDto result = new ThermalAnalysisResultDto();
        List<String> diagnostics = new ArrayList<>();

        double maxT = input.getMaxCellTemp() != null ? input.getMaxCellTemp() : 32.0;
        double minT = input.getMinCellTemp() != null ? input.getMinCellTemp() : 29.0;
        double avgT = input.getBatteryTemp() != null ? input.getBatteryTemp() : (maxT + minT) / 2.0;
        double currentA = input.getCurrent() != null ? input.getCurrent() : 0.0;
        double flowRate = input.getCoolantFlowRate() != null ? input.getCoolantFlowRate() : 2.5;
        double inletT = input.getCoolantInletTemp() != null ? input.getCoolantInletTemp() : 24.0;
        double outletT = input.getCoolantOutletTemp() != null ? input.getCoolantOutletTemp() : 27.0;

        double safeLimit = pack != null && pack.getMaxSafeTemp() != null ? pack.getMaxSafeTemp() : config.getHighThreshold();
        double critLimit = pack != null && pack.getCriticalTemp() != null ? pack.getCriticalTemp() : config.getCriticalThreshold();
        double capacityKWh = pack != null && pack.getCapacityKWh() != null ? pack.getCapacityKWh() : 50.0;
        double nominalV = pack != null && pack.getNominalVoltage() != null ? pack.getNominalVoltage() : 360.0;

        // 1. Inter-Cell Thermal Gradient
        double gradient = Math.max(0.0, maxT - minT);
        result.setTempGradient(Math.round(gradient * 100.0) / 100.0);
        boolean hotspotDetected = gradient >= config.getHotspotGradientThreshold();
        result.setIsHotspotDetected(hotspotDetected);

        // 2. Joulean Heat Generation (W)
        double heatGen = Math.round((Math.pow(currentA, 2) * INTERNAL_RESISTANCE_OHMS + Math.abs(currentA) * 1.5) * 10.0) / 10.0;
        result.setCalculatedHeatGenWatts(heatGen);

        // 3. C-Rate
        double capacityAh = (capacityKWh * 1000.0) / nominalV;
        double cRate = Math.round((Math.abs(currentA) / (capacityAh > 0 ? capacityAh : 100.0)) * 100.0) / 100.0;
        result.setcRate(cRate);

        // 4. Coolant Delta T
        double coolantDelta = Math.round((outletT - inletT) * 10.0) / 10.0;
        result.setCoolantDeltaT(coolantDelta);

        // 5. Multi-factor Risk Scoring (0 - 100)
        double riskScore = 0.0;

        // Absolute Temp Factor
        if (maxT <= config.getNormalThreshold()) {
            riskScore += (maxT / config.getNormalThreshold()) * 20.0;
        } else if (maxT <= safeLimit) {
            riskScore += 20.0 + ((maxT - config.getNormalThreshold()) / (safeLimit - config.getNormalThreshold())) * 30.0;
            diagnostics.add(String.format("Pack entering elevated thermal regime (Max: %.1f°C, Safe: %.1f°C)", maxT, safeLimit));
        } else if (maxT <= critLimit) {
            riskScore += 50.0 + ((maxT - safeLimit) / (critLimit - safeLimit)) * 35.0;
            diagnostics.add(String.format("HIGH WARNING: Pack temp %.1f°C exceeded safe limit %.1f°C!", maxT, safeLimit));
        } else {
            riskScore += 85.0 + Math.min(15.0, (maxT - critLimit) * 3.0);
            diagnostics.add(String.format("CRITICAL EMERGENCY: Max temp %.1f°C breached critical threshold %.1f°C!", maxT, critLimit));
        }

        // Gradient Factor
        if (gradient >= 8.0) {
            riskScore += 20.0;
            diagnostics.add(String.format("Severe localized hotspot detected: ΔT of %.1f°C across cells", gradient));
        } else if (gradient >= config.getHotspotGradientThreshold()) {
            riskScore += 12.0;
            diagnostics.add(String.format("Non-uniform thermal distribution detected: ΔT of %.1f°C", gradient));
        } else if (gradient >= 3.0) {
            riskScore += 4.0;
        }

        // C-Rate & Thermal Load Factor
        if (cRate >= 2.0 && maxT >= 38.0) {
            riskScore += 10.0;
            diagnostics.add(String.format("High charge/discharge stress (%.2f C) during elevated thermal conditions", cRate));
        }

        // Coolant Sufficiency Factor
        if (maxT > 40.0 && flowRate < 2.0) {
            riskScore += 15.0;
            result.setCoolingSufficiencyStatus("INSUFFICIENT_FLOW");
            diagnostics.add("Cooling system warning: Insufficient micro-channel coolant flow under thermal load");
        } else if (coolantDelta > 6.0) {
            result.setCoolingSufficiencyStatus("HIGH_THERMAL_ABSORPTION");
            diagnostics.add(String.format("Elevated coolant heat absorption: ΔT_coolant of %.1f°C", coolantDelta));
        } else {
            result.setCoolingSufficiencyStatus("ADEQUATE");
        }

        riskScore = Math.min(100.0, Math.max(0.0, Math.round(riskScore * 10.0) / 10.0));
        result.setRiskScore(riskScore);

        // 6. Classification & Cooling Actuation Recommendation
        if (riskScore >= 80.0 || maxT >= critLimit || gradient >= 8.5) {
            result.setRiskLevel(ThermalRiskLevel.CRITICAL);
            result.setAlertSeverity(AlertSeverity.CRITICAL);
            result.setRecommendedCoolantFlowLpm(12.0);
            result.setRecommendedRadiatorSpeedPercent(100);
            result.setPowertrainDeratePercent(60);
            result.setRecommendedAction("EMERGENCY_ISOLATION_AND_MAX_FLUSH");
            result.setEstimatedSecondsToThreshold(Math.max(10.0, (critLimit + 5.0 - maxT) * 15.0));
            diagnostics.add("ACTION REQUIRED: Open high-voltage contactors, engage 12 L/min emergency flush, and alert driver to evacuate safely.");
        } else if (riskScore >= 55.0 || maxT >= safeLimit || gradient >= 5.0) {
            result.setRiskLevel(ThermalRiskLevel.HIGH);
            result.setAlertSeverity(AlertSeverity.DANGER);
            result.setRecommendedCoolantFlowLpm(8.5);
            result.setRecommendedRadiatorSpeedPercent(85);
            result.setPowertrainDeratePercent(35);
            result.setRecommendedAction("TURBO_MICROCHANNEL_COOLING_AND_DERATE");
            result.setEstimatedSecondsToThreshold(Math.max(45.0, (critLimit - maxT) * 30.0));
            diagnostics.add("ACTION REQUIRED: Modulate micro-channel valve to 8.5 L/min, derate powertrain power by 35%, and engage radiator boost.");
        } else if (riskScore >= 35.0 || maxT >= config.getModerateThreshold() || gradient >= 3.5) {
            result.setRiskLevel(ThermalRiskLevel.MODERATE);
            result.setAlertSeverity(AlertSeverity.WARNING);
            result.setRecommendedCoolantFlowLpm(4.5);
            result.setRecommendedRadiatorSpeedPercent(50);
            result.setPowertrainDeratePercent(0);
            result.setRecommendedAction("MODERATE_PUMP_CIRCULATION");
            result.setEstimatedSecondsToThreshold(300.0);
            diagnostics.add("Advisory: Increasing micro-channel flow rate to 4.5 L/min to stabilize inter-cell thermal gradient.");
        } else {
            result.setRiskLevel(ThermalRiskLevel.NORMAL);
            result.setAlertSeverity(AlertSeverity.INFO);
            result.setRecommendedCoolantFlowLpm(1.5);
            result.setRecommendedRadiatorSpeedPercent(25);
            result.setPowertrainDeratePercent(0);
            result.setRecommendedAction("PASSIVE_ECO_CIRCULATION");
            result.setEstimatedSecondsToThreshold(9999.0);
            diagnostics.add("Normal thermal condition. Micro-channel cooling in eco-mode (1.5 L/min).");
        }

        // 7. Individual Cell Hotspot Mapping
        List<HotspotDetailDto> hotspotDetails = new ArrayList<>();
        if (input.getCustomCellTemperatures() != null && !input.getCustomCellTemperatures().isEmpty()) {
            List<Double> cellTemps = input.getCustomCellTemperatures();
            double cAvg = cellTemps.stream().mapToDouble(Double::doubleValue).average().orElse(avgT);
            for (int i = 0; i < cellTemps.size(); i++) {
                double cT = cellTemps.get(i);
                double delta = Math.round((cT - cAvg) * 10.0) / 10.0;
                if (cT >= safeLimit || delta >= 3.5) {
                    hotspotDetails.add(new HotspotDetailDto(
                            i + 1,
                            "Cell-" + String.format("%02d", i + 1),
                            cT,
                            delta,
                            cT >= critLimit ? "CRITICAL" : "MODERATE",
                            cT >= critLimit ? "Inspect cooling jacket contact and derate cell block" : "Increase localized cold-plate coolant flow"
                    ));
                }
            }
        }
        result.setHotspots(hotspotDetails);
        result.setDiagnostics(diagnostics);

        return result;
    }
}
