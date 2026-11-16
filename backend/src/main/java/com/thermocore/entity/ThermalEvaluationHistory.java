package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "thermocore_ai_evaluations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ThermalEvaluationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_pack_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BatteryPack batteryPack;

    private String packCode;

    // Inputs evaluated
    private Double maxCellTemp;
    private Double minCellTemp;
    private Double deltaT;
    private Double currentDraw;
    private Double voltage;
    private Double coolantFlowRate;

    // Model / Physics-based inference outputs
    private String riskLevel;
    private Double riskScore;
    private Double calculatedHeatGenWatts;
    private Double cRate;
    private String coolingSufficiencyStatus;
    private String coolingRecommendation;
    private Double recommendedFlowLpm;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public ThermalEvaluationHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BatteryPack getBatteryPack() { return batteryPack; }
    public void setBatteryPack(BatteryPack batteryPack) { this.batteryPack = batteryPack; }

    public String getPackCode() { return packCode; }
    public void setPackCode(String packCode) { this.packCode = packCode; }

    public Double getMaxCellTemp() { return maxCellTemp; }
    public void setMaxCellTemp(Double maxCellTemp) { this.maxCellTemp = maxCellTemp; }

    public Double getMinCellTemp() { return minCellTemp; }
    public void setMinCellTemp(Double minCellTemp) { this.minCellTemp = minCellTemp; }

    public Double getDeltaT() { return deltaT; }
    public void setDeltaT(Double deltaT) { this.deltaT = deltaT; }

    public Double getCurrentDraw() { return currentDraw; }
    public void setCurrentDraw(Double currentDraw) { this.currentDraw = currentDraw; }

    public Double getVoltage() { return voltage; }
    public void setVoltage(Double voltage) { this.voltage = voltage; }

    public Double getCoolantFlowRate() { return coolantFlowRate; }
    public void setCoolantFlowRate(Double coolantFlowRate) { this.coolantFlowRate = coolantFlowRate; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public Double getCalculatedHeatGenWatts() { return calculatedHeatGenWatts; }
    public void setCalculatedHeatGenWatts(Double calculatedHeatGenWatts) { this.calculatedHeatGenWatts = calculatedHeatGenWatts; }

    public Double getcRate() { return cRate; }
    public void setcRate(Double cRate) { this.cRate = cRate; }

    public String getCoolingSufficiencyStatus() { return coolingSufficiencyStatus; }
    public void setCoolingSufficiencyStatus(String coolingSufficiencyStatus) { this.coolingSufficiencyStatus = coolingSufficiencyStatus; }

    public String getCoolingRecommendation() { return coolingRecommendation; }
    public void setCoolingRecommendation(String coolingRecommendation) { this.coolingRecommendation = coolingRecommendation; }

    public Double getRecommendedFlowLpm() { return recommendedFlowLpm; }
    public void setRecommendedFlowLpm(Double recommendedFlowLpm) { this.recommendedFlowLpm = recommendedFlowLpm; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
