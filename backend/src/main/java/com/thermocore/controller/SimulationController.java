package com.thermocore.controller;

import com.thermocore.enums.SimulationScenario;
import com.thermocore.simulation.SensorSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SensorSimulationService simulationService;

    public SimulationController(SensorSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> map = new HashMap<>();
        map.put("isRunning", simulationService.isRunning());
        map.put("isPaused", simulationService.isPaused());
        map.put("activeScenario", simulationService.getActiveScenario());
        map.put("speedMultiplier", simulationService.getSpeedMultiplier());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> start() {
        simulationService.startSimulation();
        return getStatus();
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stop() {
        simulationService.stopSimulation();
        return getStatus();
    }

    @PostMapping("/pause")
    public ResponseEntity<Map<String, Object>> pause() {
        simulationService.pauseSimulation();
        return getStatus();
    }

    @PostMapping("/resume")
    public ResponseEntity<Map<String, Object>> resume() {
        simulationService.resumeSimulation();
        return getStatus();
    }

    @PostMapping("/scenario")
    public ResponseEntity<Map<String, Object>> setScenario(@RequestParam SimulationScenario scenario) {
        simulationService.setScenario(scenario);
        return getStatus();
    }

    @PostMapping("/speed")
    public ResponseEntity<Map<String, Object>> setSpeed(@RequestParam double speed) {
        simulationService.setSpeedMultiplier(speed);
        return getStatus();
    }

    @PostMapping("/tick")
    public ResponseEntity<Map<String, Object>> manualTick() {
        simulationService.executeSimulationTick();
        return getStatus();
    }
}
