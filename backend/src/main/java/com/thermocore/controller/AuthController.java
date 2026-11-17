package com.thermocore.controller;

import com.thermocore.dto.AuthRequestDto;
import com.thermocore.dto.AuthResponseDto;
import com.thermocore.entity.User;
import com.thermocore.repository.UserRepository;
import com.thermocore.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "User registration, login, and JWT Bearer token generation")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user via email and generate JWT token")
    public ResponseEntity<?> login(@RequestBody AuthRequestDto request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : (request.getUsername() != null ? request.getUsername().trim() : null);
        if (identifier == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "Invalid email or password"));
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponseDto(token, user.getEmail(), user.getUsername(), user.getRole(), "Authentication successful"));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account with email and password")
    public ResponseEntity<?> register(@RequestBody AuthRequestDto request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        if (email == null || email.isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("error", "A valid email address is required"));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists"));
        }

        String username = request.getUsername() != null && !request.getUsername().trim().isEmpty()
                ? request.getUsername().trim()
                : email.split("@")[0];

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(email, username, encodedPassword, "ROLE_OPERATOR");
        userRepository.save(newUser);

        String token = jwtUtil.generateToken(email, "ROLE_OPERATOR");
        return ResponseEntity.ok(new AuthResponseDto(token, email, username, "ROLE_OPERATOR", "User registered successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Verify token and get current authenticated user profile")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token expired or invalid"));
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        return ResponseEntity.ok(Map.of("username", username, "role", role, "status", "AUTHENTICATED"));
    }
}
