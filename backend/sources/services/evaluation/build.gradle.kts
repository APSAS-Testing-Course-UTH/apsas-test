plugins {
    id("spring-service.conventions")
    id("spring-test-common.conventions")
}

dependencies {
    implementation(projects.sources.shared.messaging)
    implementation(projects.sources.shared.models)
    implementation(projects.sources.shared.feignClients)
    implementation(projects.sources.shared.cache)
    implementation(projects.sources.shared.apiDocs)

    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    implementation("org.springframework.retry:spring-retry")
}
