package apsas.support.controller

import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_CONTENT_PROVIDER
import apsas.shared.test.P_INSTRUCTOR
import apsas.shared.test.P_OTHER_STUDENT
import apsas.shared.test.P_STUDENT
import apsas.shared.test.withId
import apsas.shared.test.withPrincipal
import apsas.support.SupportServiceApplication
import apsas.support.helper.TestDataFactory
import apsas.support.helper.TestDataHelper
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import java.util.UUID
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

@ContextConfiguration(classes = [SupportServiceApplication::class])
class SupportControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/support/sessions")
    inner class ListSessionsTests {
        @Test
        fun `should get paginated sessions as instructor`() {
            // Create test sessions
            testDataHelper.createSupportSessionWithMessage(
                studentId = P_STUDENT.userId,
                initialMessage = "First help request",
            )
            testDataHelper.createSupportSessionWithMessage(
                studentId = P_OTHER_STUDENT.userId,
                initialMessage = "Second help request",
            )

            webClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/api/v1/support/sessions")
                        .queryParam("page", 0)
                        .queryParam("size", 10)
                        .build()
                }.withPrincipal(P_INSTRUCTOR)
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
                .jsonPath("$.content[0].id")
                .exists()
                .jsonPath("$.content[0].studentId")
                .exists()
                .jsonPath("$.content[0].isClosed")
                .isEqualTo(false)
        }

        @Test
        fun `should get only student's own sessions as student`() {
            val studentId = P_STUDENT.userId
            val otherStudentId = P_OTHER_STUDENT.userId

            // Create sessions for different students
            testDataHelper.createSupportSessionWithMessage(
                studentId = studentId,
                initialMessage = "My request",
            )
            testDataHelper.createSupportSessionWithMessage(
                studentId = otherStudentId,
                initialMessage = "Other request",
            )

            webClient
                .get()
                .uri("/api/v1/support/sessions?page=0&size=10")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(1)
                .jsonPath("$.totalElements")
                .isEqualTo(1)
                .jsonPath("$.content[0].studentId")
                .isEqualTo(studentId.toString())
        }

        @Test
        fun `should return empty page when no sessions exist`() {
            webClient
                .get()
                .uri("/api/v1/support/sessions?page=0&size=10")
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
        fun `should support pagination parameters`() {
            // Create multiple sessions
            repeat(15) {
                testDataHelper.createSupportSessionWithMessage(
                    studentId = UUID.randomUUID(),
                    initialMessage = "Session $it",
                )
            }

            webClient
                .get()
                .uri("/api/v1/support/sessions?page=0&size=5")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(5)
                .jsonPath("$.totalElements")
                .isEqualTo(15)
                .jsonPath("$.totalPages")
                .isEqualTo(3)
                .jsonPath("$.pageNumber")
                .isEqualTo(0)
                .jsonPath("$.pageSize")
                .isEqualTo(5)
        }
    }

    @Nested
    @DisplayName("GET /api/v1/support/sessions/{id}")
    inner class GetSessionByIdTests {
        @Test
        fun `should get session by id as student owner`() {
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = P_STUDENT.userId,
                    initialMessage = "I need help",
                )

            webClient
                .get()
                .uri("/api/v1/support/sessions/${session.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(session.id.toString())
                .jsonPath("$.studentId")
                .isEqualTo(P_STUDENT.userId.toString())
                .jsonPath("$.isClosed")
                .isEqualTo(false)
                .jsonPath("$.messages")
                .isArray
                .jsonPath("$.messages.length()")
                .isEqualTo(1)
                .jsonPath("$.messages[0].content")
                .isEqualTo("I need help")
        }

        @Test
        fun `should get session by id as instructor`() {
            val studentId = P_OTHER_STUDENT.userId
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = studentId,
                    initialMessage = "Student help request",
                )

            webClient
                .get()
                .uri("/api/v1/support/sessions/${session.id}")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(session.id.toString())
                .jsonPath("$.studentId")
                .isEqualTo(studentId.toString())
        }

        @Test
        fun `should return 404 when session not found`() {
            val nonExistentId = UUID.randomUUID()

            webClient
                .get()
                .uri("/api/v1/support/sessions/$nonExistentId")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound
        }

        @Test
        fun `should return 403 when student tries to access other student's session`() {
            val otherStudentId = P_OTHER_STUDENT.userId
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = otherStudentId,
                    initialMessage = "Other student's request",
                )

            webClient
                .get()
                .uri("/api/v1/support/sessions/${session.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should mark messages as read when viewing session`() {
            val studentId = P_STUDENT.userId
            val instructorId = P_INSTRUCTOR.userId

            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = studentId,
                    initialMessage = "Help request",
                )

            // Add unread message from instructor
            testDataHelper.createInstructorMessage(
                sessionId = session.id,
                senderId = instructorId,
                content = "I can help",
            )

            // View as student - should mark instructor message as read
            webClient
                .get()
                .uri("/api/v1/support/sessions/${session.id}")
                .withPrincipal(P_STUDENT.withId(studentId))
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.messages.length()")
                .isEqualTo(2)
                // Both messages should now be read (first was from student, second from instructor)
                .jsonPath("$.messages[1].isRead")
                .isEqualTo(true)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/support/sessions")
    inner class CreateSessionTests {
        @Test
        fun `should create support session as student`() {
            val principal = P_STUDENT
            val request =
                TestDataFactory.createSupportSessionRequest(
                    initialMessage = "I'm stuck on the algorithm problem",
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.id")
                .exists()
                .jsonPath("$.studentId")
                .isEqualTo(principal.userId.toString())
                .jsonPath("$.isClosed")
                .isEqualTo(false)
                .jsonPath("$.createdAt")
                .exists()
                .jsonPath("$.messages")
                .isArray
                .jsonPath("$.messages.length()")
                .isEqualTo(1)
                .jsonPath("$.messages[0].content")
                .isEqualTo("I'm stuck on the algorithm problem")
                .jsonPath("$.messages[0].isInstructor")
                .isEqualTo(false)
        }

        @Test
        fun `should return 400 when initial message is empty`() {
            val principal = P_STUDENT

            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("initialMessage" to ""))
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should return 400 when initial message is missing`() {
            val principal = P_STUDENT

            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("randomField" to "value"))
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should return 403 when instructor tries to create session`() {
            val principal = P_INSTRUCTOR
            val request = TestDataFactory.createSupportSessionRequest()

            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should create session with long initial message`() {
            val principal = P_STUDENT
            val longMessage = "A".repeat(1000)
            val request =
                TestDataFactory.createSupportSessionRequest(
                    initialMessage = longMessage,
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.messages[0].content")
                .isEqualTo(longMessage)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/support/sessions/{id}/close")
    inner class CloseSessionTests {
        @Test
        fun `should close session as session owner`() {
            val principal = P_STUDENT
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = principal.userId,
                    initialMessage = "Help request",
                    isClosed = false,
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(session.id.toString())
                .jsonPath("$.isClosed")
                .isEqualTo(true)
                .jsonPath("$.closedAt")
                .exists()
        }

        @Test
        fun `should return 404 when session not found`() {
            val principal = P_STUDENT
            val nonExistentId = UUID.randomUUID()

            webClient
                .post()
                .uri("/api/v1/support/sessions/$nonExistentId/close")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isNotFound
        }

        @Test
        fun `should return 403 when non-owner tries to close session`() {
            val ownerStudentId = P_OTHER_STUDENT.userId
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = ownerStudentId,
                    initialMessage = "Other student's request",
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should return 400 when trying to close already closed session`() {
            val principal = P_STUDENT
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = principal.userId,
                    initialMessage = "Help request",
                    isClosed = true,
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should return 403 when instructor tries to close session`() {
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = P_OTHER_STUDENT.userId,
                    initialMessage = "Help request",
                )

            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should set closed timestamp when closing session`() {
            val principal = P_STUDENT
            val session =
                testDataHelper.createSupportSessionWithMessage(
                    studentId = principal.userId,
                    initialMessage = "Help request",
                )

            assertEquals(session.closedAt, null, "Session should not have closedAt initially")

            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.closedAt")
                .exists()
        }
    }

    @Nested
    @DisplayName("Access Control Tests")
    inner class AccessControlTests {
        @Test
        fun `should deny access to unauthenticated users`() {
            webClient
                .get()
                .uri("/api/v1/support/sessions")
                .exchange()
                .expectStatus()
                .isForbidden
        }

        @Test
        fun `should only allow instructors to view all sessions`() {
            // Create some sessions
            testDataHelper.createSupportSessionWithMessage(studentId = P_STUDENT.userId)
            testDataHelper.createSupportSessionWithMessage(studentId = P_OTHER_STUDENT.userId)

            // Instructor should see both
            webClient
                .get()
                .uri("/api/v1/support/sessions?page=0&size=10")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content.length()")
                .isEqualTo(2)
        }

        @Test
        fun `should not allow content provider to access support endpoints`() {
            webClient
                .get()
                .uri("/api/v1/support/sessions")
                .withPrincipal(P_CONTENT_PROVIDER)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("Response Format Tests")
    inner class ResponseFormatTests {
        @Test
        fun `should return properly formatted pagination response`() {
            repeat(3) {
                testDataHelper.createSupportSessionWithMessage(studentId = UUID.randomUUID())
            }

            webClient
                .get()
                .uri("/api/v1/support/sessions?page=0&size=2")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.pageNumber")
                .isEqualTo(0)
                .jsonPath("$.pageSize")
                .isEqualTo(2)
                .jsonPath("$.totalElements")
                .isEqualTo(3)
                .jsonPath("$.totalPages")
                .isEqualTo(2)
                .jsonPath("$.content")
                .isArray
                .jsonPath("$.content.length()")
                .isEqualTo(2)
        }

        @Test
        fun `should return proper HTTP status codes`() {
            val session =
                testDataHelper.createSupportSessionWithMessage(studentId = P_STUDENT.userId)

            // 201 for create
            webClient
                .post()
                .uri("/api/v1/support/sessions")
                .withPrincipal(P_OTHER_STUDENT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(TestDataFactory.createSupportSessionRequest())
                .exchange()
                .expectStatus()
                .isCreated

            // 200 for get
            webClient
                .get()
                .uri("/api/v1/support/sessions/${session.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isOk

            // 404 for not found
            webClient
                .get()
                .uri("/api/v1/support/sessions/${UUID.randomUUID()}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isNotFound

            // 403 for forbidden
            webClient
                .post()
                .uri("/api/v1/support/sessions/${session.id}/close")
                .withPrincipal(P_OTHER_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }
}
