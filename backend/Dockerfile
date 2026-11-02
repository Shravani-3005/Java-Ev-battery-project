# Multi-stage Dockerfile for THERMOCORE Spring Boot Backend
# Stage 1: Build JAR with Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-privileged user for security
RUN addgroup -S thermocore && adduser -S thermocore -G thermocore
USER thermocore:thermocore

# Copy the built jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Render dynamic port binding (default 8082, overridden by $PORT at runtime)
ENV PORT=8082
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
