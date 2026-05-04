# Stage 1: Build the application
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better caching
COPY Edu/.mvn/ .mvn/
COPY Edu/mvnw Edu/pom.xml ./
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY Edu/src/ src/

# Build the application (skip tests for faster deploy)
RUN ./mvnw package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render sets PORT env variable)
EXPOSE 8080

# Run the application with optimizations for slow CPUs and low memory (Render Free Tier)
# -noverify and -XX:TieredStopAtLevel=1 dramatically speed up JVM startup time
# -XX:+UseSerialGC uses the least amount of memory for Garbage Collection
ENTRYPOINT ["java", "-noverify", "-XX:TieredStopAtLevel=1", "-Xmx256m", "-XX:MaxMetaspaceSize=128m", "-XX:+UseSerialGC", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]
