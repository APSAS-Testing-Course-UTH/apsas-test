plugins {
    java
    id("io.spring.dependency-management")
    id("org.sonarqube")
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

dependencies {
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.release = 21
}

sonar {
    properties {
        property("sonar.projectKey", findProperty("sonar.projectKey").toString())
        property("sonar.organization", findProperty("sonar.organization").toString())
    }
}
