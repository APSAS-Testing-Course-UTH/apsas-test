package apsas.identity.helper

import apsas.identity.model.entity.EmailVerificationToken
import apsas.identity.model.entity.User
import apsas.identity.model.entity.UserRole
import apsas.identity.repository.EmailVerificationTokenRepository
import apsas.identity.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import kotlin.random.Random

@Component
class TestDataHelper(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
    @Value("\${verification.email-token-expiration:86400}") private val emailTokenExpiration: Long,
) {
    fun createVerifiedUser(
        email: String = "verified@example.com",
        password: String = "Password123!",
        firstName: String = "Verified",
        lastName: String = "User",
        role: UserRole = UserRole.STUDENT,
    ): User {
        val user = User()
        user.email = email
        user.passwordHash = passwordEncoder.encode(password)
        user.firstName = firstName
        user.lastName = lastName
        user.role = role
        user.isActive = true
        user.isEmailVerified = true
        return userRepository.save(user)
    }

    fun createUnverifiedUser(
        email: String = "unverified@example.com",
        password: String = "Password123!",
        firstName: String = "Unverified",
        lastName: String = "User",
        role: UserRole = UserRole.STUDENT,
    ): User {
        val user = User()
        user.email = email
        user.passwordHash = passwordEncoder.encode(password)
        user.firstName = firstName
        user.lastName = lastName
        user.role = role
        user.isActive = true
        user.isEmailVerified = false
        val savedUser = userRepository.save(user)

        // Create email verification token
        val token = generateToken()
        val verificationToken = EmailVerificationToken()
        verificationToken.user = savedUser
        verificationToken.token = token
        verificationToken.expiresAt = LocalDateTime.now().plusSeconds(emailTokenExpiration)
        emailVerificationTokenRepository.save(verificationToken)

        return savedUser
    }

    fun cleanupAll() {
        userRepository.deleteAll()
    }

    private fun generateToken(): String {
        val charPool: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
        return (1..32)
            .map { charPool[Random.nextInt(0, charPool.size)] }
            .joinToString("")
    }
}
