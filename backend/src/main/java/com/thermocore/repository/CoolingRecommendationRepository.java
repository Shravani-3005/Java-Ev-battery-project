package com.thermocore.repository;

import com.thermocore.entity.CoolingRecommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoolingRecommendationRepository extends JpaRepository<CoolingRecommendation, Long> {
    List<CoolingRecommendation> findByBatteryPackIdOrderByTimestampDesc(Long batteryPackId);
    Page<CoolingRecommendation> findAllByOrderByTimestampDesc(Pageable pageable);
    CoolingRecommendation findFirstByBatteryPackIdOrderByTimestampDesc(Long batteryPackId);
}
