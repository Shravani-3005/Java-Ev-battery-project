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

# Render dynamic port binding (default 10000 on Render, 8082 fallback)
ENV PORT=10000
EXPOSE 10000
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

# Render Free Tier memory optimization (-Xmx384m -XX:+UseSerialGC) and dynamic port
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Xms128m -XX:+UseSerialGC -Dserver.port=${PORT:-10000} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
