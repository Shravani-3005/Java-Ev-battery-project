package com.thermocore.dto;

import com.thermocore.enums.SimulationScenario;

public class SimulationControlDto {
    private Boolean isRunning;
    private SimulationScenario scenario;
    private Double speedMultiplier;
    private Long targetBatteryPackId;

    public SimulationControlDto() {}

    public Boolean getIsRunning() { return isRunning; }
    public void setIsRunning(Boolean isRunning) { this.isRunning = isRunning; }

    public SimulationScenario getScenario() { return scenario; }
    public void setScenario(SimulationScenario scenario) { this.scenario = scenario; }

    public Double getSpeedMultiplier() { return speedMultiplier; }
    public void setSpeedMultiplier(Double speedMultiplier) { this.speedMultiplier = speedMultiplier; }

    public Long getTargetBatteryPackId() { return targetBatteryPackId; }
    public void setTargetBatteryPackId(Long targetBatteryPackId) { this.targetBatteryPackId = targetBatteryPackId; }
}
