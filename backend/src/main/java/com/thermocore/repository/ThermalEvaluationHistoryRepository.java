package com.thermocore.repository;

import com.thermocore.entity.ThermalEvaluationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThermalEvaluationHistoryRepository extends JpaRepository<ThermalEvaluationHistory, Long> {
    List<ThermalEvaluationHistory> findTop20ByOrderByCreatedAtDesc();
    List<ThermalEvaluationHistory> findByBatteryPackIdOrderByCreatedAtDesc(Long batteryPackId);
    Page<ThermalEvaluationHistory> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
