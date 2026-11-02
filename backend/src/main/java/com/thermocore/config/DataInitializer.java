package com.thermocore.config;

import com.thermocore.entity.BatteryPack;
import com.thermocore.entity.SystemConfig;
import com.thermocore.enums.BatteryStatus;
import com.thermocore.enums.SimulationScenario;
import com.thermocore.repository.BatteryPackRepository;
import com.thermocore.repository.SystemConfigRepository;
import com.thermocore.simulation.SensorSimulationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BatteryPackRepository packRepository;
    private final SystemConfigRepository configRepository;
    private final SensorSimulationService simulationService;

    public DataInitializer(BatteryPackRepository packRepository,
                           SystemConfigRepository configRepository,
                           SensorSimulationService simulationService) {
        this.packRepository = packRepository;
        this.configRepository = configRepository;
        this.simulationService = simulationService;
    }

    @Override
    public void run(String... args) {
        // Initialize System Config
        if (configRepository.count() == 0) {
            SystemConfig config = new SystemConfig();
            config.setNormalThreshold(35.0);
            config.setModerateThreshold(40.0);
            config.setHighThreshold(45.0);
            config.setCriticalThreshold(55.0);
            config.setHotspotGradientThreshold(5.0);
            config.setSimulationTickSeconds(3);
            config.setCoolantFluidType("50/50 Water-Ethylene Glycol");
            config.setAutoActuateCooling(true);
            configRepository.save(config);
            log.info("[THERMOCORE] System configuration initialized.");
        }

        // Initialize Battery Packs
        if (packRepository.count() == 0) {
            log.info("[THERMOCORE] Seeding initial EV battery pack profiles...");

            BatteryPack p1 = new BatteryPack();
            p1.setPackCode("BP-LFP-01");
            p1.setPackName("Somaiya Campus e-Shuttle Bus");
            p1.setVehicleModel("Tata Ultra T.7 Electric");
            p1.setChemistry("LFP (Lithium Iron Phosphate)");
            p1.setCapacityKWh(65.0);
            p1.setNominalVoltage(384.0);
            p1.setCellCount(120);
            p1.setCoolingType("Micro-channel Aluminum Cold Plate (Bottom-contact)");
            p1.setMaxSafeTemp(45.0);
            p1.setCriticalTemp(55.0);
            p1.setStatus(BatteryStatus.NORMAL);
            p1.setInstallationDate(LocalDateTime.now().minusMonths(6));
            packRepository.save(p1);

            BatteryPack p2 = new BatteryPack();
            p2.setPackCode("BP-NMC-02");
            p2.setPackName("Orion Racing EV Prototype");
            p2.setVehicleModel("Formula Student Electric (FSE-24)");
            p2.setChemistry("NMC 811 (Nickel Manganese Cobalt)");
            p2.setCapacityKWh(18.5);
            p2.setNominalVoltage(400.0);
            p2.setCellCount(96);
            p2.setCoolingType("Direct Dual-Sided Micro-channel Cooling Jacket");
            p2.setMaxSafeTemp(48.0);
            p2.setCriticalTemp(58.0);
            p2.setStatus(BatteryStatus.MODERATE_WARMING);
            p2.setInstallationDate(LocalDateTime.now().minusMonths(2));
            packRepository.save(p2);

            BatteryPack p3 = new BatteryPack();
            p3.setPackCode("BP-NMC-03");
            p3.setPackName("Intra-City Delivery Van EV");
            p3.setVehicleModel("Mahindra Zor Grand Electric");
            p3.setChemistry("NMC 622");
            p3.setCapacityKWh(42.0);
            p3.setNominalVoltage(350.0);
            p3.setCellCount(96);
            p3.setCoolingType("Micro-channel Serpentine Ribbon Plate");
            p3.setMaxSafeTemp(45.0);
            p3.setCriticalTemp(54.0);
            p3.setStatus(BatteryStatus.NORMAL);
            p3.setInstallationDate(LocalDateTime.now().minusMonths(4));
            packRepository.save(p3);

            BatteryPack p4 = new BatteryPack();
            p4.setPackCode("BP-SS-04");
            p4.setPackName("Next-Gen Solid-State Research Pack");
            p4.setVehicleModel("AERIS Hyper-GT Platform");
            p4.setChemistry("Solid-State Li-Metal");
            p4.setCapacityKWh(85.0);
            p4.setNominalVoltage(800.0);
            p4.setCellCount(144);
            p4.setCoolingType("Micro-channel Ceramic Substrate Heat Sink");
            p4.setMaxSafeTemp(60.0);
            p4.setCriticalTemp(75.0);
            p4.setStatus(BatteryStatus.NORMAL);
            p4.setInstallationDate(LocalDateTime.now().minusWeeks(3));
            packRepository.save(p4);

            log.info("[THERMOCORE] Generating initial sensor telemetry points...");
            // Generate initial baseline readings
            simulationService.generateReadingForPack(p1, SimulationScenario.NORMAL_DRIVING);
            simulationService.generateReadingForPack(p2, SimulationScenario.HIGH_LOAD_ACCELERATION);
            simulationService.generateReadingForPack(p3, SimulationScenario.NORMAL_DRIVING);
            simulationService.generateReadingForPack(p4, SimulationScenario.NORMAL_DRIVING);
        }
    }
}
