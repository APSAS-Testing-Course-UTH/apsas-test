plugins {
    java
    id("io.spring.dependency-management")
    id("org.sonarqube")
    id("io.qameta.allure-adapter")
    jacoco
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }

    @Suppress("UnstableApiUsage")
    sourceSets {
        main {
            java.setSrcDirs(listOf("src"))
            resources.setSrcDirs(listOf("resources"))
        }
        test {
            java.setSrcDirs(listOf("test"))
            resources.setSrcDirs(listOf("testResources"))
        }
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

val libs: VersionCatalog = the<VersionCatalogsExtension>().named("libs")

dependencies {
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    testImplementation(platform(libs.findLibrary("instancio-bom").get()))
    testImplementation(libs.findLibrary("instancio-core").get())
    testImplementation(libs.findLibrary("instancio-junit").get())

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

sonar {
    properties {
        property("sonar.sources", "src")
        if (projectDir.resolve("test").exists()) {
            property("sonar.tests", "test")
        }
    }
}

tasks {
    withType<JavaCompile> {
        options.encoding = "UTF-8"
        options.release = 21
    }

    withType<Test> {
        useJUnitPlatform()
    }

    test {
        finalizedBy(tasks.jacocoTestReport)
    }

    jacocoTestReport {
        dependsOn(tasks.test)
        reports {
            xml.required = true
            html.required = true
        }
    }
}

allure {
    adapter {
        frameworks {
            junit5
        }
    }
}
