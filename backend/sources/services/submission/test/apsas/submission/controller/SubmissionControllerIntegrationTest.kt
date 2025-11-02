package apsas.submission.controller

import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_INSTRUCTOR
import apsas.shared.test.P_OTHER_INSTRUCTOR
import apsas.shared.test.P_OTHER_STUDENT
import apsas.shared.test.P_STUDENT
import apsas.shared.test.withPrincipal
import apsas.submission.SubmissionServiceApplication
import apsas.submission.helper.TestDataFactory
import apsas.submission.helper.TestDataHelper
import apsas.submission.model.entity.SubmissionResult
import apsas.submission.model.entity.SubmissionStatus
import apsas.submission.repository.SubmissionRepository
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import java.math.BigDecimal
import java.util.UUID
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertTrue

@ContextConfiguration(classes = [SubmissionServiceApplication::class])
class SubmissionControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var submissionRepository: SubmissionRepository

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/submissions")
    inner class GetAllSubmissionsTests {
        @Test
        fun `should get student's own submissions only`() {
            val assignmentId = UUID.randomUUID()
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_STUDENT.userId(),
                code = "print('test1')",
                language = "python",
            )
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_OTHER_STUDENT.userId(),
                code = "print('test2')",
                language = "python",
            )

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/submissions")
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
                .isEqualTo(1)
                .jsonPath("$.content[0].studentId")
                .isEqualTo(P_STUDENT.userId().toString())
                .jsonPath("$.totalElements")
                .isEqualTo(1)
        }

        @Test
        fun `should return empty page when student has no submissions`() {
            webClient
                .get()
                .uri("/api/v1/submissions?page=0&size=10")
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

        @Test
        fun `should allow instructor to see all submissions`() {
            val assignmentId = UUID.randomUUID()
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_STUDENT.userId(),
            )
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_OTHER_STUDENT.userId(),
            )

            webClient
                .get()
                .uri("/api/v1/submissions?page=0&size=10")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(2)
                .jsonPath("$.totalElements")
                .isEqualTo(2)
        }

        @Test
        fun `should allow instructor to filter by assignment ID`() {
            val assignmentId1 = UUID.randomUUID()
            val assignmentId2 = UUID.randomUUID()
            testDataHelper.createSubmission(
                assignmentId = assignmentId1,
                studentId = P_STUDENT.userId(),
            )
            testDataHelper.createSubmission(
                assignmentId = assignmentId2,
                studentId = P_STUDENT.userId(),
            )

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/submissions")
                        .queryParam("assignmentId", assignmentId1)
                        .queryParam("page", 0)
                        .queryParam("size", 10)
                        .build()
                }.withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(1)
                .jsonPath("$.content[0].assignmentId")
                .isEqualTo(assignmentId1.toString())
        }

        @Test
        fun `should allow instructor to filter by student ID`() {
            val assignmentId = UUID.randomUUID()
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_STUDENT.userId(),
            )
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_OTHER_STUDENT.userId(),
            )

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/submissions")
                        .queryParam("studentId", P_STUDENT.userId())
                        .queryParam("page", 0)
                        .queryParam("size", 10)
                        .build()
                }.withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(1)
                .jsonPath("$.content[0].studentId")
                .isEqualTo(P_STUDENT.userId().toString())
        }

        @Test
        fun `should allow instructor to filter by status`() {
            val assignmentId = UUID.randomUUID()
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_STUDENT.userId(),
                status = SubmissionStatus.PENDING,
            )
            testDataHelper.createSubmission(
                assignmentId = assignmentId,
                studentId = P_OTHER_STUDENT.userId(),
                status = SubmissionStatus.EVALUATED,
            )

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/submissions")
                        .queryParam("status", "PENDING")
                        .queryParam("page", 0)
                        .queryParam("size", 10)
                        .build()
                }.withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(1)
                .jsonPath("$.content[0].status")
                .isEqualTo("PENDING")
        }

        @Test
        fun `should support pagination`() {
            val assignmentId = UUID.randomUUID()
            repeat(15) {
                testDataHelper.createSubmission(
                    assignmentId = assignmentId,
                    studentId = UUID.randomUUID(),
                    code = "code$it",
                )
            }

            webClient
                .get()
                .uri("/api/v1/submissions?page=0&size=10")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(10)
                .jsonPath("$.totalElements")
                .isEqualTo(15)
                .jsonPath("$.totalPages")
                .isEqualTo(2)
        }
    }

    @Nested
    @DisplayName("GET /api/v1/submissions/{id}")
    inner class GetSubmissionByIdTests {
        @Test
        fun `should get submission by id as student owning it`() {
            val submission = testDataHelper.createSubmission(studentId = P_STUDENT.userId())

            webClient
                .get()
                .uri("/api/v1/submissions/${submission.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(submission.id.toString())
                .jsonPath("$.studentId")
                .isEqualTo(P_STUDENT.userId().toString())
                .jsonPath("$.code")
                .isEqualTo(submission.code)
        }

        @Test
        fun `should return 403 when student tries to access other student's submission`() {
            val submission = testDataHelper.createSubmission(studentId = P_OTHER_STUDENT.userId())

            webClient
                .get()
                .uri("/api/v1/submissions/${submission.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should allow instructor to view any submission`() {
            val submission = testDataHelper.createSubmission(studentId = P_STUDENT.userId())

            webClient
                .get()
                .uri("/api/v1/submissions/${submission.id}")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(submission.id.toString())
                .jsonPath("$.studentId")
                .isEqualTo(P_STUDENT.userId().toString())
        }

        @Test
        fun `should return 404 when submission not found`() {
            val nonExistentId = UUID.randomUUID()

            webClient
                .get()
                .uri("/api/v1/submissions/$nonExistentId")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound
        }

        @Test
        fun `should include evaluation details when submission is evaluated`() {
            val submission =
                testDataHelper.createEvaluatedSubmission(
                    studentId = P_STUDENT.userId(),
                    result = SubmissionResult.PASSED,
                    score = BigDecimal("95.50"),
                )

            webClient
                .get()
                .uri("/api/v1/submissions/${submission.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.status")
                .isEqualTo("EVALUATED")
                .jsonPath("$.result")
                .isEqualTo("PASSED")
                .jsonPath("$.score")
                .isEqualTo(95.50)
                .jsonPath("$.feedback")
                .isEqualTo(submission.feedback)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/submissions")
    inner class CreateSubmissionTests {
        @Test
        fun `should create submission as student`() {
            val assignmentId = UUID.randomUUID()
            val request =
                TestDataFactory.createSubmissionRequest(
                    assignmentId = assignmentId,
                    code = "print('hello world')",
                    language = "python",
                )

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.assignmentId")
                .isEqualTo(assignmentId.toString())
                .jsonPath("$.studentId")
                .isEqualTo(P_STUDENT.userId().toString())
                .jsonPath("$.code")
                .isEqualTo("print('hello world')")
                .jsonPath("$.language")
                .isEqualTo("python")
                .jsonPath("$.status")
                .isEqualTo("PENDING")
        }

        @Test
        fun `should set submitted_at timestamp on creation`() {
            val assignmentId = UUID.randomUUID()
            val request = TestDataFactory.createSubmissionRequest(assignmentId = assignmentId)

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.submittedAt")
                .isNotEmpty
        }

        @Test
        fun `should return 403 when instructor tries to create submission`() {
            val request = TestDataFactory.createSubmissionRequest()

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 400 when assignment id is missing`() {
            val invalidRequest =
                mapOf(
                    "code" to "print('hello')",
                    "language" to "python",
                )

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should return 400 when code is blank`() {
            val invalidRequest =
                mapOf(
                    "assignmentId" to UUID.randomUUID().toString(),
                    "code" to "",
                    "language" to "python",
                )

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should return 400 when language is blank`() {
            val invalidRequest =
                mapOf(
                    "assignmentId" to UUID.randomUUID().toString(),
                    "code" to "print('hello')",
                    "language" to "",
                )

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should allow multiple submissions for same assignment by same student`() {
            val assignmentId = UUID.randomUUID()
            val request1 =
                TestDataFactory.createSubmissionRequest(
                    assignmentId = assignmentId,
                    code = "first attempt",
                )
            val request2 =
                TestDataFactory.createSubmissionRequest(
                    assignmentId = assignmentId,
                    code = "second attempt",
                )

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request1)
                .exchange()
                .expectStatus()
                .isCreated

            webClient
                .post()
                .uri("/api/v1/submissions")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request2)
                .exchange()
                .expectStatus()
                .isCreated

            // Verify both submissions exist
            val submissions = submissionRepository.findAll()
            assertTrue(submissions.size >= 2)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/submissions/{id}/feedback")
    inner class ProvideFeedbackTests {
        @Test
        fun `should add feedback as instructor`() {
            val submission =
                testDataHelper.createSubmission(
                    studentId = P_STUDENT.userId(),
                    feedback = null,
                )
            val feedbackRequest =
                TestDataFactory.createFeedbackRequest(
                    feedback = "Great work! Check edge cases.",
                )

            webClient
                .post()
                .uri("/api/v1/submissions/${submission.id}/feedback")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(feedbackRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(submission.id.toString())
                .jsonPath("$.feedback")
                .isEqualTo("Great work! Check edge cases.")
        }

        @Test
        fun `should update existing feedback`() {
            val submission =
                testDataHelper.createSubmission(
                    studentId = P_STUDENT.userId(),
                    feedback = "Old feedback",
                )
            val newFeedbackRequest =
                TestDataFactory.createFeedbackRequest(
                    feedback = "New improved feedback",
                )

            webClient
                .post()
                .uri("/api/v1/submissions/${submission.id}/feedback")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newFeedbackRequest)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.feedback")
                .isEqualTo("New improved feedback")
        }

        @Test
        fun `should return 403 when student tries to provide feedback`() {
            val submission = testDataHelper.createSubmission(studentId = P_STUDENT.userId())
            val feedbackRequest = TestDataFactory.createFeedbackRequest()

            webClient
                .post()
                .uri("/api/v1/submissions/${submission.id}/feedback")
                .withPrincipal(P_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(feedbackRequest)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should allow different instructor to provide feedback`() {
            val submission = testDataHelper.createSubmission(studentId = P_STUDENT.userId())
            val feedbackRequest =
                TestDataFactory.createFeedbackRequest(
                    feedback = "Feedback from another instructor",
                )

            webClient
                .post()
                .uri("/api/v1/submissions/${submission.id}/feedback")
                .withPrincipal(P_OTHER_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(feedbackRequest)
                .exchange()
                .expectStatus()
                .isOk
        }

        @Test
        fun `should return 404 when submission not found`() {
            val nonExistentId = UUID.randomUUID()
            val feedbackRequest = TestDataFactory.createFeedbackRequest()

            webClient
                .post()
                .uri("/api/v1/submissions/$nonExistentId/feedback")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(feedbackRequest)
                .exchange()
                .expectStatus()
                .isNotFound
        }

        @Test
        fun `should return 400 when feedback is blank`() {
            val submission = testDataHelper.createSubmission(studentId = P_STUDENT.userId())
            val invalidRequest = mapOf("feedback" to "")

            webClient
                .post()
                .uri("/api/v1/submissions/${submission.id}/feedback")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }
}
