plugins {
    `java-library`
    id("spring-cloud.conventions")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
}

dependencyManagement {
    imports {
        mavenBom(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES)
    }
}
