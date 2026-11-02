package com.thermocore.dto;

import java.util.Map;

public class DashboardSummaryDto {
    private long totalBatteryPacks;
    private long activeBatteryPacks;
    private long normalBatteries;
    private long batteriesAtRisk;
    private long criticalAlerts;
    private double avgBatteryTemp;

    // Cooling overview
    private double avgCoolantInletTemp;
    private double avgCoolantOutletTemp;
    private double avgCoolantFlowRate;
    private String coolingEfficiencyStatus; // OPTIMAL, MODERATE_LOAD, INSUFFICIENT

    // Status distribution
    private Map<String, Long> statusDistribution;

    public DashboardSummaryDto() {}

    public long getTotalBatteryPacks() { return totalBatteryPacks; }
    public void setTotalBatteryPacks(long totalBatteryPacks) { this.totalBatteryPacks = totalBatteryPacks; }

    public long getActiveBatteryPacks() { return activeBatteryPacks; }
    public void setActiveBatteryPacks(long activeBatteryPacks) { this.activeBatteryPacks = activeBatteryPacks; }

    public long getNormalBatteries() { return normalBatteries; }
    public void setNormalBatteries(long normalBatteries) { this.normalBatteries = normalBatteries; }

    public long getBatteriesAtRisk() { return batteriesAtRisk; }
    public void setBatteriesAtRisk(long batteriesAtRisk) { this.batteriesAtRisk = batteriesAtRisk; }

    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public double getAvgBatteryTemp() { return avgBatteryTemp; }
    public void setAvgBatteryTemp(double avgBatteryTemp) { this.avgBatteryTemp = avgBatteryTemp; }

    public double getAvgCoolantInletTemp() { return avgCoolantInletTemp; }
    public void setAvgCoolantInletTemp(double avgCoolantInletTemp) { this.avgCoolantInletTemp = avgCoolantInletTemp; }

    public double getAvgCoolantOutletTemp() { return avgCoolantOutletTemp; }
    public void setAvgCoolantOutletTemp(double avgCoolantOutletTemp) { this.avgCoolantOutletTemp = avgCoolantOutletTemp; }

    public double getAvgCoolantFlowRate() { return avgCoolantFlowRate; }
    public void setAvgCoolantFlowRate(double avgCoolantFlowRate) { this.avgCoolantFlowRate = avgCoolantFlowRate; }

    public String getCoolingEfficiencyStatus() { return coolingEfficiencyStatus; }
    public void setCoolingEfficiencyStatus(String coolingEfficiencyStatus) { this.coolingEfficiencyStatus = coolingEfficiencyStatus; }

    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
}
