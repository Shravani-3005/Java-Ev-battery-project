package com.thermocore.repository;

import com.thermocore.entity.BatteryPack;
import com.thermocore.enums.BatteryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatteryPackRepository extends JpaRepository<BatteryPack, Long> {
    Optional<BatteryPack> findByPackCode(String packCode);
    List<BatteryPack> findByStatus(BatteryStatus status);
    List<BatteryPack> findByVehicleModelContainingIgnoreCaseOrPackNameContainingIgnoreCase(String vehicle, String name);
}
