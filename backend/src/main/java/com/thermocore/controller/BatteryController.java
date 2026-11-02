package com.thermocore.controller;

import com.thermocore.entity.BatteryPack;
import com.thermocore.service.BatteryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batteries")
public class BatteryController {

    private final BatteryService batteryService;

    public BatteryController(BatteryService batteryService) {
        this.batteryService = batteryService;
    }

    @GetMapping
    public ResponseEntity<List<BatteryPack>> getAllBatteries(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(batteryService.searchPacks(search));
        }
        return ResponseEntity.ok(batteryService.getAllPacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatteryPack> getBatteryById(@PathVariable Long id) {
        return ResponseEntity.ok(batteryService.getPackById(id));
    }

    @PostMapping
    public ResponseEntity<BatteryPack> createBattery(@Valid @RequestBody BatteryPack pack) {
        return new ResponseEntity<>(batteryService.createPack(pack), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatteryPack> updateBattery(@PathVariable Long id, @Valid @RequestBody BatteryPack pack) {
        return ResponseEntity.ok(batteryService.updatePack(id, pack));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBattery(@PathVariable Long id) {
        batteryService.deletePack(id);
        return ResponseEntity.noContent().build();
    }
}
