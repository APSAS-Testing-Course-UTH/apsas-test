plugins {
    id("spring-lib.conventions")
}

dependencies {
    compileOnly("org.springframework.boot:spring-boot-starter-data-jpa")

    api("org.springframework.boot:spring-boot-starter-validation")
    api(libs.springdoc.openapi.starter.webmvc.api)
}
