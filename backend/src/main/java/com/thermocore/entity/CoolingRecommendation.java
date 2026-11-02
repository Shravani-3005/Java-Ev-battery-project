package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thermocore.enums.CoolingUrgency;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "thermocore_cooling_recommendations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CoolingRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_pack_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BatteryPack batteryPack;

    private Long sensorReadingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CoolingUrgency urgencyLevel = CoolingUrgency.LOW;

    @Column(nullable = false, length = 50)
    private String actionType; // PASSIVE_ECO, MODERATE_CIRCULATION, TURBO_COOLING, EMERGENCY_ISOLATION

    private Double targetCoolantFlowLpm;

    private Integer targetRadiatorSpeedPercent;

    private Integer powertrainDeratePercent = 0;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendationDetails;

    private LocalDateTime timestamp = LocalDateTime.now();

    @PrePersist
    public void onPrePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BatteryPack getBatteryPack() { return batteryPack; }
    public void setBatteryPack(BatteryPack batteryPack) { this.batteryPack = batteryPack; }

    public Long getSensorReadingId() { return sensorReadingId; }
    public void setSensorReadingId(Long sensorReadingId) { this.sensorReadingId = sensorReadingId; }

    public CoolingUrgency getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(CoolingUrgency urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public Double getTargetCoolantFlowLpm() { return targetCoolantFlowLpm; }
    public void setTargetCoolantFlowLpm(Double targetCoolantFlowLpm) { this.targetCoolantFlowLpm = targetCoolantFlowLpm; }

    public Integer getTargetRadiatorSpeedPercent() { return targetRadiatorSpeedPercent; }
    public void setTargetRadiatorSpeedPercent(Integer targetRadiatorSpeedPercent) { this.targetRadiatorSpeedPercent = targetRadiatorSpeedPercent; }

    public Integer getPowertrainDeratePercent() { return powertrainDeratePercent; }
    public void setPowertrainDeratePercent(Integer powertrainDeratePercent) { this.powertrainDeratePercent = powertrainDeratePercent; }

    public String getRecommendationDetails() { return recommendationDetails; }
    public void setRecommendationDetails(String recommendationDetails) { this.recommendationDetails = recommendationDetails; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
