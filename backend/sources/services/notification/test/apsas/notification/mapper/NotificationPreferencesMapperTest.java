package apsas.notification.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.notification.model.entity.NotificationPreferences;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

/**
 * Unit test cho NotificationPreferencesMapper.
 *
 * Nhóm test này xác minh map đầy đủ DTO/entity và hành vi ignore-null khi update.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Mapper - Notification Preferences")
class NotificationPreferencesMapperTest {

  private final NotificationPreferencesMapper mapper =
      Mappers.getMapper(NotificationPreferencesMapper.class);

  @Test
  @Story("Map entity to response")
  @TmsLink("NTF-MAP-003")
  @DisplayName("Maps notification preferences entity to response contract")
  void toResponseShouldMapEntityToResponse() {
    UUID id = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    NotificationPreferences entity = new NotificationPreferences();
    entity.setId(id);
    entity.setUserId(userId);
    entity.setEmailEnabled(false);
    entity.setPushEnabled(true);
    entity.setEmailAssignmentPublished(false);
    entity.setEmailSubmissionEvaluated(true);
    entity.setPushAssignmentPublished(false);
    entity.setPushSubmissionEvaluated(true);
    entity.setCreatedAt(LocalDateTime.of(2026, 4, 2, 9, 0));
    entity.setUpdatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));

    NotificationPreferencesResponse response = mapper.toResponse(entity);

    assertEquals(id, response.getId());
    assertEquals(userId, response.getUserId());
    assertEquals(false, response.getEmailEnabled());
    assertEquals(true, response.getPushEnabled());
    assertEquals(false, response.getEmailAssignmentPublished());
    assertEquals(true, response.getEmailSubmissionEvaluated());
    assertEquals(false, response.getPushAssignmentPublished());
    assertEquals(true, response.getPushSubmissionEvaluated());
    assertEquals(LocalDateTime.of(2026, 4, 2, 9, 0), response.getCreatedAt());
    assertEquals(LocalDateTime.of(2026, 4, 2, 10, 0), response.getUpdatedAt());
  }

  @Test
  @Story("Update entity from request")
  @TmsLink("NTF-MAP-004")
  @DisplayName("Updates only provided fields and keeps existing values for null request fields")
  void updateEntityShouldIgnoreNullFieldsAndKeepExistingValues() {
    NotificationPreferences entity = new NotificationPreferences();
    entity.setEmailEnabled(true);
    entity.setPushEnabled(false);
    entity.setEmailAssignmentPublished(true);
    entity.setEmailSubmissionEvaluated(true);
    entity.setPushAssignmentPublished(true);
    entity.setPushSubmissionEvaluated(false);

    NotificationPreferencesRequest request = new NotificationPreferencesRequest();
    request.setEmailEnabled(false);
    request.setPushEnabled(null);
    request.setEmailAssignmentPublished(false);
    request.setEmailSubmissionEvaluated(null);
    request.setPushAssignmentPublished(false);
    request.setPushSubmissionEvaluated(null);

    mapper.updateEntity(request, entity);

    assertEquals(false, entity.getEmailEnabled());
    assertEquals(false, entity.getPushEnabled());
    assertEquals(false, entity.getEmailAssignmentPublished());
    assertEquals(true, entity.getEmailSubmissionEvaluated());
    assertEquals(false, entity.getPushAssignmentPublished());
    assertEquals(false, entity.getPushSubmissionEvaluated());
  }

  @Test
  @Story("Map null entity")
  @TmsLink("NTF-MAP-005")
  @DisplayName("Returns null response when source entity is null")
  void toResponseShouldReturnNullWhenSourceEntityIsNull() {
    NotificationPreferencesResponse response = mapper.toResponse(null);

    assertNull(response);
  }

  @Test
  @Story("Update entity from null request")
  @TmsLink("NTF-MAP-006")
  @DisplayName("Does not mutate entity when update request is null")
  void updateEntityShouldNotMutateTargetWhenRequestIsNull() {
    NotificationPreferences entity = new NotificationPreferences();
    entity.setEmailEnabled(true);
    entity.setPushEnabled(false);

    mapper.updateEntity(null, entity);

    assertEquals(true, entity.getEmailEnabled());
    assertEquals(false, entity.getPushEnabled());
  }

  @Test
  @Story("Update entity from request")
  @TmsLink("NTF-MAP-009")
  @DisplayName("Applies all flags when every request field is provided")
  void updateEntityShouldApplyAllFlagsWhenRequestContainsAllFields() {
    NotificationPreferences entity = new NotificationPreferences();
    entity.setEmailEnabled(true);
    entity.setPushEnabled(true);
    entity.setEmailAssignmentPublished(true);
    entity.setEmailSubmissionEvaluated(true);
    entity.setPushAssignmentPublished(true);
    entity.setPushSubmissionEvaluated(true);

    NotificationPreferencesRequest request = new NotificationPreferencesRequest();
    request.setEmailEnabled(false);
    request.setPushEnabled(false);
    request.setEmailAssignmentPublished(false);
    request.setEmailSubmissionEvaluated(false);
    request.setPushAssignmentPublished(false);
    request.setPushSubmissionEvaluated(false);

    mapper.updateEntity(request, entity);

    assertEquals(false, entity.getEmailEnabled());
    assertEquals(false, entity.getPushEnabled());
    assertEquals(false, entity.getEmailAssignmentPublished());
    assertEquals(false, entity.getEmailSubmissionEvaluated());
    assertEquals(false, entity.getPushAssignmentPublished());
    assertEquals(false, entity.getPushSubmissionEvaluated());
  }
}
