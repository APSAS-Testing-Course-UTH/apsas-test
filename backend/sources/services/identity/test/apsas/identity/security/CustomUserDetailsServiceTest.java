package apsas.identity.security;

import static org.instancio.Select.field;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.shared.security.UserPrincipal;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.Optional;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Tag("identity")
@Epic("Identity Service")
@Feature("Security")
@Issue("17")
class CustomUserDetailsServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private CustomUserDetailsService customUserDetailsService;

  @Test
  @TmsLink("IDT-CUDS-001")
  @DisplayName("Load user details succeeds by email")
  @Story("User authentication")
  void loadUserByUsername_shouldReturnUserPrincipal_whenEmailExists() {
    User user = buildUser("student@apsas.dev");

    when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

    UserPrincipal result = (UserPrincipal) customUserDetailsService.loadUserByUsername(user.getEmail());

    assertEquals(user.getId(), result.userId());
    assertEquals(user.getEmail(), result.email());
    assertEquals(user.getRole().name(), result.role());
  }

  @Test
  @TmsLink("IDT-CUDS-002")
  @DisplayName("Load user details succeeds by UUID")
  @Story("User authentication")
  void loadUserByUsername_shouldReturnUserPrincipal_whenUuidExists() {
    User user = buildUser("uuid@apsas.dev");

    when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

    UserPrincipal result = (UserPrincipal) customUserDetailsService.loadUserByUsername(user.getId()
        .toString());

    assertEquals(user.getId(), result.userId());
    assertEquals(user.getEmail(), result.email());
  }

  @Test
  @TmsLink("IDT-CUDS-003")
  @DisplayName("Load user details fails when email does not exist")
  @Story("User authentication")
  void loadUserByUsername_shouldThrowUsernameNotFound_whenEmailMissing() {
    when(userRepository.findByEmail("missing@apsas.dev")).thenReturn(Optional.empty());

    assertThrows(
        UsernameNotFoundException.class,
        () -> customUserDetailsService.loadUserByUsername("missing@apsas.dev")
    );
  }

  @Test
  @TmsLink("IDT-CUDS-004")
  @DisplayName("Load user details fails when UUID does not exist")
  @Story("User authentication")
  void loadUserByUsername_shouldThrowUsernameNotFound_whenUuidMissing() {
    UUID missingId = UUID.randomUUID();
    String missingUserId = missingId.toString();
    when(userRepository.findById(missingId)).thenReturn(Optional.empty());

    assertThrows(
        UsernameNotFoundException.class,
        () -> customUserDetailsService.loadUserByUsername(missingUserId)
    );
  }

  @Test
  @TmsLink("IDT-CUDS-005")
  @DisplayName("Load user details fails when identifier is invalid")
  @Story("User authentication")
  void loadUserByUsername_shouldThrowUsernameNotFound_whenIdentifierIsInvalid() {
    assertThrows(
        UsernameNotFoundException.class,
        () -> customUserDetailsService.loadUserByUsername("abc")
    );
  }

  private User buildUser(String email) {
    return Instancio.of(User.class)
        .set(field(User::getId), UUID.randomUUID())
        .set(field(User::getEmail), email)
        .set(field(User::getPasswordHash), "hashed-password")
        .set(field(User::getFirstName), "First")
        .set(field(User::getLastName), "Last")
        .set(field(User::getRole), UserRole.STUDENT)
        .set(field(User::getIsActive), true)
        .create();
  }
}

