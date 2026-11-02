package com.thermocore.service;

import com.thermocore.entity.BatteryPack;
import com.thermocore.enums.BatteryStatus;
import com.thermocore.exception.ResourceNotFoundException;
import com.thermocore.repository.BatteryPackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BatteryService {

    private final BatteryPackRepository repository;

    public BatteryService(BatteryPackRepository repository) {
        this.repository = repository;
    }

    public List<BatteryPack> getAllPacks() {
        return repository.findAll();
    }

    public BatteryPack getPackById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Battery Pack not found with ID: " + id));
    }

    public BatteryPack getPackByCode(String code) {
        return repository.findByPackCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Battery Pack not found with Code: " + code));
    }

    public BatteryPack createPack(BatteryPack pack) {
        if (pack.getStatus() == null) pack.setStatus(BatteryStatus.NORMAL);
        return repository.save(pack);
    }

    public BatteryPack updatePack(Long id, BatteryPack updated) {
        BatteryPack existing = getPackById(id);
        existing.setPackName(updated.getPackName());
        existing.setVehicleModel(updated.getVehicleModel());
        existing.setChemistry(updated.getChemistry());
        existing.setCapacityKWh(updated.getCapacityKWh());
        existing.setNominalVoltage(updated.getNominalVoltage());
        existing.setCellCount(updated.getCellCount());
        existing.setCoolingType(updated.getCoolingType());
        existing.setMaxSafeTemp(updated.getMaxSafeTemp());
        existing.setCriticalTemp(updated.getCriticalTemp());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public void deletePack(Long id) {
        BatteryPack existing = getPackById(id);
        repository.delete(existing);
    }

    public List<BatteryPack> searchPacks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return repository.findAll();
        }
        return repository.findByVehicleModelContainingIgnoreCaseOrPackNameContainingIgnoreCase(query, query);
    }

    public void updatePackStatus(Long id, BatteryStatus status) {
        BatteryPack pack = getPackById(id);
        pack.setStatus(status);
        repository.save(pack);
    }
}
