plugins {
    `kotlin-dsl`
}

repositories {
    gradlePluginPortal()
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation(plugin(libs.plugins.spring.boot))
    implementation(plugin(libs.plugins.spring.dependency.management))
}

fun plugin(plugin: Provider<PluginDependency>): Provider<String> =
    plugin.map { "${it.pluginId}:${it.pluginId}.gradle.plugin:${it.version}" }
