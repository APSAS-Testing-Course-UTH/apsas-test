plugins {
    id("spring-boot.conventions")
}

dependencies {
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
    implementation("org.springframework.cloud:spring-cloud-starter-config")
    implementation("com.github.ben-manes.caffeine:caffeine")
}
