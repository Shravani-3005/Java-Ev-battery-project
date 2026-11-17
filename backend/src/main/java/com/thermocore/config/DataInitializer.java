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
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BatteryPackRepository packRepository;
    private final SystemConfigRepository configRepository;
    private final SensorSimulationService simulationService;
    private final com.thermocore.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DataInitializer(BatteryPackRepository packRepository,
                           SystemConfigRepository configRepository,
                           SensorSimulationService simulationService,
                           com.thermocore.repository.UserRepository userRepository,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.packRepository = packRepository;
        this.configRepository = configRepository;
        this.simulationService = simulationService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize default operator and admin user for Phase 3 evaluation
        if (!userRepository.existsByEmail("operator@somaiya.edu")) {
            com.thermocore.entity.User defaultOperator = new com.thermocore.entity.User(
                    "operator@somaiya.edu",
                    "operator",
                    passwordEncoder.encode("operator123"),
                    "ROLE_OPERATOR"
            );
            userRepository.save(defaultOperator);
            log.info("[THERMOCORE] Default security user 'operator@somaiya.edu' initialized (password: operator123).");
        }
        if (!userRepository.existsByEmail("admin@somaiya.edu")) {
            com.thermocore.entity.User adminUser = new com.thermocore.entity.User(
                    "admin@somaiya.edu",
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "ROLE_ADMIN"
            );
            userRepository.save(adminUser);
            log.info("[THERMOCORE] Default security user 'admin@somaiya.edu' initialized (password: admin123).");
        }

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
            p1.setPackCode("BP-01");
            p1.setPackName("Lithium-Ion Pack 1");
            p1.setVehicleModel("Standard EV");
            p1.setChemistry("Lithium-Ion (NMC)");
            p1.setCapacityKWh(60.0);
            p1.setNominalVoltage(400.0);
            p1.setCellCount(96);
            p1.setCoolingType("Micro-channel Cold Plate");
            p1.setMaxSafeTemp(45.0);
            p1.setCriticalTemp(55.0);
            p1.setStatus(BatteryStatus.NORMAL);
            p1.setInstallationDate(LocalDateTime.now().minusMonths(6));
            packRepository.save(p1);

            BatteryPack p2 = new BatteryPack();
            p2.setPackCode("BP-02");
            p2.setPackName("Lithium Iron Phosphate Pack");
            p2.setVehicleModel("Standard EV");
            p2.setChemistry("Lithium Iron Phosphate (LFP)");
            p2.setCapacityKWh(50.0);
            p2.setNominalVoltage(380.0);
            p2.setCellCount(96);
            p2.setCoolingType("Micro-channel Cold Plate");
            p2.setMaxSafeTemp(48.0);
            p2.setCriticalTemp(58.0);
            p2.setStatus(BatteryStatus.NORMAL);
            p2.setInstallationDate(LocalDateTime.now().minusMonths(2));
            packRepository.save(p2);

            BatteryPack p3 = new BatteryPack();
            p3.setPackCode("BP-03");
            p3.setPackName("Solid-State Battery Pack");
            p3.setVehicleModel("Standard EV");
            p3.setChemistry("Solid-State Battery");
            p3.setCapacityKWh(80.0);
            p3.setNominalVoltage(450.0);
            p3.setCellCount(96);
            p3.setCoolingType("Micro-channel Cold Plate");
            p3.setMaxSafeTemp(55.0);
            p3.setCriticalTemp(70.0);
            p3.setStatus(BatteryStatus.NORMAL);
            p3.setInstallationDate(LocalDateTime.now().minusMonths(4));
            packRepository.save(p3);

            log.info("[THERMOCORE] Generating initial sensor telemetry points...");
            // Generate initial baseline readings
            simulationService.generateReadingForPack(p1, SimulationScenario.NORMAL_DRIVING);
            simulationService.generateReadingForPack(p2, SimulationScenario.HIGH_LOAD_ACCELERATION);
            simulationService.generateReadingForPack(p3, SimulationScenario.NORMAL_DRIVING);
            simulationService.generateReadingForPack(p4, SimulationScenario.NORMAL_DRIVING);
        } else {
            // Update existing packs to ensure clean single-word names
            List<BatteryPack> existing = packRepository.findAll();
            for (BatteryPack p : existing) {
                boolean changed = false;
                if ("BP-LFP-01".equals(p.getPackCode()) && !"Cruiser".equals(p.getPackName())) {
                    p.setPackName("Cruiser");
                    p.setVehicleModel("Tata Ultra");
                    changed = true;
                } else if ("BP-NMC-02".equals(p.getPackCode()) && !"Sprint".equals(p.getPackName())) {
                    p.setPackName("Sprint");
                    p.setVehicleModel("Formula EV");
                    changed = true;
                } else if ("BP-NMC-03".equals(p.getPackCode()) && !"Cargo".equals(p.getPackName())) {
                    p.setPackName("Cargo");
                    p.setVehicleModel("Mahindra Zor");
                    changed = true;
                } else if ("BP-SS-04".equals(p.getPackCode()) && !"Aero".equals(p.getPackName())) {
                    p.setPackName("Aero");
                    p.setVehicleModel("AERIS GT");
                    changed = true;
                }
                if (changed) {
                    packRepository.save(p);
                }
            }
        }
    }
}
