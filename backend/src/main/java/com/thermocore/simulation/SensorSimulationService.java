package com.thermocore.simulation;

import com.thermocore.dto.SensorInputDto;
import com.thermocore.dto.ThermalAnalysisResultDto;
import com.thermocore.entity.*;
import com.thermocore.enums.*;
import com.thermocore.repository.*;
import com.thermocore.service.AlertService;
import com.thermocore.service.RecommendationService;
import com.thermocore.thermal.ThermalIntelligenceService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
@EnableScheduling
public class SensorSimulationService {

    private final BatteryPackRepository packRepository;
    private final SensorReadingRepository readingRepository;
    private final CellTemperatureRepository cellRepository;
    private final ThermalIntelligenceService thermalService;
    private final AlertService alertService;
    private final RecommendationService recommendationService;
    private final SimulationSessionRepository sessionRepository;

    private final AtomicBoolean isRunning = new AtomicBoolean(true);
    private final AtomicBoolean isPaused = new AtomicBoolean(false);
    private final AtomicReference<SimulationScenario> activeScenario = new AtomicReference<>(SimulationScenario.NORMAL_DRIVING);
    private double speedMultiplier = 1.0;
    private final Random random = new Random();

    public SensorSimulationService(BatteryPackRepository packRepository,
                                   SensorReadingRepository readingRepository,
                                   CellTemperatureRepository cellRepository,
                                   ThermalIntelligenceService thermalService,
                                   AlertService alertService,
                                   RecommendationService recommendationService,
                                   SimulationSessionRepository sessionRepository) {
        this.packRepository = packRepository;
        this.readingRepository = readingRepository;
        this.cellRepository = cellRepository;
        this.thermalService = thermalService;
        this.alertService = alertService;
        this.recommendationService = recommendationService;
        this.sessionRepository = sessionRepository;
    }

    public boolean isRunning() { return isRunning.get(); }
    public boolean isPaused() { return isPaused.get(); }
    public SimulationScenario getActiveScenario() { return activeScenario.get(); }
    public double getSpeedMultiplier() { return speedMultiplier; }

    public void startSimulation() {
        isRunning.set(true);
        isPaused.set(false);
    }

    public void stopSimulation() {
        isRunning.set(false);
    }

    public void pauseSimulation() {
        isPaused.set(true);
    }

    public void resumeSimulation() {
        isPaused.set(false);
    }

    public void setScenario(SimulationScenario scenario) {
        this.activeScenario.set(scenario);
    }

    public void setSpeedMultiplier(double speed) {
        this.speedMultiplier = Math.max(0.5, Math.min(5.0, speed));
    }

    @Scheduled(fixedRate = 3500)
    @Transactional
    public void executeSimulationTick() {
        if (!isRunning.get() || isPaused.get()) {
            return;
        }

        List<BatteryPack> packs = packRepository.findAll();
        if (packs.isEmpty()) return;

        SimulationScenario scenario = activeScenario.get();

        for (BatteryPack pack : packs) {
            generateReadingForPack(pack, scenario);
        }
    }

    @Transactional
    public SensorReading generateReadingForPack(BatteryPack pack, SimulationScenario scenario) {
        Optional<SensorReading> latestOpt = readingRepository.findFirstByBatteryPackIdOrderByTimestampDesc(pack.getId());
        double baseTemp = latestOpt.map(SensorReading::getBatteryTemp).orElse(30.0);
        double baseSoc = latestOpt.map(SensorReading::getStateOfCharge).orElse(82.0);

        double targetTemp;
        double currentA;
        double flowRate;
        double inletT;
        double outletT;
        double deltaTGradient;

        switch (scenario) {
            case HIGH_LOAD_ACCELERATION:
                currentA = 180.0 + random.nextDouble() * 70.0; // 180A - 250A
                targetTemp = Math.min(48.0, baseTemp + 0.8 * speedMultiplier);
                flowRate = 5.5 + random.nextDouble() * 2.0;
                inletT = 24.0 + random.nextDouble() * 1.5;
                outletT = inletT + 4.5 + random.nextDouble() * 2.0;
                deltaTGradient = 3.5 + random.nextDouble() * 2.5;
                baseSoc = Math.max(5.0, baseSoc - 0.25 * speedMultiplier);
                break;

            case RAPID_CHARGING:
                currentA = -(150.0 + random.nextDouble() * 80.0); // Negative for charging
                targetTemp = Math.min(47.0, baseTemp + 0.6 * speedMultiplier);
                flowRate = 6.0 + random.nextDouble() * 2.5;
                inletT = 23.0 + random.nextDouble() * 1.5;
                outletT = inletT + 5.0 + random.nextDouble() * 1.5;
                deltaTGradient = 4.0 + random.nextDouble() * 3.0;
                baseSoc = Math.min(99.0, baseSoc + 0.4 * speedMultiplier);
                break;

            case HOT_WEATHER:
                currentA = 60.0 + random.nextDouble() * 40.0;
                targetTemp = Math.min(49.0, baseTemp + 0.5 * speedMultiplier);
                flowRate = 4.0 + random.nextDouble() * 1.5;
                inletT = 36.0 + random.nextDouble() * 3.0; // Hot ambient cooling
                outletT = inletT + 3.0 + random.nextDouble() * 2.0;
                deltaTGradient = 3.0 + random.nextDouble() * 2.0;
                baseSoc = Math.max(5.0, baseSoc - 0.1 * speedMultiplier);
                break;

            case COOLANT_FLOW_REDUCTION:
                currentA = 90.0 + random.nextDouble() * 30.0;
                targetTemp = Math.min(52.0, baseTemp + 1.2 * speedMultiplier);
                flowRate = 0.8 + random.nextDouble() * 0.4; // Low flow
                inletT = 27.0 + random.nextDouble() * 2.0;
                outletT = inletT + 8.5 + random.nextDouble() * 3.0; // High absorption
                deltaTGradient = 5.5 + random.nextDouble() * 3.0;
                baseSoc = Math.max(5.0, baseSoc - 0.15 * speedMultiplier);
                break;

            case COOLANT_PUMP_FAILURE:
                currentA = 110.0 + random.nextDouble() * 40.0;
                targetTemp = Math.min(58.0, baseTemp + 1.8 * speedMultiplier);
                flowRate = 0.0; // Pump failed
                inletT = 32.0;
                outletT = 44.0;
                deltaTGradient = 8.5 + random.nextDouble() * 4.0;
                baseSoc = Math.max(5.0, baseSoc - 0.2 * speedMultiplier);
                break;

            case CELL_OVERHEATING:
                currentA = 80.0 + random.nextDouble() * 40.0;
                targetTemp = Math.min(56.0, baseTemp + 1.1 * speedMultiplier);
                flowRate = 3.5;
                inletT = 24.0;
                outletT = 30.0;
                deltaTGradient = 9.5 + random.nextDouble() * 3.5; // Massive hotspot
                baseSoc = Math.max(5.0, baseSoc - 0.1 * speedMultiplier);
                break;

            case NORMAL_DRIVING:
            default:
                currentA = 35.0 + random.nextDouble() * 30.0;
                // Gradually settle around 31-33°C
                targetTemp = baseTemp > 33.0 ? baseTemp - 0.4 : baseTemp + (random.nextDouble() - 0.45) * 0.3;
                targetTemp = Math.max(28.0, Math.min(35.0, targetTemp));
                flowRate = 2.2 + random.nextDouble() * 0.8;
                inletT = 22.0 + random.nextDouble() * 1.5;
                outletT = inletT + 2.5 + random.nextDouble() * 1.0;
                deltaTGradient = 1.2 + random.nextDouble() * 1.5;
                baseSoc = Math.max(5.0, baseSoc - 0.08 * speedMultiplier);
                break;
        }

        double maxCellT = Math.round((targetTemp + (deltaTGradient / 2.0)) * 10.0) / 10.0;
        double minCellT = Math.round((targetTemp - (deltaTGradient / 2.0)) * 10.0) / 10.0;
        double actualAvg = Math.round(targetTemp * 10.0) / 10.0;
        double voltage = Math.round((pack.getNominalVoltage() * (0.92 + (baseSoc / 100.0) * 0.16)) * 10.0) / 10.0;

        // Build sensor input
        SensorInputDto input = new SensorInputDto();
        input.setBatteryPackId(pack.getId());
        input.setBatteryTemp(actualAvg);
        input.setMinCellTemp(minCellT);
        input.setMaxCellTemp(maxCellT);
        input.setVoltage(voltage);
        input.setCurrent(Math.round(currentA * 10.0) / 10.0);
        input.setCoolantInletTemp(Math.round(inletT * 10.0) / 10.0);
        input.setCoolantOutletTemp(Math.round(outletT * 10.0) / 10.0);
        input.setCoolantFlowRate(Math.round(flowRate * 10.0) / 10.0);
        input.setStateOfCharge(Math.round(baseSoc * 10.0) / 10.0);
        input.setStateOfHealth(98.2);
        input.setTestScenario(scenario.name().replace('_', ' '));

        // Generate individual cell temperatures (12 representative cell blocks)
        List<Double> cellTemps = new ArrayList<>();
        int cellCount = 12;
        int hotspotIndex = (scenario == SimulationScenario.CELL_OVERHEATING || deltaTGradient >= 6.0) ? 6 : -1;

        for (int i = 0; i < cellCount; i++) {
            if (i == hotspotIndex) {
                cellTemps.add(maxCellT); // Peak hotspot cell
            } else {
                double jitter = (random.nextDouble() - 0.5) * (deltaTGradient * 0.6);
                double cellVal = Math.round(Math.max(minCellT, Math.min(maxCellT, actualAvg + jitter)) * 10.0) / 10.0;
                cellTemps.add(cellVal);
            }
        }
        input.setCustomCellTemperatures(cellTemps);

        // Run Thermal Intelligence Engine
        ThermalAnalysisResultDto analysis = thermalService.analyze(input, pack);

        // Create SensorReading Entity
        SensorReading reading = new SensorReading();
        reading.setBatteryPack(pack);
        reading.setTimestamp(LocalDateTime.now());
        reading.setBatteryTemp(actualAvg);
        reading.setMinCellTemp(minCellT);
        reading.setMaxCellTemp(maxCellT);
        reading.setTempGradient(analysis.getTempGradient());
        reading.setVoltage(voltage);
        reading.setCurrent(input.getCurrent());
        reading.setCoolantInletTemp(input.getCoolantInletTemp());
        reading.setCoolantOutletTemp(input.getCoolantOutletTemp());
        reading.setCoolantFlowRate(input.getCoolantFlowRate());
        reading.setStateOfCharge(input.getStateOfCharge());
        reading.setStateOfHealth(input.getStateOfHealth());
        reading.setCalculatedHeatGenW(analysis.getCalculatedHeatGenWatts());
        reading.setcRate(analysis.getcRate());
        reading.setThermalRiskScore(analysis.getRiskScore());
        reading.setThermalRiskLevel(analysis.getRiskLevel());
        reading.setIsHotspotDetected(analysis.getIsHotspotDetected());
        reading.setTestScenario(input.getTestScenario());

        SensorReading savedReading = readingRepository.save(reading);

        // Save Cell Temperatures
        for (int i = 0; i < cellTemps.size(); i++) {
            double cT = cellTemps.get(i);
            boolean isHot = (i == hotspotIndex) || (cT >= actualAvg + 3.5);
            CellTemperature ct = new CellTemperature(
                    savedReading,
                    i + 1,
                    "Cell-" + String.format("%02d", i + 1),
                    cT,
                    isHot,
                    Math.round((cT - actualAvg) * 10.0) / 10.0
            );
            cellRepository.save(ct);
        }

        // Update BatteryPack status based on analysis
        if (analysis.getRiskLevel() == ThermalRiskLevel.CRITICAL) {
            pack.setStatus(BatteryStatus.THERMAL_RUNAWAY);
        } else if (analysis.getRiskLevel() == ThermalRiskLevel.HIGH || analysis.getIsHotspotDetected()) {
            pack.setStatus(BatteryStatus.CRITICAL_HOTSPOT);
        } else if (analysis.getRiskLevel() == ThermalRiskLevel.MODERATE) {
            pack.setStatus(BatteryStatus.MODERATE_WARMING);
        } else {
            pack.setStatus(BatteryStatus.NORMAL);
        }
        packRepository.save(pack);

        // Generate Alert if condition warrants
        if (analysis.getAlertSeverity() == AlertSeverity.CRITICAL || analysis.getAlertSeverity() == AlertSeverity.DANGER) {
            alertService.createAlert(
                    pack,
                    savedReading.getId(),
                    analysis.getIsHotspotDetected() ? "HOTSPOT_DETECTED" : "ELEVATED_TEMPERATURE",
                    analysis.getAlertSeverity(),
                    String.join("; ", analysis.getDiagnostics()),
                    "MaxCellTemp",
                    maxCellT + "°C (ΔT: " + analysis.getTempGradient() + "°C)",
                    analysis.getRecommendedAction()
            );
        }

        // Store Cooling Recommendation in DB
        CoolingUrgency urgency = analysis.getRiskLevel() == ThermalRiskLevel.CRITICAL ? CoolingUrgency.EMERGENCY :
                analysis.getRiskLevel() == ThermalRiskLevel.HIGH ? CoolingUrgency.HIGH :
                        analysis.getRiskLevel() == ThermalRiskLevel.MODERATE ? CoolingUrgency.MODERATE : CoolingUrgency.LOW;

        recommendationService.saveRecommendation(
                pack,
                savedReading.getId(),
                urgency,
                analysis.getRecommendedAction(),
                analysis.getRecommendedCoolantFlowLpm(),
                analysis.getRecommendedRadiatorSpeedPercent(),
                analysis.getPowertrainDeratePercent(),
                String.join(" | ", analysis.getDiagnostics())
        );

        return savedReading;
    }
}
