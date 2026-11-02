package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thermocore.enums.ThermalRiskLevel;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "thermocore_sensor_readings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_pack_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BatteryPack batteryPack;

    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private Double batteryTemp;

    @Column(nullable = false)
    private Double minCellTemp;

    @Column(nullable = false)
    private Double maxCellTemp;

    @Column(nullable = false)
    private Double tempGradient; // Delta T = max - min

    @Column(nullable = false)
    private Double voltage;

    @Column(nullable = false)
    private Double current;

    @Column(nullable = false)
    private Double coolantInletTemp;

    @Column(nullable = false)
    private Double coolantOutletTemp;

    @Column(nullable = false)
    private Double coolantFlowRate; // L/min

    @Column(nullable = false)
    private Double stateOfCharge; // %

    @Column(nullable = false)
    private Double stateOfHealth; // %

    private Double calculatedHeatGenW;

    private Double cRate;

    private Double thermalRiskScore; // 0 - 100

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ThermalRiskLevel thermalRiskLevel = ThermalRiskLevel.NORMAL;

    private Boolean isHotspotDetected = false;

    private String testScenario = "Normal Driving";

    @OneToMany(mappedBy = "sensorReading", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CellTemperature> cellTemperatures = new ArrayList<>();

    @PrePersist
    public void onPrePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BatteryPack getBatteryPack() { return batteryPack; }
    public void setBatteryPack(BatteryPack batteryPack) { this.batteryPack = batteryPack; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Double getBatteryTemp() { return batteryTemp; }
    public void setBatteryTemp(Double batteryTemp) { this.batteryTemp = batteryTemp; }

    public Double getMinCellTemp() { return minCellTemp; }
    public void setMinCellTemp(Double minCellTemp) { this.minCellTemp = minCellTemp; }

    public Double getMaxCellTemp() { return maxCellTemp; }
    public void setMaxCellTemp(Double maxCellTemp) { this.maxCellTemp = maxCellTemp; }

    public Double getTempGradient() { return tempGradient; }
    public void setTempGradient(Double tempGradient) { this.tempGradient = tempGradient; }

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

    public Double getCalculatedHeatGenW() { return calculatedHeatGenW; }
    public void setCalculatedHeatGenW(Double calculatedHeatGenW) { this.calculatedHeatGenW = calculatedHeatGenW; }

    public Double getcRate() { return cRate; }
    public void setcRate(Double cRate) { this.cRate = cRate; }

    public Double getThermalRiskScore() { return thermalRiskScore; }
    public void setThermalRiskScore(Double thermalRiskScore) { this.thermalRiskScore = thermalRiskScore; }

    public ThermalRiskLevel getThermalRiskLevel() { return thermalRiskLevel; }
    public void setThermalRiskLevel(ThermalRiskLevel thermalRiskLevel) { this.thermalRiskLevel = thermalRiskLevel; }

    public Boolean getIsHotspotDetected() { return isHotspotDetected; }
    public void setIsHotspotDetected(Boolean isHotspotDetected) { this.isHotspotDetected = isHotspotDetected; }

    public String getTestScenario() { return testScenario; }
    public void setTestScenario(String testScenario) { this.testScenario = testScenario; }

    public List<CellTemperature> getCellTemperatures() { return cellTemperatures; }
    public void setCellTemperatures(List<CellTemperature> cellTemperatures) { this.cellTemperatures = cellTemperatures; }
}
