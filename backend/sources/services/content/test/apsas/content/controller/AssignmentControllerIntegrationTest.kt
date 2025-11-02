package apsas.content.controller

import apsas.content.ContentServiceApplication
import apsas.content.helper.TestDataFactory
import apsas.content.helper.TestDataHelper
import apsas.content.model.entity.AssignmentStatus
import apsas.content.model.entity.DifficultyLevel
import apsas.content.repository.AssignmentRepository
import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_CONTENT_PROVIDER
import apsas.shared.test.P_INSTRUCTOR
import apsas.shared.test.P_OTHER_INSTRUCTOR
import apsas.shared.test.P_STUDENT
import apsas.shared.test.withId
import apsas.shared.test.withPrincipal
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import java.time.LocalDateTime
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ContextConfiguration(classes = [ContentServiceApplication::class])
class AssignmentControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/assignments")
    inner class GetAllAssignmentsTests {
        @Test
        fun `should get paginated assignments`() {
            // Create test assignments
            val assignment1 = testDataHelper.createPublishedAssignment(title = "Assignment 1")
            val assignment2 = testDataHelper.createPublishedAssignment(title = "Assignment 2")

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/assignments")
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
                .jsonPath("$.content[0].title")
                .exists()
                .jsonPath("$.content[1].title")
                .exists()
        }

        @Test
        fun `should return empty page when no assignments exist`() {
            webClient
                .get()
                .uri("/api/v1/assignments?page=0&size=10")
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
    @DisplayName("GET /api/v1/assignments/{id}")
    inner class GetAssignmentByIdTests {
        @Test
        fun `should get assignment by id`() {
            val assignment = testDataHelper.createPublishedAssignment(title = "Test Assignment")

            webClient
                .get()
                .uri("/api/v1/assignments/${assignment.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(assignment.id.toString())
                .jsonPath("$.title")
                .isEqualTo("Test Assignment")
                .jsonPath("$.status")
                .isEqualTo(AssignmentStatus.PUBLISHED.name)
        }

        @Test
        fun `should return 404 when assignment not found`() {
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .get()
                .uri("/api/v1/assignments/$nonExistentId")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/v1/assignments")
    inner class CreateAssignmentTests {
        @Test
        fun `should create assignment as content provider`() {
            val principal = P_CONTENT_PROVIDER
            val request =
                TestDataFactory.createAssignmentRequest(
                    title = "New Assignment",
                    description = "New assignment description",
                    difficultyLevel = DifficultyLevel.MEDIUM,
                )

            webClient
                .post()
                .uri("/api/v1/assignments")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.title")
                .isEqualTo("New Assignment")
                .jsonPath("$.description")
                .isEqualTo("New assignment description")
                .jsonPath("$.difficultyLevel")
                .isEqualTo(DifficultyLevel.MEDIUM.name)
                .jsonPath("$.status")
                .isEqualTo(AssignmentStatus.DRAFT.name)
                .jsonPath("$.creatorId")
                .isEqualTo(principal.userId.toString())
        }

        @Test
        fun `should return 403 when instructor tries to create assignment`() {
            val principal = P_INSTRUCTOR
            val request = TestDataFactory.createAssignmentRequest(title = "Instructor Assignment")

            webClient
                .post()
                .uri("/api/v1/assignments")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 403 when student tries to create assignment`() {
            val principal = P_STUDENT
            val request = TestDataFactory.createAssignmentRequest()

            webClient
                .post()
                .uri("/api/v1/assignments")
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
                    "description" to "Description",
                )

            webClient
                .post()
                .uri("/api/v1/assignments")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should create assignment with skills and tutorials`() {
            val principal = P_CONTENT_PROVIDER
            val skill = testDataHelper.createSkill(name = "Java Programming")
            val tutorial =
                testDataHelper.createTutorial(title = "Java Basics", creatorId = principal.userId)

            val request =
                TestDataFactory.createAssignmentRequest(
                    title = "Assignment with Resources",
                    skillIds = setOf(skill.id),
                    tutorialIds = setOf(tutorial.id),
                )

            webClient
                .post()
                .uri("/api/v1/assignments")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.title")
                .isEqualTo("Assignment with Resources")
                .jsonPath("$.skills.length()")
                .isEqualTo(1)
                .jsonPath("$.tutorials.length()")
                .isEqualTo(1)
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/assignments/{id}")
    inner class UpdateAssignmentTests {
        @Test
        fun `should update assignment as creator`() {
            val principal = P_CONTENT_PROVIDER
            val assignment =
                testDataHelper.createAssignment(
                    title = "Original Title",
                    creatorId = principal.userId,
                )

            val updateRequest =
                TestDataFactory.createUpdateAssignmentRequest(
                    title = "Updated Title",
                    description = "Updated description",
                )

            webClient
                .patch()
                .uri("/api/v1/assignments/${assignment.id}")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(assignment.id.toString())
                .jsonPath("$.title")
                .isEqualTo("Updated Title")
                .jsonPath("$.description")
                .isEqualTo("Updated description")
        }

        @Test
        fun `should return 403 when non-creator tries to update`() {
            val creatorId = java.util.UUID.randomUUID()
            val otherUserId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR.withId(otherUserId)

            val assignment =
                testDataHelper.createAssignment(
                    title = "Original Title",
                    creatorId = creatorId,
                )

            val updateRequest = TestDataFactory.createUpdateAssignmentRequest()

            webClient
                .patch()
                .uri("/api/v1/assignments/${assignment.id}")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when updating non-existent assignment`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()
            val updateRequest = TestDataFactory.createUpdateAssignmentRequest()

            webClient
                .patch()
                .uri("/api/v1/assignments/$nonExistentId")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateRequest)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/assignments/{id}/schedule")
    inner class UpdateAssignmentScheduleTests {
        @Test
        fun `should update assignment schedule as instructor`() {
            val principal = P_INSTRUCTOR
            val assignment = testDataHelper.createAssignment(creatorId = principal.userId)

            val scheduleRequest =
                TestDataFactory.createUpdateAssignmentScheduleRequest(
                    startDate = LocalDateTime.now().plusDays(1),
                    dueDate = LocalDateTime.now().plusDays(8),
                )

            webClient
                .patch()
                .uri("/api/v1/assignments/${assignment.id}/schedule")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(scheduleRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.startDate")
                .exists()
                .jsonPath("$.dueDate")
                .exists()
        }

        @Test
        fun `should return 403 when student tries to update schedule`() {
            val creatorId = java.util.UUID.randomUUID()
            val principal = P_STUDENT
            val assignment = testDataHelper.createAssignment(creatorId = creatorId)

            val scheduleRequest = TestDataFactory.createUpdateAssignmentScheduleRequest()

            webClient
                .patch()
                .uri("/api/v1/assignments/${assignment.id}/schedule")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(scheduleRequest)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/assignments/{id}")
    inner class DeleteAssignmentTests {
        @Test
        fun `should delete assignment as creator`() {
            val principal = P_CONTENT_PROVIDER
            val assignment = testDataHelper.createAssignment(creatorId = principal.userId)

            webClient
                .delete()
                .uri("/api/v1/assignments/${assignment.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNoContent

            // Verify assignment is deleted
            val deletedAssignment = assignmentRepository.findById(assignment.id)
            assertTrue(deletedAssignment.isEmpty)
        }

        @Test
        fun `should return 403 when non-creator tries to delete`() {
            val creatorId = java.util.UUID.randomUUID()
            val otherUserId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR.withId(otherUserId)

            val assignment = testDataHelper.createAssignment(creatorId = creatorId)

            webClient
                .delete()
                .uri("/api/v1/assignments/${assignment.id}")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when deleting non-existent assignment`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .delete()
                .uri("/api/v1/assignments/$nonExistentId")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/v1/assignments/{id}/publish")
    inner class PublishAssignmentTests {
        @Test
        fun `should publish assignment as creator`() {
            val principal = P_CONTENT_PROVIDER
            val assignment =
                testDataHelper.createAssignment(
                    creatorId = principal.userId,
                    status = AssignmentStatus.DRAFT,
                )

            webClient
                .post()
                .uri("/api/v1/assignments/${assignment.id}/publish")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.status")
                .isEqualTo(AssignmentStatus.PUBLISHED.name)

            // Verify status is updated
            val updatedAssignment = assignmentRepository.findById(assignment.id).get()
            assertEquals(AssignmentStatus.PUBLISHED, updatedAssignment.status)
        }

        @Test
        fun `should return 403 when non-creator tries to publish`() {
            val creatorId = java.util.UUID.randomUUID()
            val otherUserId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR.withId(otherUserId)

            val assignment =
                testDataHelper.createAssignment(
                    creatorId = creatorId,
                    status = AssignmentStatus.DRAFT,
                )

            webClient
                .post()
                .uri("/api/v1/assignments/${assignment.id}/publish")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when publishing non-existent assignment`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .post()
                .uri("/api/v1/assignments/$nonExistentId/publish")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/v1/assignments/{id}/archive")
    inner class ArchiveAssignmentTests {
        @Test
        fun `should archive assignment as creator`() {
            val principal = P_CONTENT_PROVIDER
            val assignment = testDataHelper.createPublishedAssignment(creatorId = principal.userId)

            webClient
                .post()
                .uri("/api/v1/assignments/${assignment.id}/archive")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.status")
                .isEqualTo(AssignmentStatus.ARCHIVED.name)

            // Verify status is updated
            val updatedAssignment = assignmentRepository.findById(assignment.id).get()
            assertEquals(AssignmentStatus.ARCHIVED, updatedAssignment.status)
        }

        @Test
        fun `should return 403 when non-creator tries to archive`() {
            val creatorId = java.util.UUID.randomUUID()
            val otherUserId = java.util.UUID.randomUUID()
            val principal = P_OTHER_INSTRUCTOR.withId(otherUserId)

            val assignment = testDataHelper.createPublishedAssignment(creatorId = creatorId)

            webClient
                .post()
                .uri("/api/v1/assignments/${assignment.id}/archive")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 404 when archiving non-existent assignment`() {
            val principal = P_CONTENT_PROVIDER
            val nonExistentId = java.util.UUID.randomUUID()

            webClient
                .post()
                .uri("/api/v1/assignments/$nonExistentId/archive")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }
}
