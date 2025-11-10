plugins {
    id("kotlin.conventions")
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
}

val libs: VersionCatalog = extensions.getByType<VersionCatalogsExtension>().named("libs")
val kotlinVersion = libs.findVersion("kotlin").get().toString()

extra["kotlin.version"] = kotlinVersion

dependencies {
    implementation(enforcedPlatform("org.jetbrains.kotlin:kotlin-bom:$kotlinVersion"))
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}
