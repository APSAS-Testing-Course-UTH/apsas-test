package apsas.content.controller

import apsas.content.ContentServiceApplication
import apsas.content.helper.TestDataFactory
import apsas.content.helper.TestDataHelper
import apsas.content.repository.TutorialRepository
import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_CONTENT_PROVIDER
import apsas.shared.test.P_INSTRUCTOR
import apsas.shared.test.P_OTHER_INSTRUCTOR
import apsas.shared.test.P_STUDENT
import apsas.shared.test.withPrincipal
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertTrue

@ContextConfiguration(classes = [ContentServiceApplication::class])
class TutorialControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var tutorialRepository: TutorialRepository

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/tutorials")
    inner class GetAllTutorialsTests {
        @Test
        fun `should get paginated tutorials`() {
            val creatorId = java.util.UUID.randomUUID()
            testDataHelper.createTutorial(title = "Java Basics", creatorId = creatorId)
            testDataHelper.createTutorial(title = "Python Basics", creatorId = creatorId)

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/tutorials")
                        .queryParam("page", 0)
                        .queryParam("size", 10)
                        .build()
                }.withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content")
                .isArray
                .jsonPath("$.content.length()")
                .isEqualTo(2)
                .jsonPath("$.totalElements")
                .isEqualTo(2)
        }

        @Test
        fun `should return empty page when no tutorials exist`() {
            webClient
                .get()
                .uri("/api/v1/tutorials?page=0&size=10")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content")
                .isArray
                .jsonPath("$.content.length()")
                .isEqualTo(0)
                .jsonPath("$.totalElements")
                .isEqualTo(0)
        }
    }

    @Nested
    @DisplayName("GET /api/v1/tutorials/{id}")
    inner class GetTutorialByIdTests {
        @Test
        fun `should get tutorial by id`() {
            val tutorial = testDataHelper.createTutorial(title = "OOP Concepts")

            webClient
                .get()
                .uri("/api/v1/tutorials/${tutorial.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(tutorial.id.toString())
                .jsonPath("$.title")
                .isEqualTo("OOP Concepts")
        }

        @Test
        fun `should return 404 when tutorial not found`() {
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .get()
                .uri("/api/v1/tutorials/$nonExistentId")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/v1/tutorials")
    inner class CreateTutorialTests {
        @Test
        fun `should create tutorial as content provider`() {
            val principal = P_CONTENT_PROVIDER
            val request =
                TestDataFactory.createTutorialRequest(
                    title = "New Tutorial",
                    content = "Tutorial content here",
                )

            webClient
                .post()
                .uri("/api/v1/tutorials")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.title")
                .isEqualTo("New Tutorial")
                .jsonPath("$.content")
                .isEqualTo("Tutorial content here")
                .jsonPath("$.creatorId")
                .isEqualTo(principal.userId.toString())
        }

        @Test
        fun `should return 403 when instructor tries to create tutorial`() {
            val principal = P_INSTRUCTOR
            val request = TestDataFactory.createTutorialRequest(title = "Instructor Tutorial")

            webClient
                .post()
                .uri("/api/v1/tutorials")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 403 when student tries to create tutorial`() {
            val principal = P_STUDENT
            val request = TestDataFactory.createTutorialRequest()

            webClient
                .post()
                .uri("/api/v1/tutorials")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 400 when request is invalid`() {
            val principal = P_CONTENT_PROVIDER
            val invalidRequest =
                mapOf(
                    "title" to "",
                    "content" to "",
                )

            webClient
                .post()
                .uri("/api/v1/tutorials")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/tutorials/{id}")
    inner class UpdateTutorialTests {
        @Test
        fun `should update tutorial as creator`() {
            val creatorId = P_CONTENT_PROVIDER.userId
            val tutorial =
                testDataHelper.createTutorial(
                    title = "Original Title",
                    creatorId = creatorId,
                )

            val updateRequest =
                TestDataFactory.createUpdateTutorialRequest(
                    title = "Updated Title",
                    content = "Updated content",
                )

            webClient
                .patch()
                .uri("/api/v1/tutorials/${tutorial.id}")
                .withPrincipal(P_CONTENT_PROVIDER)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(tutorial.id.toString())
                .jsonPath("$.title")
                .isEqualTo("Updated Title")
                .jsonPath("$.content")
                .isEqualTo("Updated content")
        }

        @Test
        fun `should return 403 when non-creator tries to update`() {
            val creatorId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR

            val tutorial =
                testDataHelper.createTutorial(
                    title = "Original Title",
                    creatorId = creatorId,
                )

            val updateRequest = TestDataFactory.createUpdateTutorialRequest()

            webClient
                .patch()
                .uri("/api/v1/tutorials/${tutorial.id}")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when updating non-existent tutorial`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()
            val updateRequest = TestDataFactory.createUpdateTutorialRequest()

            webClient
                .patch()
                .uri("/api/v1/tutorials/$nonExistentId")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/tutorials/{id}")
    inner class DeleteTutorialTests {
        @Test
        fun `should delete tutorial as creator`() {
            val principal = P_CONTENT_PROVIDER
            val tutorial = testDataHelper.createTutorial(creatorId = principal.userId)

            webClient
                .delete()
                .uri("/api/v1/tutorials/${tutorial.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNoContent

            // Verify tutorial is deleted
            val deletedTutorial = tutorialRepository.findById(tutorial.id)
            assertTrue(deletedTutorial.isEmpty)
        }

        @Test
        fun `should return 403 when non-creator tries to delete`() {
            val creatorId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR

            val tutorial = testDataHelper.createTutorial(creatorId = creatorId)

            webClient
                .delete()
                .uri("/api/v1/tutorials/${tutorial.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when deleting non-existent tutorial`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .delete()
                .uri("/api/v1/tutorials/$nonExistentId")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }
}
