package com.thermocore.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI thermocoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("THERMOCORE - EV Battery Thermal Management API")
                        .description("REST API and Intelligent Diagnostics Service for EV Battery Thermal Management System (Use Case KJS-CES-02). " +
                                     "Supports live telemetry, 24-cell gradient tracking, rule-based thermal runaway risk evaluation, and JWT-secured operational endpoints.")
                        .version("v3.0.0")
                        .contact(new Contact()
                                .name("Department of Computer Engineering - FSDL Java AY 2026-27")
                                .email("student@somaiya.edu"))
                        .license(new License().name("Educational Use Only")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token obtained from POST /api/auth/login. Example: Bearer <your_token>")));
    }
}
