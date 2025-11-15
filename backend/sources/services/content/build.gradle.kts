plugins {
    id("spring-service.conventions")
}

dependencies {
    implementation(projects.sources.shared.security)
    implementation(projects.sources.shared.messaging)
    implementation(projects.sources.shared.exception)
    implementation(projects.sources.shared.models)
    implementation(projects.sources.shared.feignClients)
    implementation(projects.sources.shared.cache)
    implementation(projects.sources.shared.apiDocs)

    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.postgresql:postgresql")
    implementation(libs.hypersistence.utils.hibernate63)
}
