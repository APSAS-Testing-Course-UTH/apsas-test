plugins {
    kotlin("jvm")
}

kotlin {
    sourceSets {
        val main by getting {
            kotlin.setSrcDirs(listOf("src"))
            resources.setSrcDirs(listOf("resources"))
        }
        val test by getting {
            kotlin.setSrcDirs(listOf("test"))
            resources.setSrcDirs(listOf("testResources"))
        }
    }
}
