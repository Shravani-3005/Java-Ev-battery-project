package com.thermocore.repository;

import com.thermocore.entity.ThermalAlert;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThermalAlertRepository extends JpaRepository<ThermalAlert, Long> {
    List<ThermalAlert> findByBatteryPackIdOrderByTimestampDesc(Long batteryPackId);
    List<ThermalAlert> findByStatusOrderByTimestampDesc(AlertStatus status);
    List<ThermalAlert> findBySeverityOrderByTimestampDesc(AlertSeverity severity);
    Page<ThermalAlert> findAllByOrderByTimestampDesc(Pageable pageable);
    long countByStatus(AlertStatus status);
    long countBySeverityAndStatus(AlertSeverity severity, AlertStatus status);
}
