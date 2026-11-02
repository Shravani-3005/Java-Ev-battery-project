package com.thermocore.controller;

import com.thermocore.entity.SystemConfig;
import com.thermocore.repository.SystemConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SystemConfigRepository repository;

    public SettingsController(SystemConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<SystemConfig> getSettings() {
        return ResponseEntity.ok(repository.findFirstByOrderByIdAsc().orElseGet(() -> repository.save(new SystemConfig())));
    }

    @PutMapping
    public ResponseEntity<SystemConfig> updateSettings(@RequestBody SystemConfig updated) {
        SystemConfig current = repository.findFirstByOrderByIdAsc().orElseGet(SystemConfig::new);
        current.setNormalThreshold(updated.getNormalThreshold());
        current.setModerateThreshold(updated.getModerateThreshold());
        current.setHighThreshold(updated.getHighThreshold());
        current.setCriticalThreshold(updated.getCriticalThreshold());
        current.setHotspotGradientThreshold(updated.getHotspotGradientThreshold());
        current.setSimulationTickSeconds(updated.getSimulationTickSeconds());
        current.setCoolantFluidType(updated.getCoolantFluidType());
        current.setAutoActuateCooling(updated.getAutoActuateCooling());
        current.setEmailNotificationsEnabled(updated.getEmailNotificationsEnabled());
        return ResponseEntity.ok(repository.save(current));
    }
}
