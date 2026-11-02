package com.thermocore.service;

import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.CoolingRecommendation;
import com.thermocore.enums.CoolingUrgency;
import com.thermocore.repository.CoolingRecommendationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RecommendationService {

    private final CoolingRecommendationRepository repository;

    public RecommendationService(CoolingRecommendationRepository repository) {
        this.repository = repository;
    }

    public List<CoolingRecommendation> getAllRecommendations() {
        return repository.findAll();
    }

    public Page<CoolingRecommendation> getRecommendationsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<CoolingRecommendation> getRecommendationsByPackId(Long packId) {
        return repository.findByBatteryPackIdOrderByTimestampDesc(packId);
    }

    public CoolingRecommendation getLatestRecommendation(Long packId) {
        return repository.findFirstByBatteryPackIdOrderByTimestampDesc(packId);
    }

    public CoolingRecommendation saveRecommendation(BatteryPack pack, Long readingId, CoolingUrgency urgency,
                                                    String actionType, Double flowRate, Integer radiatorSpeed,
                                                    Integer derate, String details) {
        CoolingRecommendation rec = new CoolingRecommendation();
        rec.setBatteryPack(pack);
        rec.setSensorReadingId(readingId);
        rec.setUrgencyLevel(urgency);
        rec.setActionType(actionType);
        rec.setTargetCoolantFlowLpm(flowRate);
        rec.setTargetRadiatorSpeedPercent(radiatorSpeed);
        rec.setPowertrainDeratePercent(derate != null ? derate : 0);
        rec.setRecommendationDetails(details);
        rec.setTimestamp(LocalDateTime.now());
        return repository.save(rec);
    }
}
