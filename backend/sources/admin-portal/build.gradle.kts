plugins {
    id("spring-boot.conventions")
}

val springBootAdminVersion: String by extra {
    libs.versions.spring.boot.admin
        .get()
}

dependencies {
    implementation(projects.sources.shared.security)
    implementation(projects.sources.shared.models) {
        exclude(group = "org.springdoc")
    }

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.security:spring-security-oauth2-jose")
    implementation("de.codecentric:spring-boot-admin-starter-server")
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
    implementation("org.springframework.data:spring-data-commons")
    implementation("org.thymeleaf.extras:thymeleaf-extras-springsecurity6")
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
    implementation("com.github.ben-manes.caffeine:caffeine")
}

dependencyManagement {
    imports {
        mavenBom("de.codecentric:spring-boot-admin-dependencies:$springBootAdminVersion")
    }
}
