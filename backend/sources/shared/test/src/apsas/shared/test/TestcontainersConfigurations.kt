package apsas.shared.test

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class PostgresConfiguration {
    @Bean
    @ServiceConnection
    fun postgresContainer(): PostgreSQLContainer<*> =
        PostgreSQLContainer(DockerImageName.parse("postgres:17-alpine")).apply {
            withDatabaseName("apsas")
            withUsername("apsas")
            withPassword("apsas")
        }
}

@TestConfiguration(proxyBeanMethods = false)
class RabbitMqConfiguration {
    @Bean
    @ServiceConnection
    fun rabbitMqContainer(): RabbitMQContainer =
        RabbitMQContainer(DockerImageName.parse("rabbitmq:4.1-alpine")).apply {
            withAdminUser("apsas")
            withAdminPassword("apsas")
        }
}
