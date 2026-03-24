plugins {
    id("spring-cloud.conventions")
    id("org.springframework.boot")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    developmentOnly("org.springframework.boot:spring-boot-devtools")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks {
    bootRun {
        systemProperty("spring.profiles.active", "dev,local")
    }

    bootBuildImage {
        val imagePath = System.getenv("DOCKER_HUB_USERNAME") ?: "library"
        imageName.set("$imagePath/apsas-${project.name}")
        environment.put("BP_HEALTH_CHECKER_ENABLED", "true")
        environment.put("BP_SPRING_CLOUD_BINDINGS_DISABLED", "true")
        buildpacks.addAll(
            "urn:cnb:builder:paketo-buildpacks/java",
            "docker.io/paketobuildpacks/health-checker:latest",
        )
    }
}

springBoot {
    buildInfo()
}
