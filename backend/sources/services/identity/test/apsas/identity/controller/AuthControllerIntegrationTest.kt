package apsas.identity.controller

import apsas.identity.IdentityServiceApplication
import apsas.identity.helper.TestDataFactory
import apsas.identity.helper.TestDataHelper
import apsas.identity.repository.EmailVerificationTokenRepository
import apsas.identity.repository.PasswordResetTokenRepository
import apsas.identity.repository.UserRepository
import apsas.shared.test.IntegrationSpec
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertTrue

@ContextConfiguration(classes = [IdentityServiceApplication::class])
class AuthControllerIntegrationTest : IntegrationSpec() {
    @Autowired
    private lateinit var testDataHelper: TestDataHelper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var emailVerificationTokenRepository: EmailVerificationTokenRepository

    @Autowired
    private lateinit var passwordResetTokenRepository: PasswordResetTokenRepository

    @AfterTest
    fun cleanup() {
        emailVerificationTokenRepository.deleteAll()
        passwordResetTokenRepository.deleteAll()
        testDataHelper.cleanupAll()
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    inner class RegisterTests {
        @Test
        fun `should register new user successfully`() {
            val request =
                TestDataFactory.createRegisterRequest(
                    email = "newuser@example.com",
                )

            webClient
                .post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isCreated
                .expectBody()
                .jsonPath("$.token")
                .isNotEmpty
                .jsonPath("$.type")
                .isEqualTo("Bearer")
                .jsonPath("$.user.id")
                .isNotEmpty
                .jsonPath("$.user.email")
                .isEqualTo("newuser@example.com")
                .jsonPath("$.user.firstName")
                .isEqualTo("Test")
                .jsonPath("$.user.lastName")
                .isEqualTo("User")
                .jsonPath("$.user.role")
                .isEqualTo("STUDENT")
                .jsonPath("$.user.isEmailVerified")
                .isEqualTo(false)
        }

        @Test
        fun `should reject registration with duplicate email`() {
            testDataHelper.createVerifiedUser(email = "existing@example.com")

            val request = TestDataFactory.createRegisterRequest(email = "existing@example.com")

            webClient
                .post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should reject registration with invalid email format`() {
            val request = TestDataFactory.createRegisterRequest(email = "invalid-email")

            webClient
                .post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }

        @Test
        fun `should reject registration with weak password`() {
            val request = TestDataFactory.createRegisterRequest(password = "weak")

            webClient
                .post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    inner class LoginTests {
        @Test
        fun `should login with valid credentials`() {
            testDataHelper.createVerifiedUser(
                email = "verified@example.com",
                password = "Password123!",
            )

            val request =
                TestDataFactory.createLoginRequest(
                    email = "verified@example.com",
                    password = "Password123!",
                )

            webClient
                .post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.token")
                .isNotEmpty
                .jsonPath("$.type")
                .isEqualTo("Bearer")
                .jsonPath("$.user")
                .exists()
        }

        @Test
        fun `should allow login with unverified email`() {
            testDataHelper.createUnverifiedUser(
                email = "unverified@example.com",
                password = "Password123!",
            )

            val request =
                TestDataFactory.createLoginRequest(
                    email = "unverified@example.com",
                    password = "Password123!",
                )

            webClient
                .post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.token")
                .isNotEmpty
                .jsonPath("$.type")
                .isEqualTo("Bearer")
                .jsonPath("$.user")
                .exists()
        }

        @Test
        fun `should reject login with invalid credentials`() {
            testDataHelper.createVerifiedUser(email = "user@example.com")

            val request =
                TestDataFactory.createLoginRequest(
                    email = "user@example.com",
                    password = "WrongPassword123!",
                )

            webClient
                .post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isUnauthorized
        }

        @Test
        fun `should reject login with non-existent email`() {
            val request = TestDataFactory.createLoginRequest(email = "nonexistent@example.com")

            webClient
                .post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isUnauthorized
        }
    }

    @Nested
    @DisplayName("POST /api/auth/verify-email")
    inner class VerifyEmailTests {
        @Test
        fun `should verify email with valid token`() {
            val user = testDataHelper.createUnverifiedUser(email = "verify@example.com")
            val tokenEntity = emailVerificationTokenRepository.findByUser(user).get()

            val request = TestDataFactory.createTokenRequest(tokenEntity.token)

            webClient
                .post()
                .uri("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.message")
                .value<String> { it.contains("verified", ignoreCase = true) }

            val updatedUser = userRepository.findById(user.id).get()
            assertTrue(updatedUser.isEmailVerified)
        }

        @Test
        fun `should reject verification with invalid token`() {
            val request = TestDataFactory.createTokenRequest("invalid-token")

            webClient
                .post()
                .uri("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }

    @Nested
    @DisplayName("POST /api/auth/resend-verification")
    inner class ResendVerificationTests {
        @Test
        fun `should resend verification email for unverified user`() {
            testDataHelper.createUnverifiedUser(email = "resend@example.com")

            val request = TestDataFactory.createEmailRequest("resend@example.com")

            webClient
                .post()
                .uri("/api/auth/resend-verification")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.message")
                .value<String> { it.contains("sent", ignoreCase = true) }
        }

        @Test
        fun `should reject resend for already verified user`() {
            testDataHelper.createVerifiedUser(email = "verified@example.com")

            val request = TestDataFactory.createEmailRequest("verified@example.com")

            webClient
                .post()
                .uri("/api/auth/resend-verification")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }

    @Nested
    @DisplayName("POST /api/auth/forgot-password")
    inner class RequestPasswordResetTests {
        @Test
        fun `should initiate password reset for existing user`() {
            testDataHelper.createVerifiedUser(email = "reset@example.com")

            val request = TestDataFactory.createEmailRequest("reset@example.com")

            webClient
                .post()
                .uri("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk
                .expectBody()
                .jsonPath("$.message")
                .value<String> { it.contains("sent", ignoreCase = true) }
        }

        @Test
        fun `should return not found for non-existent email`() {
            val request = TestDataFactory.createEmailRequest("nonexistent@example.com")

            webClient
                .post()
                .uri("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isNotFound
        }
    }

    @Nested
    @DisplayName("POST /api/auth/reset-password")
    inner class ResetPasswordTests {
        @Test
        fun `should reset password with valid token`() {
            val user =
                testDataHelper.createVerifiedUser(
                    email = "resetpw@example.com",
                    password = "OldPassword123!",
                )

            // Request password reset to generate token
            webClient
                .post()
                .uri("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(TestDataFactory.createEmailRequest("resetpw@example.com"))
                .exchange()
                .expectStatus()
                .isOk

            val tokenEntity = passwordResetTokenRepository.findByUser(user).get()
            val request =
                TestDataFactory.createResetPasswordRequest(
                    token = tokenEntity.token,
                    newPassword = "NewPassword123!",
                )

            webClient
                .post()
                .uri("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isOk

            // Verify can login with new password
            webClient
                .post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(
                    TestDataFactory.createLoginRequest(
                        "resetpw@example.com",
                        "NewPassword123!",
                    ),
                ).exchange()
                .expectStatus()
                .isOk
        }

        @Test
        fun `should reject password reset with invalid token`() {
            val request = TestDataFactory.createResetPasswordRequest(token = "invalid-token")

            webClient
                .post()
                .uri("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus()
                .isBadRequest
        }
    }
}
