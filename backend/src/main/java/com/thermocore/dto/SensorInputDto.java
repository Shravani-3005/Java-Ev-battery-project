package com.thermocore.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SensorInputDto {

    @NotNull(message = "Battery pack ID is required")
    private Long batteryPackId;

    private Double batteryTemp;
    private Double minCellTemp;
    private Double maxCellTemp;
    private Double voltage;
    private Double current;
    private Double coolantInletTemp;
    private Double coolantOutletTemp;
    private Double coolantFlowRate;
    private Double stateOfCharge;
    private Double stateOfHealth;
    private String testScenario;
    private List<Double> customCellTemperatures;

    public SensorInputDto() {}

    public Long getBatteryPackId() { return batteryPackId; }
    public void setBatteryPackId(Long batteryPackId) { this.batteryPackId = batteryPackId; }

    public Double getBatteryTemp() { return batteryTemp; }
    public void setBatteryTemp(Double batteryTemp) { this.batteryTemp = batteryTemp; }

    public Double getMinCellTemp() { return minCellTemp; }
    public void setMinCellTemp(Double minCellTemp) { this.minCellTemp = minCellTemp; }

    public Double getMaxCellTemp() { return maxCellTemp; }
    public void setMaxCellTemp(Double maxCellTemp) { this.maxCellTemp = maxCellTemp; }

    public Double getVoltage() { return voltage; }
    public void setVoltage(Double voltage) { this.voltage = voltage; }

    public Double getCurrent() { return current; }
    public void setCurrent(Double current) { this.current = current; }

    public Double getCoolantInletTemp() { return coolantInletTemp; }
    public void setCoolantInletTemp(Double coolantInletTemp) { this.coolantInletTemp = coolantInletTemp; }

    public Double getCoolantOutletTemp() { return coolantOutletTemp; }
    public void setCoolantOutletTemp(Double coolantOutletTemp) { this.coolantOutletTemp = coolantOutletTemp; }

    public Double getCoolantFlowRate() { return coolantFlowRate; }
    public void setCoolantFlowRate(Double coolantFlowRate) { this.coolantFlowRate = coolantFlowRate; }

    public Double getStateOfCharge() { return stateOfCharge; }
    public void setStateOfCharge(Double stateOfCharge) { this.stateOfCharge = stateOfCharge; }

    public Double getStateOfHealth() { return stateOfHealth; }
    public void setStateOfHealth(Double stateOfHealth) { this.stateOfHealth = stateOfHealth; }

    public String getTestScenario() { return testScenario; }
    public void setTestScenario(String testScenario) { this.testScenario = testScenario; }

    public List<Double> getCustomCellTemperatures() { return customCellTemperatures; }
    public void setCustomCellTemperatures(List<Double> customCellTemperatures) { this.customCellTemperatures = customCellTemperatures; }
}
