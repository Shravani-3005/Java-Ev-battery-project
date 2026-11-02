package com.thermocore.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "thermocore_system_config")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double normalThreshold = 35.0; // °C
    private Double moderateThreshold = 40.0; // °C
    private Double highThreshold = 45.0; // °C
    private Double criticalThreshold = 55.0; // °C
    private Double hotspotGradientThreshold = 5.0; // °C

    private Integer simulationTickSeconds = 3;
    private String coolantFluidType = "50/50 Water-Ethylene Glycol";
    private Boolean autoActuateCooling = true;
    private Boolean emailNotificationsEnabled = false;

    public SystemConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getNormalThreshold() { return normalThreshold; }
    public void setNormalThreshold(Double normalThreshold) { this.normalThreshold = normalThreshold; }

    public Double getModerateThreshold() { return moderateThreshold; }
    public void setModerateThreshold(Double moderateThreshold) { this.moderateThreshold = moderateThreshold; }

    public Double getHighThreshold() { return highThreshold; }
    public void setHighThreshold(Double highThreshold) { this.highThreshold = highThreshold; }

    public Double getCriticalThreshold() { return criticalThreshold; }
    public void setCriticalThreshold(Double criticalThreshold) { this.criticalThreshold = criticalThreshold; }

    public Double getHotspotGradientThreshold() { return hotspotGradientThreshold; }
    public void setHotspotGradientThreshold(Double hotspotGradientThreshold) { this.hotspotGradientThreshold = hotspotGradientThreshold; }

    public Integer getSimulationTickSeconds() { return simulationTickSeconds; }
    public void setSimulationTickSeconds(Integer simulationTickSeconds) { this.simulationTickSeconds = simulationTickSeconds; }

    public String getCoolantFluidType() { return coolantFluidType; }
    public void setCoolantFluidType(String coolantFluidType) { this.coolantFluidType = coolantFluidType; }

    public Boolean getAutoActuateCooling() { return autoActuateCooling; }
    public void setAutoActuateCooling(Boolean autoActuateCooling) { this.autoActuateCooling = autoActuateCooling; }

    public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
}
