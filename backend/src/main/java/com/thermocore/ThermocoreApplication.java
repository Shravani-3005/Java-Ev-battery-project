package com.thermocore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ThermocoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThermocoreApplication.class, args);
    }
}
