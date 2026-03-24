plugins {
    alias(libs.plugins.sonarqube)
}

sonar {
    properties {
        property("sonar.projectKey", findProperty("sonar.projectKey").toString())
        property("sonar.organization", findProperty("sonar.organization").toString())
        property(
            "sonar.coverage.jacoco.xmlReportPaths",
            "**/build/reports/jacoco/test/jacocoTestReport.xml",
        )
    }
}
