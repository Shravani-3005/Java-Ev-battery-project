package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "thermocore_cell_temperatures")
public class CellTemperature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_reading_id", nullable = false)
    @JsonIgnore
    private SensorReading sensorReading;

    @Column(nullable = false)
    private Integer cellIndex;

    @Column(nullable = false, length = 20)
    private String cellLabel;

    @Column(nullable = false)
    private Double temperature;

    private Boolean isHotspot = false;

    private Double deltaFromAvg = 0.0;

    public CellTemperature() {}

    public CellTemperature(SensorReading sensorReading, Integer cellIndex, String cellLabel, Double temperature, Boolean isHotspot, Double deltaFromAvg) {
        this.sensorReading = sensorReading;
        this.cellIndex = cellIndex;
        this.cellLabel = cellLabel;
        this.temperature = temperature;
        this.isHotspot = isHotspot;
        this.deltaFromAvg = deltaFromAvg;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SensorReading getSensorReading() { return sensorReading; }
    public void setSensorReading(SensorReading sensorReading) { this.sensorReading = sensorReading; }

    public Integer getCellIndex() { return cellIndex; }
    public void setCellIndex(Integer cellIndex) { this.cellIndex = cellIndex; }

    public String getCellLabel() { return cellLabel; }
    public void setCellLabel(String cellLabel) { this.cellLabel = cellLabel; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Boolean getIsHotspot() { return isHotspot; }
    public void setIsHotspot(Boolean isHotspot) { this.isHotspot = isHotspot; }

    public Double getDeltaFromAvg() { return deltaFromAvg; }
    public void setDeltaFromAvg(Double deltaFromAvg) { this.deltaFromAvg = deltaFromAvg; }
}
