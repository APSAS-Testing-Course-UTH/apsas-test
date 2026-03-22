plugins {
    id("spring-lib.conventions")
}

dependencies {
    api(projects.sources.shared.exception)

    compileOnly("org.springframework.boot:spring-boot-starter-web")
    compileOnly("org.springframework.boot:spring-boot-starter-webflux")

    api("org.springframework.boot:spring-boot-starter-security")
}
