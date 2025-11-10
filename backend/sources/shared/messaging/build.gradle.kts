plugins {
    id("spring-lib.conventions")
}

dependencies {
    implementation(projects.sources.shared.models)

    api("org.springframework.boot:spring-boot-starter-amqp")
}
