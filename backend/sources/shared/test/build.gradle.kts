plugins {
    id("spring-lib.conventions")
    id("kotlin-spring.conventions")
}

dependencies {
    implementation(projects.sources.shared.security)
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin") {
        exclude(group = "org.jetbrains.kotlin")
    }

    api("org.jetbrains.kotlin:kotlin-stdlib")
    api("org.jetbrains.kotlin:kotlin-reflect")
    api("org.jetbrains.kotlin:kotlin-test-junit5")
    api("org.springframework.boot:spring-boot-starter-test")
    api("org.springframework.boot:spring-boot-starter-webflux")
    api("org.springframework.security:spring-security-test")
    api("org.springframework.boot:spring-boot-testcontainers")
    api("org.testcontainers:junit-jupiter")
    api("org.testcontainers:postgresql")
    api("org.testcontainers:rabbitmq")
    api("com.redis:testcontainers-redis")
}
