package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.AlertStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "thermocore_thermal_alerts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ThermalAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_pack_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BatteryPack batteryPack;

    private Long sensorReadingId;

    @Column(nullable = false, length = 50)
    private String alertType; // HOTSPOT, OVERHEATING, PUMP_FAILURE, HIGH_C_RATE, GRADIENT_WARNING

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity = AlertSeverity.WARNING;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String detectedParameter;

    @Column(length = 50)
    private String observedValue;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status = AlertStatus.ACTIVE;

    private String acknowledgedBy;

    private LocalDateTime acknowledgedAt;

    private LocalDateTime resolvedAt;

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

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetectedParameter() { return detectedParameter; }
    public void setDetectedParameter(String detectedParameter) { this.detectedParameter = detectedParameter; }

    public String getObservedValue() { return observedValue; }
    public void setObservedValue(String observedValue) { this.observedValue = observedValue; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
