package apsas.content.controller

import apsas.content.ContentServiceApplication
import apsas.content.helper.TestDataFactory
import apsas.content.helper.TestDataHelper
import apsas.content.repository.SkillRepository
import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_CONTENT_PROVIDER
import apsas.shared.test.P_INSTRUCTOR
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
class SkillControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var skillRepository: SkillRepository

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/skills")
    inner class GetAllSkillsTests {
        @Test
        fun `should get paginated skills`() {
            testDataHelper.createSkill(name = "Java Programming")
            testDataHelper.createSkill(name = "Python Programming")

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/skills")
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
        fun `should return empty page when no skills exist`() {
            webClient
                .get()
                .uri("/api/v1/skills?page=0&size=10")
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
    @DisplayName("GET /api/v1/skills/{id}")
    inner class GetSkillByIdTests {
        @Test
        fun `should get skill by id`() {
            val skill = testDataHelper.createSkill(name = "Data Structures")

            webClient
                .get()
                .uri("/api/v1/skills/${skill.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(skill.id.toString())
                .jsonPath("$.name")
                .isEqualTo("Data Structures")
        }

        @Test
        fun `should return 404 when skill not found`() {
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .get()
                .uri("/api/v1/skills/$nonExistentId")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/v1/skills")
    inner class CreateSkillTests {
        @Test
        fun `should create skill as content provider`() {
            val principal = P_CONTENT_PROVIDER
            val request =
                TestDataFactory.createSkillRequest(
                    name = "Algorithms",
                    description = "Algorithm design and analysis",
                )

            webClient
                .post()
                .uri("/api/v1/skills")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.name")
                .isEqualTo("Algorithms")
                .jsonPath("$.description")
                .isEqualTo("Algorithm design and analysis")
        }

        @Test
        fun `should return 403 when instructor tries to create skill`() {
            val principal = P_INSTRUCTOR
            val request = TestDataFactory.createSkillRequest(name = "Design Patterns")

            webClient
                .post()
                .uri("/api/v1/skills")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 403 when student tries to create skill`() {
            val principal = P_STUDENT
            val request = TestDataFactory.createSkillRequest()

            webClient
                .post()
                .uri("/api/v1/skills")
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
            val invalidRequest = mapOf("name" to "")

            webClient
                .post()
                .uri("/api/v1/skills")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/skills/{id}")
    inner class UpdateSkillTests {
        @Test
        fun `should update skill as content provider`() {
            val principal = P_CONTENT_PROVIDER
            val skill = testDataHelper.createSkill(name = "Original Name")

            val updateRequest =
                TestDataFactory.createUpdateSkillRequest(
                    name = "Updated Name",
                    description = "Updated description",
                )

            webClient
                .patch()
                .uri("/api/v1/skills/${skill.id}")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(skill.id.toString())
                .jsonPath("$.name")
                .isEqualTo("Updated Name")
                .jsonPath("$.description")
                .isEqualTo("Updated description")
        }

        @Test
        fun `should return 403 when student tries to update skill`() {
            val principal = P_STUDENT
            val skill = testDataHelper.createSkill(name = "Test Skill")
            val updateRequest = TestDataFactory.createUpdateSkillRequest()

            webClient
                .patch()
                .uri("/api/v1/skills/${skill.id}")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when updating non-existent skill`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()
            val updateRequest = TestDataFactory.createUpdateSkillRequest()

            webClient
                .patch()
                .uri("/api/v1/skills/$nonExistentId")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/skills/{id}")
    inner class DeleteSkillTests {
        @Test
        fun `should delete skill as content provider`() {
            val principal = P_CONTENT_PROVIDER
            val skill = testDataHelper.createSkill(name = "To Be Deleted")

            webClient
                .delete()
                .uri("/api/v1/skills/${skill.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNoContent

            // Verify skill is deleted
            val deletedSkill = skillRepository.findById(skill.id)
            assertTrue(deletedSkill.isEmpty)
        }

        @Test
        fun `should return 403 when student tries to delete skill`() {
            val principal = P_STUDENT
            val skill = testDataHelper.createSkill(name = "Test Skill")

            webClient
                .delete()
                .uri("/api/v1/skills/${skill.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when deleting non-existent skill`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .delete()
                .uri("/api/v1/skills/$nonExistentId")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }
}
