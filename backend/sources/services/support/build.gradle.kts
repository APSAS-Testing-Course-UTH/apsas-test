plugins {
    id("spring-service.conventions")
    id("spring-test-common.conventions")
}

dependencies {
    implementation(projects.sources.shared.security)
    implementation(projects.sources.shared.exception)
    implementation(projects.sources.shared.models)
    implementation(projects.sources.shared.messaging)
    implementation(projects.sources.shared.apiDocs)

    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.security:spring-security-messaging")
    implementation("org.springframework.security:spring-security-oauth2-jose")
    implementation("org.postgresql:postgresql")
}
