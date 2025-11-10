plugins {
    id("common.conventions")
}

val libs: VersionCatalog = the<VersionCatalogsExtension>().named("libs")
extra["springCloudVersion"] = libs.findVersion("spring-cloud").get().toString()

val springCloudVersion: String by extra

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
    }
}
