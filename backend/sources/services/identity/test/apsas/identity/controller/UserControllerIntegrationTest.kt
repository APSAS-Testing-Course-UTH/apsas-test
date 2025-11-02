package apsas.identity.controller

import apsas.identity.IdentityServiceApplication
import apsas.identity.helper.TestDataFactory
import apsas.identity.helper.TestDataHelper
import apsas.identity.model.entity.UserRole
import apsas.identity.repository.UserRepository
import apsas.shared.test.IntegrationSpec
import apsas.shared.test.P_ADMIN
import apsas.shared.test.P_INSTRUCTOR
import apsas.shared.test.P_OTHER_INSTRUCTOR
import apsas.shared.test.P_OTHER_STUDENT
import apsas.shared.test.P_STUDENT
import apsas.shared.test.withId
import apsas.shared.test.withPrincipal
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@ContextConfiguration(classes = [IdentityServiceApplication::class])
class UserControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var userRepository: UserRepository

    @AfterTest
    fun cleanup() {
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("GET /api/v1/users/me")
    inner class GetCurrentUserTests {
        @Test
        fun `should get current user profile when authenticated`() {
            // Create a user and then create a principal with its ID
            val user =
                testDataHelper.createVerifiedUser(
                    email = P_STUDENT.email,
                    firstName = P_STUDENT.firstName,
                    lastName = P_STUDENT.lastName,
                )
            val principal = P_STUDENT.withId(user.id)

            webClient
                .get()
                .uri("/api/v1/users/me")
                .withPrincipal(principal)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.email")
                .isEqualTo(P_STUDENT.email)
        }

        @Test
        fun `should reject request without authentication`() {
            webClient
                .get()
                .uri("/api/v1/users/me")
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/users/me")
    inner class UpdateCurrentUserProfileTests {
        @Test
        fun `should update current user profile`() {
            // Create a user and then create a principal with its ID
            val user =
                testDataHelper.createVerifiedUser(
                    email = P_OTHER_STUDENT.email,
                    firstName = "Old",
                    lastName = "Name",
                )
            val principal = P_OTHER_STUDENT.withId(user.id)

            val request =
                TestDataFactory.createUpdateProfileRequest(
                    firstName = "UpdatedFirstName",
                    lastName = "UpdatedLastName",
                )

            webClient
                .put()
                .uri("/api/v1/users/me")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.firstName")
                .isEqualTo("UpdatedFirstName")
                .jsonPath("$.lastName")
                .isEqualTo("UpdatedLastName")
        }

        @Test
        fun `should reject update without authentication`() {
            val request = TestDataFactory.createUpdateProfileRequest()

            webClient
                .put()
                .uri("/api/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("POST /api/v1/users/me/change-password")
    inner class ChangePasswordTests {
        @Test
        fun `should change password with correct current password`() {
            // Create a user and then create a principal with its ID
            val user =
                testDataHelper.createVerifiedUser(
                    email = P_OTHER_INSTRUCTOR.email,
                    password = "OldPassword123!",
                )
            val principal = P_OTHER_INSTRUCTOR.withId(user.id)

            val request =
                TestDataFactory.createChangePasswordRequest(
                    currentPassword = "OldPassword123!",
                    newPassword = "NewPassword123!",
                )

            webClient
                .post()
                .uri("/api/v1/users/me/change-password")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.message")
                .exists()
        }

        @Test
        fun `should reject password change with incorrect current password`() {
            // Create a user and then create a principal with its ID
            val user =
                testDataHelper.createVerifiedUser(
                    email = P_OTHER_INSTRUCTOR.email,
                    password = "CorrectPassword123!",
                )
            val principal = P_OTHER_INSTRUCTOR.withId(user.id)

            val request =
                TestDataFactory.createChangePasswordRequest(
                    currentPassword = "WrongPassword123!",
                    newPassword = "NewPassword123!",
                )

            webClient
                .post()
                .uri("/api/v1/users/me/change-password")
                .withPrincipal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isUnauthorized
        }
    }

    @Nested
    @DisplayName("GET /api/v1/users/{id}")
    inner class GetUserByIdTests {
        @Test
        fun `should get user by id as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)
            val targetUser =
                testDataHelper.createVerifiedUser(
                    email = "target@example.com",
                    firstName = "Target",
                    lastName = "User",
                )

            webClient
                .get()
                .uri("/api/v1/users/${targetUser.id}")
                .withPrincipal(P_ADMIN)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.id")
                .isEqualTo(targetUser.id.toString())
                .jsonPath("$.email")
                .isEqualTo("target@example.com")
                .jsonPath("$.firstName")
                .isEqualTo("Target")
        }

        @Test
        fun `should reject get user by id as non-admin`() {
            testDataHelper.createVerifiedUser(email = P_STUDENT.email)
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")

            webClient
                .get()
                .uri("/api/v1/users/${targetUser.id}")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("GET /api/v1/users")
    inner class GetAllUsersTests {
        @Test
        fun `should get all users as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)
            testDataHelper.createVerifiedUser(email = "user1@example.com")
            testDataHelper.createVerifiedUser(email = "user2@example.com")

            webClient
                .get()
                .uri("/api/v1/users?page=0&size=10")
                .withPrincipal(P_ADMIN)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.content")
                .isArray
                .jsonPath("$.content.length()")
                .isEqualTo(3)
                .jsonPath("$.totalElements")
                .isEqualTo(3)
        }

        @Test
        fun `should reject get all users as non-admin`() {
            testDataHelper.createVerifiedUser(email = P_STUDENT.email)

            webClient
                .get()
                .uri("/api/v1/users")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("GET /api/v1/users/role/{role}")
    inner class GetUsersByRoleTests {
        @Test
        fun `should get users by role as instructor`() {
            testDataHelper.createVerifiedUser(
                email = P_INSTRUCTOR.email,
                role = UserRole.INSTRUCTOR,
            )
            testDataHelper.createVerifiedUser(
                email = "student1@example.com",
                role = UserRole.STUDENT,
            )
            testDataHelper.createVerifiedUser(
                email = "student2@example.com",
                role = UserRole.STUDENT,
            )
            testDataHelper.createVerifiedUser(
                email = "instructor2@example.com",
                role = UserRole.INSTRUCTOR,
            )

            webClient
                .get()
                .uri("/api/v1/users/role/STUDENT?page=0&size=10")
                .withPrincipal(P_INSTRUCTOR)
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
        fun `should reject get users by role as student`() {
            testDataHelper.createVerifiedUser(email = P_STUDENT.email)

            webClient
                .get()
                .uri("/api/v1/users/role/STUDENT")
                .withPrincipal(P_STUDENT)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("POST /api/v1/users")
    inner class CreateUserTests {
        @Test
        fun `should create user as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)

            val request =
                TestDataFactory.createCreateUserRequest(
                    email = "newuser@example.com",
                    role = UserRole.INSTRUCTOR,
                )

            webClient
                .post()
                .uri("/api/v1/users")
                .withPrincipal(P_ADMIN)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.email")
                .isEqualTo("newuser@example.com")
                .jsonPath("$.role")
                .isEqualTo("INSTRUCTOR")
        }

        @Test
        fun `should reject create user as non-admin`() {
            testDataHelper.createVerifiedUser(
                email = P_INSTRUCTOR.email,
                role = UserRole.INSTRUCTOR,
            )

            val request = TestDataFactory.createCreateUserRequest()

            webClient
                .post()
                .uri("/api/v1/users")
                .withPrincipal(P_INSTRUCTOR)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/users/{id}/deactivate")
    inner class DeactivateUserTests {
        @Test
        fun `should deactivate user as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")

            webClient
                .put()
                .uri("/api/v1/users/${targetUser.id}/deactivate")
                .withPrincipal(P_ADMIN)
                .exchange()
                .expectStatus()
                .isOk

            val updatedUser = userRepository.findById(targetUser.id).get()
            assertFalse(updatedUser.isActive)
        }

        @Test
        fun `should reject deactivate user as non-admin`() {
            testDataHelper.createVerifiedUser(
                email = P_INSTRUCTOR.email,
                role = UserRole.INSTRUCTOR,
            )
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")

            webClient
                .put()
                .uri("/api/v1/users/${targetUser.id}/deactivate")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/users/{id}/activate")
    inner class ActivateUserTests {
        @Test
        fun `should activate deactivated user as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")
            targetUser.isActive = false
            userRepository.save(targetUser)

            webClient
                .put()
                .uri("/api/v1/users/${targetUser.id}/activate")
                .withPrincipal(P_ADMIN)
                .exchange()
                .expectStatus()
                .isOk

            val updatedUser = userRepository.findById(targetUser.id).get()
            assertTrue(updatedUser.isActive)
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/users/{id}")
    inner class DeleteUserTests {
        @Test
        fun `should delete user as admin`() {
            testDataHelper.createVerifiedUser(email = P_ADMIN.email, role = UserRole.ADMIN)
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")
            val targetId = targetUser.id

            webClient
                .delete()
                .uri("/api/v1/users/$targetId")
                .withPrincipal(P_ADMIN)
                .exchange()
                .expectStatus()
                .isOk

            assertFalse(userRepository.existsById(targetId))
        }

        @Test
        fun `should reject delete user as non-admin`() {
            testDataHelper.createVerifiedUser(
                email = P_INSTRUCTOR.email,
                role = UserRole.INSTRUCTOR,
            )
            val targetUser = testDataHelper.createVerifiedUser(email = "target@example.com")

            webClient
                .delete()
                .uri("/api/v1/users/${targetUser.id}")
                .withPrincipal(P_INSTRUCTOR)
                .exchange()
                .expectStatus()
                .isForbidden
        }
    }
}
