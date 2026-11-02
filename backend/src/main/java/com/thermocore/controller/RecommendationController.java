package com.thermocore.controller;

import com.thermocore.entity.CoolingRecommendation;
import com.thermocore.service.RecommendationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<Page<CoolingRecommendation>> getAllRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(recommendationService.getRecommendationsPage(page, size));
    }

    @GetMapping("/{batteryId}")
    public ResponseEntity<List<CoolingRecommendation>> getByBatteryId(@PathVariable Long batteryId) {
        return ResponseEntity.ok(recommendationService.getRecommendationsByPackId(batteryId));
    }

    @GetMapping("/{batteryId}/latest")
    public ResponseEntity<CoolingRecommendation> getLatestByBatteryId(@PathVariable Long batteryId) {
        CoolingRecommendation rec = recommendationService.getLatestRecommendation(batteryId);
        if (rec == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(rec);
    }
}
