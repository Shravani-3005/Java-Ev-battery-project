package com.thermocore.repository;

import com.thermocore.entity.CellTemperature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CellTemperatureRepository extends JpaRepository<CellTemperature, Long> {
    List<CellTemperature> findBySensorReadingIdOrderByCellIndexAsc(Long sensorReadingId);
    List<CellTemperature> findBySensorReadingIdAndIsHotspotTrue(Long sensorReadingId);
}
