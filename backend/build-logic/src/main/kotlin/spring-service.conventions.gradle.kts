plugins {
    id("spring-service-common.conventions")
}

val libs: VersionCatalog = the<VersionCatalogsExtension>().named("libs")

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation(libs.findLibrary("springdoc-openapi-starter-webmvc-api").get())
    implementation(libs.findLibrary("mapstruct").get())
    annotationProcessor(libs.findLibrary("mapstruct-processor").get())
}
