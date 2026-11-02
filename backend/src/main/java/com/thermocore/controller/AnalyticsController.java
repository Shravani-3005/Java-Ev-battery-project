package com.thermocore.controller;

import com.thermocore.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/temperature")
    public ResponseEntity<List<Map<String, Object>>> getTemperatureSeries(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTemperatureOverview(batteryId, limit));
    }

    @GetMapping("/voltage")
    public ResponseEntity<List<Map<String, Object>>> getVoltageSeries(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTemperatureOverview(batteryId, limit));
    }

    @GetMapping("/current")
    public ResponseEntity<List<Map<String, Object>>> getCurrentSeries(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTemperatureOverview(batteryId, limit));
    }

    @GetMapping("/coolant")
    public ResponseEntity<List<Map<String, Object>>> getCoolantSeries(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTemperatureOverview(batteryId, limit));
    }
}
