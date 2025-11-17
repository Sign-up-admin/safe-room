# syntax=docker/dockerfile:1

##############################
# Frontend build stage
##############################
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Install dependencies and build user-facing frontend
COPY src/main/resources/front/front/package*.json ./front/
RUN --mount=type=cache,target=/root/.npm \
    cd front && npm ci && npm cache clean --force

COPY src/main/resources/front/front ./front
RUN cd front && npm run build

# Install dependencies and build admin frontend
COPY src/main/resources/admin/admin/package*.json ./admin/
RUN --mount=type=cache,target=/root/.npm \
    cd admin && npm ci && npm cache clean --force

COPY src/main/resources/admin/admin ./admin
RUN cd admin && npm run build

##############################
# Backend build stage
##############################
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /build

# Step 1: Copy Maven configuration files (key to dependency layer separation)
# This layer will only be rebuilt when pom.xml or pom-war.xml changes
COPY pom.xml pom-war.xml ./

# Step 2: Download and cache all Maven dependencies (independent layer, will not be deleted)
# Using BuildKit cache mount, Maven dependencies will be persisted in Docker cache
# Even when rebuilding, as long as pom.xml hasn't changed, dependencies won't be re-downloaded
RUN --mount=type=cache,target=/root/.m2,sharing=locked \
    mvn dependency:resolve dependency:go-offline -B || \
    mvn dependency:go-offline -B || true

# Step 3: Copy source code (this layer will only be rebuilt when code changes)
# Dependencies are already downloaded in the previous layer, changes here won't affect dependency layer
COPY . .

# Step 4: Inject frontend build artifacts
RUN mkdir -p src/main/resources/front/front/dist \
    src/main/resources/admin/admin/dist
COPY --from=frontend-builder /frontend/front/dist src/main/resources/front/front/dist
COPY --from=frontend-builder /frontend/admin/dist src/main/resources/admin/admin/dist

# Step 5: Compile and package (reuse cached dependencies)
# Use the same cache mount to ensure using previously downloaded dependencies
# Maven dependencies will not be deleted and will remain in Docker cache
RUN --mount=type=cache,target=/root/.m2,sharing=locked \
    mvn -B clean package -DskipTests && \
    JAR_FILE=$(ls target/*.jar | grep -v original | head -n 1) && \
    cp "$JAR_FILE" /tmp/app.jar

##############################
# Runtime stage
##############################
FROM eclipse-temurin:21-jre-jammy AS runtime

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xmx512m -Xms256m" \
    TZ=Asia/Shanghai

WORKDIR /app

# Install curl for healthcheck and set timezone
# Use cache mount for apt packages to speed up builds
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends curl tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*

COPY --from=backend-builder /tmp/app.jar /app/app.jar

# Create necessary directories
RUN mkdir -p /app/logs /app/static/upload && \
    chmod -R 755 /app

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD curl -f http://localhost:8080/springboot1ngh61a2/user/login || exit 1

# Use exec form for better signal handling
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

