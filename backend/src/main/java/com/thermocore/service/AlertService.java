package com.thermocore.service;

import com.thermocore.dto.AlertActionDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.ThermalAlert;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.AlertStatus;
import com.thermocore.exception.ResourceNotFoundException;
import com.thermocore.repository.ThermalAlertRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AlertService {

    private final ThermalAlertRepository repository;

    public AlertService(ThermalAlertRepository repository) {
        this.repository = repository;
    }

    public List<ThermalAlert> getAllAlerts() {
        return repository.findAll();
    }

    public Page<ThermalAlert> getAlertsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<ThermalAlert> getAlertsByPackId(Long packId) {
        return repository.findByBatteryPackIdOrderByTimestampDesc(packId);
    }

    public List<ThermalAlert> getAlertsByStatus(AlertStatus status) {
        return repository.findByStatusOrderByTimestampDesc(status);
    }

    public List<ThermalAlert> getAlertsBySeverity(AlertSeverity severity) {
        return repository.findBySeverityOrderByTimestampDesc(severity);
    }

    public ThermalAlert getAlertById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + id));
    }

    public ThermalAlert createAlert(BatteryPack pack, Long readingId, String alertType, AlertSeverity severity,
                                   String description, String param, String value, String action) {
        ThermalAlert alert = new ThermalAlert();
        alert.setBatteryPack(pack);
        alert.setSensorReadingId(readingId);
        alert.setAlertType(alertType);
        alert.setSeverity(severity);
        alert.setDescription(description);
        alert.setDetectedParameter(param);
        alert.setObservedValue(value);
        alert.setRecommendedAction(action);
        alert.setStatus(AlertStatus.ACTIVE);
        alert.setTimestamp(LocalDateTime.now());
        return repository.save(alert);
    }

    public ThermalAlert acknowledgeAlert(Long id, AlertActionDto action) {
        ThermalAlert alert = getAlertById(id);
        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedBy(action != null && action.getOperatorName() != null ? action.getOperatorName() : "Safety Engineer");
        alert.setAcknowledgedAt(LocalDateTime.now());
        return repository.save(alert);
    }

    public ThermalAlert resolveAlert(Long id, AlertActionDto action) {
        ThermalAlert alert = getAlertById(id);
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        if (action != null && action.getResolutionNotes() != null) {
            alert.setDescription(alert.getDescription() + " [Resolution: " + action.getResolutionNotes() + "]");
        }
        return repository.save(alert);
    }
}
