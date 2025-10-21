FROM bellsoft/liberica-runtime-container:jre-21-cds-slim-musl

ARG MODULE

WORKDIR /app
COPY build/tasks/_${MODULE}_executableJarJvm/${MODULE}-jvm-executable.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
