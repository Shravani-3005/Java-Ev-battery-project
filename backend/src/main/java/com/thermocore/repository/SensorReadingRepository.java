package com.thermocore.repository;

import com.thermocore.entity.SensorReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByBatteryPackIdOrderByTimestampDesc(Long batteryPackId);

    Page<SensorReading> findByBatteryPackIdOrderByTimestampDesc(Long batteryPackId, Pageable pageable);

    Optional<SensorReading> findFirstByBatteryPackIdOrderByTimestampDesc(Long batteryPackId);

    @Query("SELECT r FROM SensorReading r WHERE r.batteryPack.id = :packId AND r.timestamp BETWEEN :start AND :end ORDER BY r.timestamp ASC")
    List<SensorReading> findHistoricalRange(
            @Param("packId") Long packId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT r FROM SensorReading r WHERE r.batteryPack.id = :packId ORDER BY r.timestamp DESC LIMIT :limit")
    List<SensorReading> findRecentReadings(@Param("packId") Long packId, @Param("limit") int limit);

    @Query("SELECT AVG(r.batteryTemp) FROM SensorReading r WHERE r.timestamp >= :since")
    Double getFleetAvgTemp(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(r.coolantInletTemp) FROM SensorReading r WHERE r.timestamp >= :since")
    Double getFleetAvgInletTemp(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(r.coolantOutletTemp) FROM SensorReading r WHERE r.timestamp >= :since")
    Double getFleetAvgOutletTemp(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(r.coolantFlowRate) FROM SensorReading r WHERE r.timestamp >= :since")
    Double getFleetAvgFlowRate(@Param("since") LocalDateTime since);
}
