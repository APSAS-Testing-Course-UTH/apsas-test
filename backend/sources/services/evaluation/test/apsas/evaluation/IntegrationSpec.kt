package apsas.evaluation

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.reactive.server.WebTestClient
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.utility.DockerImageName

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(RabbitMqConfiguration::class)
@ActiveProfiles("integration")
@ContextConfiguration(classes = [EvaluationServiceApplication::class])
abstract class IntegrationSpec {
    @Autowired
    lateinit var webClient: WebTestClient
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
