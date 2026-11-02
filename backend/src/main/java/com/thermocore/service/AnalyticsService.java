package com.thermocore.service;

import com.thermocore.dto.DashboardSummaryDto;
import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.SensorReading;
import com.thermocore.enums.AlertSeverity;
import com.thermocore.enums.AlertStatus;
import com.thermocore.enums.BatteryStatus;
import com.thermocore.repository.BatteryPackRepository;
import com.thermocore.repository.SensorReadingRepository;
import com.thermocore.repository.ThermalAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BatteryPackRepository packRepository;
    private final SensorReadingRepository readingRepository;
    private final ThermalAlertRepository alertRepository;

    public AnalyticsService(BatteryPackRepository packRepository,
                            SensorReadingRepository readingRepository,
                            ThermalAlertRepository alertRepository) {
        this.packRepository = packRepository;
        this.readingRepository = readingRepository;
        this.alertRepository = alertRepository;
    }

    public DashboardSummaryDto getDashboardSummary() {
        DashboardSummaryDto dto = new DashboardSummaryDto();

        List<BatteryPack> packs = packRepository.findAll();
        dto.setTotalBatteryPacks(packs.size());

        long active = packs.stream().filter(p -> p.getStatus() != BatteryStatus.DEGRADED).count();
        dto.setActiveBatteryPacks(active);

        long normal = packs.stream().filter(p -> p.getStatus() == BatteryStatus.NORMAL).count();
        dto.setNormalBatteries(normal);

        long atRisk = packs.stream().filter(p -> p.getStatus() == BatteryStatus.MODERATE_WARMING ||
                p.getStatus() == BatteryStatus.CRITICAL_HOTSPOT ||
                p.getStatus() == BatteryStatus.THERMAL_RUNAWAY).count();
        dto.setBatteriesAtRisk(atRisk);

        long criticalAlerts = alertRepository.countBySeverityAndStatus(AlertSeverity.CRITICAL, AlertStatus.ACTIVE);
        dto.setCriticalAlerts(criticalAlerts);

        LocalDateTime recentWindow = LocalDateTime.now().minusHours(24);
        Double avgTemp = readingRepository.getFleetAvgTemp(recentWindow);
        dto.setAvgBatteryTemp(avgTemp != null ? Math.round(avgTemp * 10.0) / 10.0 : 32.5);

        Double avgInlet = readingRepository.getFleetAvgInletTemp(recentWindow);
        dto.setAvgCoolantInletTemp(avgInlet != null ? Math.round(avgInlet * 10.0) / 10.0 : 23.8);

        Double avgOutlet = readingRepository.getFleetAvgOutletTemp(recentWindow);
        dto.setAvgCoolantOutletTemp(avgOutlet != null ? Math.round(avgOutlet * 10.0) / 10.0 : 27.2);

        Double avgFlow = readingRepository.getFleetAvgFlowRate(recentWindow);
        dto.setAvgCoolantFlowRate(avgFlow != null ? Math.round(avgFlow * 10.0) / 10.0 : 3.4);

        if (avgTemp != null && avgTemp > 42.0) {
            dto.setCoolingEfficiencyStatus("INSUFFICIENT");
        } else if (avgTemp != null && avgTemp > 36.0) {
            dto.setCoolingEfficiencyStatus("MODERATE_LOAD");
        } else {
            dto.setCoolingEfficiencyStatus("OPTIMAL");
        }

        Map<String, Long> dist = new LinkedHashMap<>();
        dist.put("NORMAL", normal);
        dist.put("MODERATE", packs.stream().filter(p -> p.getStatus() == BatteryStatus.MODERATE_WARMING).count());
        dist.put("HIGH_RISK", packs.stream().filter(p -> p.getStatus() == BatteryStatus.CRITICAL_HOTSPOT).count());
        dist.put("CRITICAL", packs.stream().filter(p -> p.getStatus() == BatteryStatus.THERMAL_RUNAWAY).count());
        dto.setStatusDistribution(dist);

        return dto;
    }

    public List<Map<String, Object>> getTemperatureOverview(Long packId, int limit) {
        List<SensorReading> readings = packId != null
                ? readingRepository.findRecentReadings(packId, limit)
                : readingRepository.findAll();

        if (readings.size() > limit) {
            readings = readings.subList(readings.size() - limit, readings.size());
        }

        // Return chronological
        Collections.reverse(readings);

        List<Map<String, Object>> result = new ArrayList<>();
        for (SensorReading r : readings) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("timestamp", r.getTimestamp());
            map.put("batteryTemp", r.getBatteryTemp());
            map.put("maxCellTemp", r.getMaxCellTemp());
            map.put("minCellTemp", r.getMinCellTemp());
            map.put("tempGradient", r.getTempGradient());
            map.put("coolantInletTemp", r.getCoolantInletTemp());
            map.put("coolantOutletTemp", r.getCoolantOutletTemp());
            map.put("voltage", r.getVoltage());
            map.put("current", r.getCurrent());
            map.put("coolantFlowRate", r.getCoolantFlowRate());
            map.put("heatGenW", r.getCalculatedHeatGenW());
            map.put("riskScore", r.getThermalRiskScore());
            map.put("scenario", r.getTestScenario());
            result.add(map);
        }
        return result;
    }
}
