package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.notification.mapper.NotificationPreferencesMapper;
import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.notification.model.entity.NotificationPreferences;
import apsas.notification.repository.NotificationPreferencesRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@Epic("Notification Service")
@Feature("Notification Preferences Service")
@Issue("13")
class NotificationPreferencesServiceTest {
  @Mock
  private NotificationPreferencesRepository preferencesRepository;

  @Mock
  private NotificationPreferencesMapper preferencesMapper;

  private NotificationPreferencesService service;

  @BeforeEach
  void setUp() {
    service = new NotificationPreferencesService(preferencesRepository, preferencesMapper);
  }

  @Test
  @Tag("unit")
  @Story("Get user preferences")
  @TmsLink("NTF-PREF-001")
  @DisplayName("Should return mapped preferences when user preferences exist")
  void getPreferences_shouldReturnMappedPreferences_whenUserPreferencesExist() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences preferences = new NotificationPreferences();
    preferences.setUserId(userId);

    NotificationPreferencesResponse response = new NotificationPreferencesResponse();
    response.setUserId(userId);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(preferences));
    when(preferencesMapper.toResponse(preferences)).thenReturn(response);

    NotificationPreferencesResponse result = service.getPreferences(userId);

    assertEquals(userId, result.getUserId());
  }

  @Test
  @Tag("unit")
  @Story("Create default preferences")
  @TmsLink("NTF-PREF-002")
  @DisplayName("Should create default preferences when user preferences are missing")
  void getPreferences_shouldCreateDefaultPreferences_whenUserPreferencesMissing() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences created = new NotificationPreferences();
    created.setUserId(userId);

    NotificationPreferencesResponse response = new NotificationPreferencesResponse();
    response.setUserId(userId);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.empty());
    when(preferencesRepository.save(any(NotificationPreferences.class))).thenReturn(created);
    when(preferencesMapper.toResponse(created)).thenReturn(response);

    NotificationPreferencesResponse result = service.getPreferences(userId);

    assertEquals(userId, result.getUserId());
    verify(preferencesRepository).save(any(NotificationPreferences.class));
  }

  @Test
  @Tag("unit")
  @Story("Update preferences")
  @TmsLink("NTF-PREF-003")
  @DisplayName("Should update and persist preferences when update request is valid")
  void updatePreferences_shouldPersistUpdatedPreferences_whenRequestIsValid() {
    UUID userId = UUID.randomUUID();
    NotificationPreferencesRequest request = new NotificationPreferencesRequest();
    request.setEmailEnabled(false);
    request.setPushEnabled(true);

    NotificationPreferences existing = new NotificationPreferences();
    existing.setUserId(userId);

    NotificationPreferencesResponse response = new NotificationPreferencesResponse();
    response.setUserId(userId);
    response.setEmailEnabled(false);
    response.setPushEnabled(true);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
    when(preferencesRepository.save(existing)).thenReturn(existing);
    when(preferencesMapper.toResponse(existing)).thenReturn(response);

    NotificationPreferencesResponse result = service.updatePreferences(userId, request);

    verify(preferencesMapper).updateEntity(request, existing);
    verify(preferencesRepository).save(existing);
    assertFalse(result.getEmailEnabled());
    assertTrue(result.getPushEnabled());
  }

  @Test
  @Tag("unit")
  @Story("Resolve notification toggle defaults")
  @TmsLink("NTF-PREF-EXTRA-001")
  @DisplayName("Should return true by default when preferences are missing")
  void isNotificationEnabled_shouldReturnTrueByDefault_whenPreferencesMissing() {
    UUID userId = UUID.randomUUID();
    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.empty());

    assertTrue(service.isNotificationEnabled(userId, "assignment_published", "email"));
  }

  @Test
  @Tag("unit")
  @Story("Evaluate global channel flags")
  @TmsLink("NTF-PREF-004")
  @DisplayName("Should return false when global channel is disabled")
  void isNotificationEnabled_shouldReturnFalse_whenGlobalChannelDisabled() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences preferences = new NotificationPreferences();
    preferences.setUserId(userId);
    preferences.setEmailEnabled(false);
    preferences.setPushEnabled(true);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(preferences));

    assertFalse(service.isNotificationEnabled(userId, "assignment_published", "email"));
  }

  @Test
  @Tag("unit")
  @Story("Evaluate type-specific notification flags")
  @TmsLink("NTF-PREF-005")
  @DisplayName("Should follow type-specific preferences for each notification type")
  void isNotificationEnabled_shouldFollowTypeSpecificFlags_whenTypeConfigurationsExist() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences preferences = new NotificationPreferences();
    preferences.setUserId(userId);
    preferences.setEmailEnabled(true);
    preferences.setPushEnabled(true);
    preferences.setEmailAssignmentPublished(false);
    preferences.setPushSubmissionEvaluated(false);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(preferences));

    assertFalse(service.isNotificationEnabled(userId, "assignment_published", "email"));
    assertFalse(service.isNotificationEnabled(userId, "submission_evaluated", "push"));
    assertTrue(service.isNotificationEnabled(userId, "unknown", "email"));
  }
}
