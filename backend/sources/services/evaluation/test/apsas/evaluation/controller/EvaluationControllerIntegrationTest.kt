package apsas.evaluation.controller

import apsas.evaluation.EvaluationServiceApplication
import apsas.evaluation.IntegrationSpec
import apsas.evaluation.client.PistonApiClient
import apsas.evaluation.helper.TestDataFactory
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.mockito.kotlin.given
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.bean.override.mockito.MockitoBean
import kotlin.test.Test

/**
 * Integration test for EvaluationController
 * Tests REST endpoints with mocked external dependencies (PistonApiClient)
 */
@ContextConfiguration(classes = [EvaluationServiceApplication::class])
class EvaluationControllerIntegrationTest : IntegrationSpec() {
    @MockitoBean
    private lateinit var pistonApiClient: PistonApiClient

    @Nested
    @DisplayName("GET /api/v1/runtimes")
    inner class GetRuntimesTests {
        @Test
        fun `should return list of supported runtimes when successful`() {
            // Given
            val mockRuntimes = TestDataFactory.createRuntimesList()
            given(pistonApiClient.runtimes)
                .willReturn(mockRuntimes)

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody()
                .jsonPath("$")
                .isArray()
                .jsonPath("$.length()")
                .isEqualTo(3)
                .jsonPath("$[0].language")
                .isEqualTo("python")
                .jsonPath("$[0].version")
                .isEqualTo("3.10.0")
                .jsonPath("$[1].language")
                .isEqualTo("java")
                .jsonPath("$[1].version")
                .isEqualTo("17.0.0")
                .jsonPath("$[2].language")
                .isEqualTo("javascript")
                .jsonPath("$[2].version")
                .isEqualTo("18.15.0")
        }

        @Test
        fun `should return empty list when no runtimes available`() {
            // Given
            given(pistonApiClient.runtimes).willReturn(emptyList())

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody()
                .jsonPath("$")
                .isArray()
                .jsonPath("$.length()")
                .isEqualTo(0)
        }

        @Test
        fun `should be accessible by students`() {
            // Given
            val mockRuntimes = TestDataFactory.createRuntimesList()

            given(pistonApiClient.runtimes)
                .willReturn(mockRuntimes)

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
        }

        @Test
        fun `should handle PistonApiClient errors gracefully`() {
            // Given

            given(pistonApiClient.runtimes)
                .willThrow(RuntimeException("Piston API unavailable"))

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .is5xxServerError()
        }
    }

    @Nested
    @DisplayName("Response Format Tests")
    inner class ResponseFormatTests {
        @Test
        fun `should return properly formatted runtime response`() {
            // Given
            val mockRuntimes = TestDataFactory.createRuntimesList()

            given(pistonApiClient.runtimes)
                .willReturn(mockRuntimes)

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody()
                .jsonPath("$[0].language")
                .exists()
                .jsonPath("$[0].version")
                .exists()
                .jsonPath("$[0].aliases")
                .exists()
                .jsonPath("$[0].aliases")
                .isArray()
        }

        @Test
        fun `should return correct HTTP status codes`() {
            // Given - Success case
            val mockRuntimes = TestDataFactory.createRuntimesList()

            given(pistonApiClient.runtimes)
                .willReturn(mockRuntimes)

            // When/Then - 200 for successful request
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
        }
    }

    @Nested
    @DisplayName("Content-Type Tests")
    inner class ContentTypeTests {
        @Test
        fun `should return JSON content type`() {
            // Given
            val mockRuntimes = TestDataFactory.createRuntimesList()

            given(pistonApiClient.runtimes)
                .willReturn(mockRuntimes)

            // When/Then
            webClient
                .get()
                .uri("/api/v1/runtimes")
                .exchange()
                .expectStatus()
                .isOk()
                .expectHeader()
                .contentType("application/json")
        }
    }
}
