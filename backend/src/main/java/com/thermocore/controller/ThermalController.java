package com.thermocore.controller;

import com.thermocore.dto.SensorInputDto;
import com.thermocore.dto.ThermalAnalysisResultDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.SensorReading;
import com.thermocore.repository.SensorReadingRepository;
import com.thermocore.service.BatteryService;
import com.thermocore.thermal.ThermalIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/thermal")
public class ThermalController {

    private final ThermalIntelligenceService thermalService;
    private final BatteryService batteryService;
    private final SensorReadingRepository readingRepository;

    public ThermalController(ThermalIntelligenceService thermalService,
                             BatteryService batteryService,
                             SensorReadingRepository readingRepository) {
        this.thermalService = thermalService;
        this.batteryService = batteryService;
        this.readingRepository = readingRepository;
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
}
