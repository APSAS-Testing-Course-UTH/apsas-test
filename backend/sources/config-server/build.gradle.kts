plugins {
    id("spring-boot.conventions")
}

dependencies {
    implementation("org.springframework.cloud:spring-cloud-config-server")
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
    implementation("com.github.ben-manes.caffeine:caffeine")
}

tasks {
    bootJar {
        from(rootProject.fileTree("config")) {
            into("config")
        }
    }
}
