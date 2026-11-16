package com.thermocore.controller;

import com.thermocore.dto.SensorInputDto;
import com.thermocore.dto.ThermalAnalysisResultDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.SensorReading;
import com.thermocore.entity.ThermalEvaluationHistory;
import com.thermocore.repository.SensorReadingRepository;
import com.thermocore.repository.ThermalEvaluationHistoryRepository;
import com.thermocore.service.BatteryService;
import com.thermocore.thermal.ThermalIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/thermal")
public class ThermalController {

    private final ThermalIntelligenceService thermalService;
    private final BatteryService batteryService;
    private final SensorReadingRepository readingRepository;
    private final ThermalEvaluationHistoryRepository evaluationHistoryRepository;

    public ThermalController(ThermalIntelligenceService thermalService,
                             BatteryService batteryService,
                             SensorReadingRepository readingRepository,
                             ThermalEvaluationHistoryRepository evaluationHistoryRepository) {
        this.thermalService = thermalService;
        this.batteryService = batteryService;
        this.readingRepository = readingRepository;
        this.evaluationHistoryRepository = evaluationHistoryRepository;
    }

    @GetMapping("/status/{batteryId}")
    public ResponseEntity<ThermalAnalysisResultDto> getThermalStatus(@PathVariable Long batteryId) {
        BatteryPack pack = batteryService.getPackById(batteryId);
        Optional<SensorReading> latestOpt = readingRepository.findFirstByBatteryPackIdOrderByTimestampDesc(batteryId);

        SensorInputDto input = new SensorInputDto();
        input.setBatteryPackId(batteryId);

        if (latestOpt.isPresent()) {
            SensorReading r = latestOpt.get();
            input.setBatteryTemp(r.getBatteryTemp());
            input.setMaxCellTemp(r.getMaxCellTemp());
            input.setMinCellTemp(r.getMinCellTemp());
            input.setVoltage(r.getVoltage());
            input.setCurrent(r.getCurrent());
            input.setCoolantInletTemp(r.getCoolantInletTemp());
            input.setCoolantOutletTemp(r.getCoolantOutletTemp());
            input.setCoolantFlowRate(r.getCoolantFlowRate());
        }

        return ResponseEntity.ok(thermalService.analyze(input, pack));
    }

    @PostMapping("/analyze")
    public ResponseEntity<ThermalAnalysisResultDto> analyzeWhatIf(@RequestBody SensorInputDto input) {
        BatteryPack pack = null;
        if (input.getBatteryPackId() != null) {
            pack = batteryService.getPackById(input.getBatteryPackId());
        }
        return ResponseEntity.ok(thermalService.analyze(input, pack));
    }

    /**
     * Phase 2 Deliverable: Intelligent Feature Evaluation & Persistence Contract
     * POST /api/thermal/evaluate
     * Receives parameters, validates ranges, runs intelligent inference,
     * persists record to DB, and returns structured result.
     */
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAndPersist(@RequestBody SensorInputDto input) {
        // Validation check required by Phase 2 manual
        if (input.getMaxCellTemp() == null || input.getMinCellTemp() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_FAILED",
                "message", "Both 'maxCellTemp' and 'minCellTemp' are required fields."
            ));
        }

        if (input.getMaxCellTemp() < -50.0 || input.getMaxCellTemp() > 150.0 ||
            input.getMinCellTemp() < -50.0 || input.getMinCellTemp() > 150.0) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_FAILED",
                "message", "Cell temperatures must be between -50°C and 150°C."
            ));
        }

        if (input.getMaxCellTemp() < input.getMinCellTemp()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_FAILED",
                "message", "Peak cell temperature (maxCellTemp) cannot be lower than minCellTemp."
            ));
        }

        BatteryPack pack = null;
        if (input.getBatteryPackId() != null) {
            try {
                pack = batteryService.getPackById(input.getBatteryPackId());
            } catch (Exception ignored) {}
        }

        // Run intelligent inference model
        ThermalAnalysisResultDto analysis = thermalService.analyze(input, pack);

        // Persist to database
        ThermalEvaluationHistory history = new ThermalEvaluationHistory();
        history.setBatteryPack(pack);
        history.setPackCode(pack != null ? pack.getPackCode() : "PACK-SIM");
        history.setMaxCellTemp(input.getMaxCellTemp());
        history.setMinCellTemp(input.getMinCellTemp());
        history.setDeltaT(analysis.getTempGradient());
        history.setCurrentDraw(input.getCurrent() != null ? input.getCurrent() : 0.0);
        history.setVoltage(input.getVoltage() != null ? input.getVoltage() : 380.0);
        history.setCoolantFlowRate(input.getCoolantFlowRate() != null ? input.getCoolantFlowRate() : 2.5);

        history.setRiskLevel(analysis.getRiskLevel() != null ? analysis.getRiskLevel().name() : "NORMAL");
        history.setRiskScore(analysis.getRiskScore());
        history.setCalculatedHeatGenWatts(analysis.getCalculatedHeatGenWatts());
        history.setcRate(analysis.getcRate());
        history.setCoolingSufficiencyStatus(analysis.getCoolingSufficiencyStatus());
        history.setCoolingRecommendation(analysis.getRecommendedAction());
        history.setRecommendedFlowLpm(analysis.getRecommendedCoolantFlowLpm());

        String explanationText = analysis.getDiagnostics() != null && !analysis.getDiagnostics().isEmpty()
                ? String.join(" | ", analysis.getDiagnostics())
                : "Nominal thermal conditions within standard operational thresholds.";
        history.setExplanation(explanationText);
        history.setCreatedAt(LocalDateTime.now());

        ThermalEvaluationHistory saved = evaluationHistoryRepository.save(history);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("packCode", saved.getPackCode());
        response.put("riskLevel", saved.getRiskLevel());
        response.put("riskScore", saved.getRiskScore());
        response.put("tempGradient", saved.getDeltaT());
        response.put("calculatedHeatGenWatts", saved.getCalculatedHeatGenWatts());
        response.put("cRate", saved.getcRate());
        response.put("coolingSufficiencyStatus", saved.getCoolingSufficiencyStatus());
        response.put("coolingRecommendation", saved.getCoolingRecommendation());
        response.put("recommendedFlowLpm", saved.getRecommendedFlowLpm());
        response.put("explanation", saved.getExplanation());
        response.put("createdAt", saved.getCreatedAt());
        response.put("diagnostics", analysis.getDiagnostics());

        return ResponseEntity.ok(response);
    }

    /**
     * Phase 2 Deliverable: Get Persisted History
     * GET /api/thermal/evaluations
     */
    @GetMapping("/evaluations")
    public ResponseEntity<List<ThermalEvaluationHistory>> getEvaluationHistory(
            @RequestParam(required = false) Long batteryId) {
        if (batteryId != null) {
            return ResponseEntity.ok(evaluationHistoryRepository.findByBatteryPackIdOrderByCreatedAtDesc(batteryId));
        }
        return ResponseEntity.ok(evaluationHistoryRepository.findTop20ByOrderByCreatedAtDesc());
    }
}
