package com.thermocore.controller;

import com.thermocore.dto.DashboardSummaryDto;
import com.thermocore.entity.ThermalAlert;
import com.thermocore.service.AlertService;
import com.thermocore.service.AnalyticsService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AnalyticsService analyticsService;
    private final AlertService alertService;

    public DashboardController(AnalyticsService analyticsService, AlertService alertService) {
        this.analyticsService = analyticsService;
        this.alertService = alertService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/thermal-overview")
    public ResponseEntity<List<Map<String, Object>>> getThermalOverview(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(defaultValue = "30") int limit
    ) {
        return ResponseEntity.ok(analyticsService.getTemperatureOverview(batteryId, limit));
    }

    @GetMapping("/recent-alerts")
    public ResponseEntity<Page<ThermalAlert>> getRecentAlerts(@RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(alertService.getAlertsPage(0, size));
    }
}
