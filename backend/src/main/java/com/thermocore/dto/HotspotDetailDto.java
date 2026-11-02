package com.thermocore.dto;

public class HotspotDetailDto {
    private Integer cellIndex;
    private String cellLabel;
    private Double temperature;
    private Double deltaFromAvg;
    private String severity; // MODERATE, CRITICAL
    private String recommendedAction;

    public HotspotDetailDto() {}

    public HotspotDetailDto(Integer cellIndex, String cellLabel, Double temperature, Double deltaFromAvg, String severity, String recommendedAction) {
        this.cellIndex = cellIndex;
        this.cellLabel = cellLabel;
        this.temperature = temperature;
        this.deltaFromAvg = deltaFromAvg;
        this.severity = severity;
        this.recommendedAction = recommendedAction;
    }

    public Integer getCellIndex() { return cellIndex; }
    public void setCellIndex(Integer cellIndex) { this.cellIndex = cellIndex; }

    public String getCellLabel() { return cellLabel; }
    public void setCellLabel(String cellLabel) { this.cellLabel = cellLabel; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getDeltaFromAvg() { return deltaFromAvg; }
    public void setDeltaFromAvg(Double deltaFromAvg) { this.deltaFromAvg = deltaFromAvg; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
