package com.thermocore.controller;

import com.thermocore.dto.SensorInputDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.CellTemperature;
import com.thermocore.entity.SensorReading;
import com.thermocore.enums.SimulationScenario;
import com.thermocore.repository.CellTemperatureRepository;
import com.thermocore.repository.SensorReadingRepository;
import com.thermocore.service.BatteryService;
import com.thermocore.simulation.SensorSimulationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorReadingRepository readingRepository;
    private final CellTemperatureRepository cellRepository;
    private final BatteryService batteryService;
    private final SensorSimulationService simulationService;

    public SensorController(SensorReadingRepository readingRepository,
                            CellTemperatureRepository cellRepository,
                            BatteryService batteryService,
                            SensorSimulationService simulationService) {
        this.readingRepository = readingRepository;
        this.cellRepository = cellRepository;
        this.batteryService = batteryService;
        this.simulationService = simulationService;
    }

    @GetMapping("/latest")
    public ResponseEntity<List<SensorReading>> getLatestFleetReadings() {
        List<BatteryPack> packs = batteryService.getAllPacks();
        List<SensorReading> readings = packs.stream()
                .map(p -> readingRepository.findFirstByBatteryPackIdOrderByTimestampDesc(p.getId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
        return ResponseEntity.ok(readings);
    }

    @GetMapping("/latest/{batteryId}")
    public ResponseEntity<SensorReading> getLatestForBattery(@PathVariable Long batteryId) {
        return readingRepository.findFirstByBatteryPackIdOrderByTimestampDesc(batteryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{batteryId}")
    public ResponseEntity<Page<SensorReading>> getBatteryHistory(
            @PathVariable Long batteryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(readingRepository.findByBatteryPackIdOrderByTimestampDesc(batteryId, PageRequest.of(page, size)));
    }

    @GetMapping("/range/{batteryId}")
    public ResponseEntity<List<SensorReading>> getHistoryRange(
            @PathVariable Long batteryId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(readingRepository.findHistoricalRange(batteryId, start, end));
    }

    @GetMapping("/cells/{readingId}")
    public ResponseEntity<List<CellTemperature>> getCellTemperatures(@PathVariable Long readingId) {
        return ResponseEntity.ok(cellRepository.findBySensorReadingIdOrderByCellIndexAsc(readingId));
    }

    @PostMapping("/readings")
    public ResponseEntity<SensorReading> ingestSensorReading(@Valid @RequestBody SensorInputDto input) {
        BatteryPack pack = batteryService.getPackById(input.getBatteryPackId());
        SensorReading reading = simulationService.generateReadingForPack(pack, SimulationScenario.NORMAL_DRIVING);
        return new ResponseEntity<>(reading, HttpStatus.CREATED);
    }
}
