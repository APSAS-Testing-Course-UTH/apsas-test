plugins {
    id("kotlin-spring.conventions")
}

dependencies {
    testImplementation(project(":sources:shared:test"))
}

tasks.withType<Test> {
    jvmArgs("-XX:+EnableDynamicAgentLoading")
    useJUnitPlatform()
}
