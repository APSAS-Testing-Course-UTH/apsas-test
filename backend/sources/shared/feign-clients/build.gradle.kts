plugins {
    id("spring-lib.conventions")
}

dependencies {
    implementation(projects.sources.shared.models)

    api("org.springframework.cloud:spring-cloud-starter-openfeign")
}
