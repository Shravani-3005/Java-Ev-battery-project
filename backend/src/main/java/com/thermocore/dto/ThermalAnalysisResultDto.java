package com.thermocore.dto;

import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.ThermalRiskLevel;

import java.util.ArrayList;
import java.util.List;

public class ThermalAnalysisResultDto {

    private ThermalRiskLevel riskLevel;
    private Double riskScore; // 0 - 100
    private Double tempGradient; // Delta T = max - min
    private Boolean isHotspotDetected;
    private List<HotspotDetailDto> hotspots = new ArrayList<>();

    // Physics metrics
    private Double calculatedHeatGenWatts;
    private Double cRate;
    private Double coolantDeltaT; // Outlet - Inlet
    private String coolingSufficiencyStatus;

    // Recommendations & Actuation
    private Double recommendedCoolantFlowLpm;
    private Integer recommendedRadiatorSpeedPercent;
    private Integer powertrainDeratePercent;
    private String recommendedAction;
    private AlertSeverity alertSeverity;
    private Double estimatedSecondsToThreshold;

    private List<String> diagnostics = new ArrayList<>();

    public ThermalAnalysisResultDto() {}

    public ThermalRiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(ThermalRiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public Double getTempGradient() { return tempGradient; }
    public void setTempGradient(Double tempGradient) { this.tempGradient = tempGradient; }

    public Boolean getIsHotspotDetected() { return isHotspotDetected; }
    public void setIsHotspotDetected(Boolean isHotspotDetected) { this.isHotspotDetected = isHotspotDetected; }

    public List<HotspotDetailDto> getHotspots() { return hotspots; }
    public void setHotspots(List<HotspotDetailDto> hotspots) { this.hotspots = hotspots; }

    public Double getCalculatedHeatGenWatts() { return calculatedHeatGenWatts; }
    public void setCalculatedHeatGenWatts(Double calculatedHeatGenWatts) { this.calculatedHeatGenWatts = calculatedHeatGenWatts; }

    public Double getcRate() { return cRate; }
    public void setcRate(Double cRate) { this.cRate = cRate; }

    public Double getCoolantDeltaT() { return coolantDeltaT; }
    public void setCoolantDeltaT(Double coolantDeltaT) { this.coolantDeltaT = coolantDeltaT; }

    public String getCoolingSufficiencyStatus() { return coolingSufficiencyStatus; }
    public void setCoolingSufficiencyStatus(String coolingSufficiencyStatus) { this.coolingSufficiencyStatus = coolingSufficiencyStatus; }

    public Double getRecommendedCoolantFlowLpm() { return recommendedCoolantFlowLpm; }
    public void setRecommendedCoolantFlowLpm(Double recommendedCoolantFlowLpm) { this.recommendedCoolantFlowLpm = recommendedCoolantFlowLpm; }

    public Integer getRecommendedRadiatorSpeedPercent() { return recommendedRadiatorSpeedPercent; }
    public void setRecommendedRadiatorSpeedPercent(Integer recommendedRadiatorSpeedPercent) { this.recommendedRadiatorSpeedPercent = recommendedRadiatorSpeedPercent; }

    public Integer getPowertrainDeratePercent() { return powertrainDeratePercent; }
    public void setPowertrainDeratePercent(Integer powertrainDeratePercent) { this.powertrainDeratePercent = powertrainDeratePercent; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public AlertSeverity getAlertSeverity() { return alertSeverity; }
    public void setAlertSeverity(AlertSeverity alertSeverity) { this.alertSeverity = alertSeverity; }

    public Double getEstimatedSecondsToThreshold() { return estimatedSecondsToThreshold; }
    public void setEstimatedSecondsToThreshold(Double estimatedSecondsToThreshold) { this.estimatedSecondsToThreshold = estimatedSecondsToThreshold; }

    public List<String> getDiagnostics() { return diagnostics; }
    public void setDiagnostics(List<String> diagnostics) { this.diagnostics = diagnostics; }
}
