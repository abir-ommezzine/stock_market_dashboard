# ===============================
# Stage 1 — Build
# ===============================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom first (better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests


# ===============================
# Stage 2 — Runtime
# ===============================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create non-root user (production best practice)
RUN useradd -ms /bin/bash appuser

# Create uploads directory (if you use volume later)
RUN mkdir -p /app/uploads

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Optional: Better JVM defaults for containers
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
