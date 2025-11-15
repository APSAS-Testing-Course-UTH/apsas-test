@file:Suppress("UnstableApiUsage")

pluginManagement {
    includeBuild("build-logic")
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")
}

rootProject.name = "apsas-backend"

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

sequenceOf(
    // Infrastructure
    "sources:service-registry",
    "sources:config-server",
    "sources:gateway",
    // Shared libraries
    "sources:shared:security",
    "sources:shared:messaging",
    "sources:shared:exception",
    "sources:shared:models",
    "sources:shared:feign-clients",
    "sources:shared:cache",
    "sources:shared:api-docs",
    // Services
    "sources:services:identity",
    "sources:services:content",
    "sources:services:submission",
    "sources:services:evaluation",
    "sources:services:notification",
    "sources:services:support",
    // Frontend
    "sources:admin-portal",
).forEach { include(it) }
