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
import java.util.Optional;
import java.util.UUID;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@Epic("R2 Backend")
@Feature("Notification Preferences")
@Owner("hoanglhh20026")
class NotificationPreferencesServiceTest {
  @Mock private NotificationPreferencesRepository preferencesRepository;
  @Mock private NotificationPreferencesMapper preferencesMapper;

  private NotificationPreferencesService service;

  @BeforeEach
  void setUp() {
    service = new NotificationPreferencesService(preferencesRepository, preferencesMapper);
  }

  @Test
  @Story("NTF-PREF-001")
  void ntfPref001_getPreferences_returnsMappedResponseForExistingUser() {
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
  @Story("NTF-PREF-002")
  void ntfPref002_getPreferences_createsDefaultPreferencesWhenMissing() {
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
  @Story("NTF-PREF-003")
  @Description("Updates stored notification preferences and returns the mapped response.")
  void ntfPref003_updatePreferences_updatesAndSaves() {
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
  @Story("NTF-PREF-EXTRA-001")
  void ntfPrefExtra_isNotificationEnabled_defaultsTrueWhenNoPreferences() {
    UUID userId = UUID.randomUUID();
    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.empty());

    assertTrue(service.isNotificationEnabled(userId, "assignment_published", "email"));
  }

  @Test
  @Story("NTF-PREF-004")
  void ntfPref004_isNotificationEnabled_returnsFalseWhenGlobalChannelDisabled() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences preferences = new NotificationPreferences();
    preferences.setUserId(userId);
    preferences.setEmailEnabled(false);
    preferences.setPushEnabled(true);

    when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(preferences));

    assertFalse(service.isNotificationEnabled(userId, "assignment_published", "email"));
  }

  @Test
  @Story("NTF-PREF-005")
  void ntfPref005_isNotificationEnabled_respectsTypeSpecificFlags() {
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
