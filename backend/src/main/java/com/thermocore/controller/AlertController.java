package com.thermocore.controller;

import com.thermocore.dto.AlertActionDto;
import com.thermocore.entity.ThermalAlert;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.AlertStatus;
import com.thermocore.service.AlertService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<?> getAlerts(
            @RequestParam(required = false) Long batteryId,
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (batteryId != null) {
            return ResponseEntity.ok(alertService.getAlertsByPackId(batteryId));
        }
        if (status != null) {
            return ResponseEntity.ok(alertService.getAlertsByStatus(status));
        }
        if (severity != null) {
            return ResponseEntity.ok(alertService.getAlertsBySeverity(severity));
        }
        Page<ThermalAlert> alertPage = alertService.getAlertsPage(page, size);
        return ResponseEntity.ok(alertPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThermalAlert> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<ThermalAlert> acknowledgeAlert(@PathVariable Long id, @RequestBody(required = false) AlertActionDto action) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id, action));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ThermalAlert> resolveAlert(@PathVariable Long id, @RequestBody(required = false) AlertActionDto action) {
        return ResponseEntity.ok(alertService.resolveAlert(id, action));
    }
}
