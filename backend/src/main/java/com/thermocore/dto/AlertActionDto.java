package com.thermocore.dto;

public class AlertActionDto {
    private String operatorName;
    private String resolutionNotes;

    public AlertActionDto() {}

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
