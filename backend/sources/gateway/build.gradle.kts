plugins {
    id("spring-service-common.conventions")
    id("spring-test-common.conventions")
}

dependencies {
    implementation(projects.sources.shared.security) {
        exclude(group = "org.springframework.security", module = "spring-security-web")
    }
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.cloud:spring-cloud-starter-gateway-server-webflux")
    implementation(libs.springdoc.openapi.starter.webflux.ui)
}
