package com.thermocore.entity;

import com.thermocore.enums.SimulationScenario;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "thermocore_simulation_sessions")
public class SimulationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String sessionName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SimulationScenario scenarioType = SimulationScenario.NORMAL_DRIVING;

    private Boolean isActive = true;

    private Double speedMultiplier = 1.0;

    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime endedAt;

    public SimulationSession() {}

    public SimulationSession(String sessionName, SimulationScenario scenarioType, Double speedMultiplier) {
        this.sessionName = sessionName;
        this.scenarioType = scenarioType;
        this.speedMultiplier = speedMultiplier;
        this.isActive = true;
        this.startedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionName() { return sessionName; }
    public void setSessionName(String sessionName) { this.sessionName = sessionName; }

    public SimulationScenario getScenarioType() { return scenarioType; }
    public void setScenarioType(SimulationScenario scenarioType) { this.scenarioType = scenarioType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getSpeedMultiplier() { return speedMultiplier; }
    public void setSpeedMultiplier(Double speedMultiplier) { this.speedMultiplier = speedMultiplier; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
