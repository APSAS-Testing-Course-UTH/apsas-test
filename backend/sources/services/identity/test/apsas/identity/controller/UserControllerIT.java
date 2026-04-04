package apsas.identity.controller;

import static org.instancio.Select.field;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.identity.model.dto.ChangePasswordRequest;
import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.UpdateProfileRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.identity.service.AuthService;
import apsas.identity.service.UserService;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.HeaderAuthenticationFilter;
import apsas.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Tag("integration")
@Tag("identity")
@Epic("Identity Service")
@Feature("REST API - User Management")
@Owner("backend-team")
@Issue("28")
class UserControllerIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private UserService userService;

  @MockitoBean
  private AuthService authService;

  @MockitoBean
  private HeaderAuthenticationFilter headerAuthenticationFilter;

  @MockitoBean
  private UserRepository userRepository;

  @MockitoBean
  private EventPublisher eventPublisher;

  @MockitoBean
  private CacheManager cacheManager;

  @ParameterizedTest(name = "{index} => page={0}, size={1}, expectedPage={2}, expectedSize={3}")
  @MethodSource("paginationBoundaryCases")
  @TmsLink("IDT-RESTIT-USER-001")
  @DisplayName("Get users applies pagination boundaries")
  @Description("BVA: query page/size are clamped to valid range before delegating to service.")
  @Story("List users - BVA pagination")
  void getAllUsers_shouldClampPaginationValues_whenBoundaryInputsAreProvided(
      int page,
      int size,
      int expectedPage,
      int expectedSize
  ) throws Exception {
    when(userService.getAllUsers(any(Pageable.class))).thenReturn(emptyPageResponse(expectedPage,
        expectedSize));

    mockMvc.perform(
            get("/api/v1/users")
                .queryParam("page", String.valueOf(page))
                .queryParam("size", String.valueOf(size))
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(userService).getAllUsers(pageableCaptor.capture());
    Pageable pageable = pageableCaptor.getValue();
    org.junit.jupiter.api.Assertions.assertEquals(expectedPage, pageable.getPageNumber());
    org.junit.jupiter.api.Assertions.assertEquals(expectedSize, pageable.getPageSize());
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-002")
  @DisplayName("Create user returns 201 at valid password boundary")
  @Description("BVA: create-user accepts password length exactly 8.")
  @Story("Create user - BVA valid")
  void createUser_shouldReturnCreated_whenPasswordAtMinBoundary() throws Exception {
    when(userService.createUser(any(CreateUserRequest.class))).thenReturn(userResponse());

    Map<String, Object> payload = Map.of(
        "email", "new.admin-created@apsas.dev",
        "password", repeat("P", 8),
        "firstName", "First",
        "lastName", "Last",
        "role", "STUDENT",
        "isActive", true,
        "isEmailVerified", false
    );

    mockMvc.perform(
            post("/api/v1/users")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isCreated());

    verify(userService).createUser(any(CreateUserRequest.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-003")
  @DisplayName("Create user returns 400 when password is below min")
  @Description("BVA: create-user rejects password length 7 (min-1).")
  @Story("Create user - BVA invalid")
  void createUser_shouldReturnBadRequest_whenPasswordBelowMin() throws Exception {
    Map<String, Object> payload = Map.of(
        "email", "invalid.password@apsas.dev",
        "password", repeat("P", 7),
        "firstName", "First",
        "lastName", "Last",
        "role", "STUDENT"
    );

    mockMvc.perform(
            post("/api/v1/users")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isBadRequest());

    verify(userService, never()).createUser(any(CreateUserRequest.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-004")
  @DisplayName("Update profile returns 200 at max name boundary")
  @Description("BVA: update profile accepts firstName and lastName with length exactly 100.")
  @Story("Update profile - BVA valid")
  void updateCurrentUserProfile_shouldReturnOk_whenNamesAtMaxBoundary() throws Exception {
    when(userService.updateProfile(any(UUID.class), any(UpdateProfileRequest.class))).thenReturn(
        userResponse());

    Map<String, Object> payload = Map.of(
        "firstName", repeat("F", 100),
        "lastName", repeat("L", 100)
    );

    mockMvc.perform(
            patch("/api/v1/users/me")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("STUDENT")))
        )
        .andExpect(status().isOk());

    verify(userService).updateProfile(any(UUID.class), any(UpdateProfileRequest.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-005")
  @DisplayName("Update profile returns 400 when firstName exceeds max")
  @Description("BVA: update profile rejects firstName length 101 (max+1).")
  @Story("Update profile - BVA invalid")
  void updateCurrentUserProfile_shouldReturnBadRequest_whenFirstNameExceedsMax() throws Exception {
    Map<String, Object> payload = Map.of(
        "firstName", repeat("F", 101),
        "lastName", "ValidLast"
    );

    mockMvc.perform(
            patch("/api/v1/users/me")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("STUDENT")))
        )
        .andExpect(status().isBadRequest());

    verify(userService, never()).updateProfile(any(UUID.class), any(UpdateProfileRequest.class));
  }

  @ParameterizedTest(name = "{index} => newPasswordLen={0}, expected={1}")
  @MethodSource("changePasswordBoundaryCases")
  @TmsLink("IDT-RESTIT-USER-006")
  @DisplayName("Change password validates new password min boundary")
  @Description("BVA: newPassword min boundary 8 for current-user change password endpoint.")
  @Story("Change password - BVA")
  void changePassword_shouldValidateBoundary(int newPasswordLength, HttpStatus expected) throws Exception {
    Map<String, Object> payload = Map.of(
        "currentPassword", "OldPassword@123",
        "newPassword", repeat("N", newPasswordLength)
    );

    mockMvc.perform(
            post("/api/v1/users/me/change-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("STUDENT")))
        )
        .andExpect(status().is(expected.value()));

    if (expected == HttpStatus.NO_CONTENT) {
      verify(userService).changePassword(any(UUID.class), any(ChangePasswordRequest.class));
    } else {
      verify(userService, never()).changePassword(any(UUID.class), any(ChangePasswordRequest.class));
    }
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-007")
  @DisplayName("Get user by id returns 400 for malformed UUID")
  @Description("Error guessing: invalid path variable format must fail request binding.")
  @Story("Get user by id - invalid input")
  void getUserById_shouldReturnBadRequest_whenUuidIsMalformed() throws Exception {
    mockMvc.perform(
            get("/api/v1/users/not-a-uuid")
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isBadRequest());

    verify(userService, never()).getUserById(any(UUID.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-008")
  @DisplayName("Get users by role returns 400 for unsupported role")
  @Description("Equivalence partitioning: role path variable outside enum set must fail binding.")
  @Story("Get users by role - invalid input")
  void getUsersByRole_shouldReturnBadRequest_whenRoleIsInvalid() throws Exception {
    mockMvc.perform(
            get("/api/v1/users/role/INVALID_ROLE")
                .queryParam("page", "0")
                .queryParam("size", "10")
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isBadRequest());
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-009")
  @DisplayName("Get current user returns 200 for authenticated principal")
  @Description("Non-BVA flow: /me resolves userId from authentication principal.")
  @Story("Current user profile - successful path")
  void getCurrentUser_shouldReturnOk_whenAuthenticated() throws Exception {
    UUID userId = UUID.randomUUID();
    when(userService.getUserById(userId)).thenReturn(userResponse());

    mockMvc.perform(
            get("/api/v1/users/me")
                .with(authenticated(authenticationForRoleAndUserId("STUDENT", userId)))
        )
        .andExpect(status().isOk());

    verify(userService).getUserById(userId);
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-010")
  @DisplayName("Get user by id returns 200 for valid UUID and role")
  @Description("Non-BVA flow: valid UUID path variable delegates to service.")
  @Story("Get user by id - successful path")
  void getUserById_shouldReturnOk_whenUuidIsValid() throws Exception {
    UUID userId = UUID.randomUUID();
    when(userService.getUserById(userId)).thenReturn(userResponse());

    mockMvc.perform(
            get("/api/v1/users/{userId}", userId)
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isOk());

    verify(userService).getUserById(userId);
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-011")
  @DisplayName("Get users by role returns 200 for valid enum")
  @Description("Non-BVA flow: valid role enum is accepted and delegated to service.")
  @Story("Get users by role - successful path")
  void getUsersByRole_shouldReturnOk_whenRoleIsValid() throws Exception {
    when(userService.getUsersByRole(any(UserRole.class), any(Pageable.class))).thenReturn(
        emptyPageResponse(0, 10));

    mockMvc.perform(
            get("/api/v1/users/role/STUDENT")
                .queryParam("page", "0")
                .queryParam("size", "10")
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isOk());

    verify(userService).getUsersByRole(any(UserRole.class), any(Pageable.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-012")
  @DisplayName("Deactivate user returns 204 for admin")
  @Description("Non-BVA flow: admin can deactivate target user.")
  @Story("User status management - deactivate")
  void deactivateUser_shouldReturnNoContent_whenAdminRole() throws Exception {
    UUID userId = UUID.randomUUID();

    mockMvc.perform(
            post("/api/v1/users/{userId}/deactivate", userId)
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isNoContent());

    verify(userService).deactivateUser(userId);
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-013")
  @DisplayName("Activate user returns 204 for admin")
  @Description("Non-BVA flow: admin can activate target user.")
  @Story("User status management - activate")
  void activateUser_shouldReturnNoContent_whenAdminRole() throws Exception {
    UUID userId = UUID.randomUUID();

    mockMvc.perform(
            post("/api/v1/users/{userId}/activate", userId)
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isNoContent());

    verify(userService).activateUser(userId);
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-014")
  @DisplayName("Delete user returns 204 for admin")
  @Description("Non-BVA flow: admin can delete target user.")
  @Story("User management - delete")
  void deleteUser_shouldReturnNoContent_whenAdminRole() throws Exception {
    UUID userId = UUID.randomUUID();

    mockMvc.perform(
            delete("/api/v1/users/{userId}", userId)
                .with(authenticated(authenticationForRole("ADMIN")))
        )
        .andExpect(status().isNoContent());

    verify(userService).deleteUser(userId);
  }

  @Test
  @TmsLink("IDT-RESTIT-USER-015")
  @DisplayName("Create user returns 403 for non-admin role")
  @Description("Error guessing: role boundary for protected endpoint should deny STUDENT role.")
  @Story("Create user - authorization")
  void createUser_shouldReturnForbidden_whenRoleIsNotAdmin() throws Exception {
    Map<String, Object> payload = Map.of(
        "email", "forbidden@apsas.dev",
        "password", repeat("P", 8),
        "firstName", "First",
        "lastName", "Last",
        "role", "STUDENT"
    );

    mockMvc.perform(
            post("/api/v1/users")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
                .with(authenticated(authenticationForRole("STUDENT")))
        )
        .andExpect(status().isForbidden());

    verify(userService, never()).createUser(any(CreateUserRequest.class));
  }

  private static Stream<Arguments> paginationBoundaryCases() {
    return Stream.of(
        Arguments.of(-1, 0, 0, 1),
        Arguments.of(0, 1, 0, 1),
        Arguments.of(1, 100, 1, 100),
        Arguments.of(1, 101, 1, 100)
    );
  }

  private static Stream<Arguments> changePasswordBoundaryCases() {
    return Stream.of(
        Arguments.of(7, HttpStatus.BAD_REQUEST),
        Arguments.of(8, HttpStatus.NO_CONTENT)
    );
  }

  private PageResponse<UserResponse> emptyPageResponse(int page, int size) {
    return new PageResponse<>(List.of(), page, size, 0, 0, true, true, false, false);
  }

  private UserResponse userResponse() {
    return Instancio.of(UserResponse.class)
        .set(field(UserResponse::getId), UUID.randomUUID())
        .set(field(UserResponse::getEmail), "rest.user@apsas.dev")
        .set(field(UserResponse::getFirstName), "Rest")
        .set(field(UserResponse::getLastName), "User")
        .set(field(UserResponse::getRole), UserRole.STUDENT)
        .set(field(UserResponse::getIsActive), true)
        .set(field(UserResponse::getIsEmailVerified), true)
        .set(field(UserResponse::getCreatedAt), LocalDateTime.now())
        .set(field(UserResponse::getUpdatedAt), LocalDateTime.now())
        .create();
  }

  private Authentication authenticationForRole(String role) {
    return authenticationForRoleAndUserId(role, UUID.randomUUID());
  }

  private Authentication authenticationForRoleAndUserId(String role, UUID userId) {
    UserPrincipal principal = UserPrincipal.builder()
        .userId(userId)
        .email("principal@apsas.dev")
        .firstName("Principal")
        .lastName("Tester")
        .role(role)
        .isActive(true)
        .build();
    return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
  }

  private static String repeat(String token, int count) {
    return token.repeat(Math.max(count, 0));
  }

  private RequestPostProcessor authenticated(Authentication authentication) {
    return request -> {
      SecurityContextHolder.getContext().setAuthentication(authentication);
      request.setUserPrincipal(authentication);
      return request;
    };
  }
}




