package apsas.identity.helper

import apsas.identity.model.dto.ChangePasswordRequest
import apsas.identity.model.dto.CreateUserRequest
import apsas.identity.model.dto.EmailRequest
import apsas.identity.model.dto.LoginRequest
import apsas.identity.model.dto.RegisterRequest
import apsas.identity.model.dto.ResetPasswordRequest
import apsas.identity.model.dto.TokenRequest
import apsas.identity.model.dto.UpdateProfileRequest
import apsas.identity.model.entity.UserRole

object TestDataFactory {
    fun createRegisterRequest(
        email: String = "test@example.com",
        password: String = "Password123!",
        firstName: String = "Test",
        lastName: String = "User",
    ) = RegisterRequest(email, password, firstName, lastName)

    fun createLoginRequest(
        email: String = "test@example.com",
        password: String = "Password123!",
    ) = LoginRequest(email, password)

    fun createTokenRequest(token: String) = TokenRequest(token)

    fun createEmailRequest(email: String) = EmailRequest(email)

    fun createResetPasswordRequest(
        token: String,
        newPassword: String = "NewPassword123!",
    ) = ResetPasswordRequest(token, newPassword)

    fun createUpdateProfileRequest(
        firstName: String = "Updated",
        lastName: String = "User",
    ) = UpdateProfileRequest(firstName, lastName)

    fun createChangePasswordRequest(
        currentPassword: String = "Password123!",
        newPassword: String = "NewPassword123!",
    ) = ChangePasswordRequest(currentPassword, newPassword)

    fun createCreateUserRequest(
        email: String = "newuser@example.com",
        password: String = "Password123!",
        firstName: String = "New",
        lastName: String = "User",
        role: UserRole = UserRole.STUDENT,
    ) = CreateUserRequest(
        email,
        password,
        firstName,
        lastName,
        role,
        true,
        false,
    )
}
