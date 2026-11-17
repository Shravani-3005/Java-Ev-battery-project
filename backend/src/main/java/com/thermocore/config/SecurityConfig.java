package com.thermocore.config;

import com.thermocore.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Authentication Endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Public Swagger & OpenAPI Docs
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/api-docs/**").permitAll()

                // Public Actuator Health Check for Render deployment
                .requestMatchers("/actuator/**").permitAll()

                // Public Read-Only / Dashboard endpoints (allow dashboard display without login)
                .requestMatchers(HttpMethod.GET, "/api/dashboard/**", "/api/batteries/**", "/api/sensors/**",
                                                "/api/thermal/**", "/api/analytics/**", "/api/alerts/**",
                                                "/api/recommendations/**", "/api/simulation/**", "/api/settings/**").permitAll()

                // PROTECTED ROUTES (Require valid JWT Bearer Token):
                // 1. Mutating battery registry (POST/PUT/DELETE /api/batteries/**)
                .requestMatchers(HttpMethod.POST, "/api/batteries/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/batteries/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/batteries/**").authenticated()

                // 2. Triggering AI Intelligent Diagnostics (POST /api/thermal/evaluate)
                .requestMatchers("/api/thermal/evaluate").authenticated()

                // 3. Resolving critical alerts (PUT /api/alerts/**)
                .requestMatchers(HttpMethod.PUT, "/api/alerts/**").authenticated()

                // All other requests require authentication
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
