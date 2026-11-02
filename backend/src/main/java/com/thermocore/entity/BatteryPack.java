package com.thermocore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thermocore.enums.BatteryStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

@Entity
@Table(name = "thermocore_battery_packs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BatteryPack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pack code is required")
    @Column(nullable = false, unique = true, length = 50)
    private String packCode;

    @NotBlank(message = "Pack name is required")
    @Column(nullable = false, length = 100)
    private String packName;

    @NotBlank(message = "Vehicle model is required")
    @Column(nullable = false, length = 100)
    private String vehicleModel;

    @NotBlank(message = "Chemistry is required")
    @Column(nullable = false, length = 50)
    private String chemistry; // LFP, NMC 811, NMC 622, NCA, Solid-State

    @NotNull(message = "Capacity is required")
    @Positive
    @Column(nullable = false)
    private Double capacityKWh;

    @NotNull(message = "Nominal voltage is required")
    @Positive
    @Column(nullable = false)
    private Double nominalVoltage;

    @NotNull(message = "Cell count is required")
    @Positive
    @Column(nullable = false)
    private Integer cellCount = 96;

    @Column(length = 100)
    private String coolingType = "Micro-channel Liquid Cold Plate";

    @Column(nullable = false)
    private Double maxSafeTemp = 45.0;

    @Column(nullable = false)
    private Double criticalTemp = 55.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BatteryStatus status = BatteryStatus.NORMAL;

    private LocalDateTime installationDate = LocalDateTime.now();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void onPrePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPackCode() { return packCode; }
    public void setPackCode(String packCode) { this.packCode = packCode; }

    public String getPackName() { return packName; }
    public void setPackName(String packName) { this.packName = packName; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getChemistry() { return chemistry; }
    public void setChemistry(String chemistry) { this.chemistry = chemistry; }

    public Double getCapacityKWh() { return capacityKWh; }
    public void setCapacityKWh(Double capacityKWh) { this.capacityKWh = capacityKWh; }

    public Double getNominalVoltage() { return nominalVoltage; }
    public void setNominalVoltage(Double nominalVoltage) { this.nominalVoltage = nominalVoltage; }

    public Integer getCellCount() { return cellCount; }
    public void setCellCount(Integer cellCount) { this.cellCount = cellCount; }

    public String getCoolingType() { return coolingType; }
    public void setCoolingType(String coolingType) { this.coolingType = coolingType; }

    public Double getMaxSafeTemp() { return maxSafeTemp; }
    public void setMaxSafeTemp(Double maxSafeTemp) { this.maxSafeTemp = maxSafeTemp; }

    public Double getCriticalTemp() { return criticalTemp; }
    public void setCriticalTemp(Double criticalTemp) { this.criticalTemp = criticalTemp; }

    public BatteryStatus getStatus() { return status; }
    public void setStatus(BatteryStatus status) { this.status = status; }

    public LocalDateTime getInstallationDate() { return installationDate; }
    public void setInstallationDate(LocalDateTime installationDate) { this.installationDate = installationDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
