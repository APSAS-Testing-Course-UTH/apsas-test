package apsas.identity.service;

import static org.instancio.Select.field;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.identity.mapper.UserMapper;
import apsas.identity.model.dto.ChangePasswordRequest;
import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.UpdateProfileRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.models.pagination.PageResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Tag("identity")
@Epic("Identity Service")
@Feature("User Service")
@Issue("17")
class UserServiceTest {

  @Mock
  private UserRepository userRepository;
  @Mock
  private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
  @Mock
  private UserMapper userMapper;

  @InjectMocks
  private UserService userService;

  @Test
  @TmsLink("IDT-USER-001")
  @DisplayName("Get user by id succeeds")
  @Story("User information management")
  void getUserById_shouldReturnUserResponse_whenUserExists() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("existing@apsas.dev");
    UserResponse response = Instancio.create(UserResponse.class);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(userMapper.toUserResponse(user)).thenReturn(response);

    UserResponse result = userService.getUserById(userId);

    assertEquals(response, result);
  }

  @Test
  @TmsLink("IDT-USER-002")
  @DisplayName("Get user by id fails when user does not exist")
  @Story("User information management")
  void getUserById_shouldThrowNotFound_whenUserMissing() {
    UUID userId = UUID.randomUUID();
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class, () -> userService.getUserById(userId));
  }

  @Test
  @TmsLink("IDT-USER-003")
  @DisplayName("Get paginated users list")
  @Story("User information management")
  void getAllUsers_shouldMapPageContent() {
    User user = buildUser("user1@apsas.dev");
    UserResponse response = Instancio.create(UserResponse.class);
    Page<User> page = new PageImpl<>(List.of(user), PageRequest.of(0, 10), 1);

    when(userRepository.findAll(PageRequest.of(0, 10))).thenReturn(page);
    when(userMapper.toUserResponse(user)).thenReturn(response);

    PageResponse<UserResponse> result = userService.getAllUsers(PageRequest.of(0, 10));

    assertEquals(1, result.content().size());
    assertEquals(response, result.content().getFirst());
    assertEquals(0, result.pageNumber());
  }

  @Test
  @TmsLink("IDT-USER-004")
  @DisplayName("Get paginated users by role")
  @Story("User information management")
  void getUsersByRole_shouldReturnMappedPage_whenRoleProvided() {
    User user = buildUser("role@apsas.dev");
    UserResponse response = Instancio.create(UserResponse.class);
    Page<User> page = new PageImpl<>(List.of(user), PageRequest.of(0, 5), 1);

    when(userRepository.findByRole(UserRole.STUDENT, PageRequest.of(0, 5))).thenReturn(page);
    when(userMapper.toUserResponse(user)).thenReturn(response);

    PageResponse<UserResponse> result = userService.getUsersByRole(
        UserRole.STUDENT,
        PageRequest.of(0, 5)
    );

    assertEquals(1, result.content().size());
    assertEquals(response, result.content().getFirst());
  }

  @Test
  @TmsLink("IDT-USER-005")
  @DisplayName("Create user succeeds when email is not registered")
  @Description("createUser luu user moi va tra ve user response")
  @Story("User information management")
  void createUser_shouldSaveAndReturnResponse_whenEmailIsUnique() {
    CreateUserRequest request =
        Instancio.of(CreateUserRequest.class)
            .set(field(CreateUserRequest::getEmail), "new@apsas.dev")
            .set(field(CreateUserRequest::getPassword), "Password@123")
            .set(field(CreateUserRequest::getRole), UserRole.STUDENT)
            .create();
    User user = buildUser("new@apsas.dev");
    UserResponse response = Instancio.create(UserResponse.class);

    when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
    when(userMapper.toUser(request)).thenReturn(user);
    when(userRepository.save(user)).thenReturn(user);
    when(userMapper.toUserResponse(user)).thenReturn(response);

    UserResponse result = userService.createUser(request);

    assertEquals(response, result);
  }

  @Test
  @TmsLink("IDT-USER-006")
  @DisplayName("Create user fails when email already exists")
  @Story("User information management")
  void createUser_shouldThrowBadRequest_whenEmailExists() {
    CreateUserRequest request =
        Instancio.of(CreateUserRequest.class)
            .set(field(CreateUserRequest::getEmail), "duplicate@apsas.dev")
            .create();

    when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

    assertThrows(BadRequestException.class, () -> userService.createUser(request));
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  @TmsLink("IDT-USER-007")
  @DisplayName("Update profile changes only valid fields")
  @Story("User information management")
  void updateProfile_shouldUpdateOnlyValidFields_whenRequestContainsBlankValue() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("profile@apsas.dev");
    user.setFirstName("OldFirst");
    user.setLastName("OldLast");

    UpdateProfileRequest request = new UpdateProfileRequest("NewFirst", "");
    UserResponse response = Instancio.create(UserResponse.class);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(userRepository.save(user)).thenReturn(user);
    when(userMapper.toUserResponse(user)).thenReturn(response);

    UserResponse result = userService.updateProfile(userId, request);

    assertEquals(response, result);
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());
    assertEquals("NewFirst", userCaptor.getValue().getFirstName());
    assertEquals("OldLast", userCaptor.getValue().getLastName());
  }

  @Test
  @TmsLink("IDT-USER-008")
  @DisplayName("Update profile fails when user does not exist")
  @Story("User information management")
  void updateProfile_shouldThrowNotFound_whenUserMissing() {
    UUID userId = UUID.randomUUID();
    UpdateProfileRequest request = new UpdateProfileRequest("A", "B");
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class, () -> userService.updateProfile(userId, request));
  }

  @Test
  @TmsLink("IDT-USER-017")
  @DisplayName("Update profile changes only lastName when firstName is empty")
  @Story("User information management")
  void updateProfile_shouldUpdateLastNameOnly_whenFirstNameIsBlank() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("profile2@apsas.dev");
    user.setFirstName("KeepFirst");
    user.setLastName("KeepLast");

    UpdateProfileRequest request = new UpdateProfileRequest("", "NewLast");
    UserResponse response = Instancio.create(UserResponse.class);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(userRepository.save(user)).thenReturn(user);
    when(userMapper.toUserResponse(user)).thenReturn(response);

    UserResponse result = userService.updateProfile(userId, request);

    assertEquals(response, result);
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());
    assertEquals("KeepFirst", userCaptor.getValue().getFirstName());
    assertEquals("NewLast", userCaptor.getValue().getLastName());
  }

  @Test
  @TmsLink("IDT-USER-009")
  @DisplayName("Change password succeeds when current password is correct")
  @Story("Account security")
  void changePassword_shouldEncodeAndSave_whenCurrentPasswordMatches() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("password@apsas.dev");
    user.setPasswordHash("old-hash");
    ChangePasswordRequest request = new ChangePasswordRequest("OldPassword@123", "NewPassword@123");

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())).thenReturn(
        true);
    when(passwordEncoder.encode(request.getNewPassword())).thenReturn("new-hash");

    userService.changePassword(userId, request);

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());
    assertEquals("new-hash", userCaptor.getValue().getPasswordHash());
  }

  @Test
  @TmsLink("IDT-USER-010")
  @DisplayName("Change password fails when current password is incorrect")
  @Story("Account security")
  void changePassword_shouldThrowUnauthorized_whenCurrentPasswordIsIncorrect() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("password@apsas.dev");
    ChangePasswordRequest request = new ChangePasswordRequest("wrong-current", "NewPassword@123");

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())).thenReturn(
        false);

    assertThrows(
        UnauthorizedException.class,
        () -> userService.changePassword(userId, request)
    );
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  @TmsLink("IDT-USER-011")
  @DisplayName("Deactivate user sets isActive to false")
  @Story("User status management")
  void deactivateUser_shouldSetInactiveAndSave() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("inactive@apsas.dev");
    user.setIsActive(true);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    userService.deactivateUser(userId);

    assertEquals(false, user.getIsActive());
    verify(userRepository).save(user);
  }

  @Test
  @TmsLink("IDT-USER-012")
  @DisplayName("Activate user sets isActive to true")
  @Story("User status management")
  void activateUser_shouldSetActiveAndSave() {
    UUID userId = UUID.randomUUID();
    User user = buildUser("active@apsas.dev");
    user.setIsActive(false);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    userService.activateUser(userId);

    assertEquals(true, user.getIsActive());
    verify(userRepository).save(user);
  }

  @Test
  @TmsLink("IDT-USER-013")
  @DisplayName("Delete user fails when id does not exist")
  @Story("User information management")
  void deleteUser_shouldThrowNotFound_whenIdDoesNotExist() {
    UUID userId = UUID.randomUUID();
    when(userRepository.existsById(userId)).thenReturn(false);

    assertThrows(NotFoundException.class, () -> userService.deleteUser(userId));
  }

  @Test
  @TmsLink("IDT-USER-014")
  @DisplayName("Delete user succeeds when id exists")
  @Story("User information management")
  void deleteUser_shouldDeleteById_whenUserExists() {
    UUID userId = UUID.randomUUID();
    when(userRepository.existsById(userId)).thenReturn(true);

    userService.deleteUser(userId);

    verify(userRepository).deleteById(userId);
  }

  @Test
  @TmsLink("IDT-USER-015")
  @DisplayName("Find users by ids maps to user responses")
  @Story("Internal for feign client")
  void findUsersByIds_shouldMapAllUsers() {
    User user1 = buildUser("user1@apsas.dev");
    User user2 = buildUser("user2@apsas.dev");
    UserResponse response1 = Instancio.create(UserResponse.class);
    UserResponse response2 = Instancio.create(UserResponse.class);

    when(userRepository.findAllById(List.of(
        user1.getId(),
        user2.getId()
    ))).thenReturn(List.of(user1, user2));
    when(userMapper.toUserResponse(user1)).thenReturn(response1);
    when(userMapper.toUserResponse(user2)).thenReturn(response2);

    List<UserResponse> result = userService.findUsersByIds(List.of(user1.getId(), user2.getId()));

    assertEquals(List.of(response1, response2), result);
  }

  @Test
  @TmsLink("IDT-USER-016")
  @DisplayName("Get users by valid role string")
  @Story("Internal for feign client")
  void getUsersByRole_shouldConvertStringRoleAndMapResponses() {
    User user = buildUser("student@apsas.dev");
    user.setRole(UserRole.STUDENT);
    UserResponse response = Instancio.create(UserResponse.class);

    when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(List.of(user));
    when(userMapper.toUserResponse(user)).thenReturn(response);

    List<UserResponse> result = userService.getUsersByRole("STUDENT");

    assertEquals(1, result.size());
    assertEquals(response, result.getFirst());
  }

  private User buildUser(String email) {
    return Instancio.of(User.class)
        .set(field(User::getId), UUID.randomUUID())
        .set(field(User::getEmail), email)
        .set(field(User::getPasswordHash), "hashed-password")
        .set(field(User::getFirstName), "Test")
        .set(field(User::getLastName), "User")
        .set(field(User::getRole), UserRole.STUDENT)
        .set(field(User::getIsActive), true)
        .set(field(User::getIsEmailVerified), false)
        .create();
  }
}
