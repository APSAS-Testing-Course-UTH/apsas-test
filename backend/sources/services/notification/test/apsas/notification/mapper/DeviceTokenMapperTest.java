package apsas.notification.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.model.entity.DeviceToken;
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
 * Unit test cho DeviceTokenMapper.
 *
 * Mục tiêu: đảm bảo mapstruct mapping đúng hợp đồng dữ liệu request/entity/response.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Mapper - Device Token")
class DeviceTokenMapperTest {

  private final DeviceTokenMapper mapper = Mappers.getMapper(DeviceTokenMapper.class);

  @Test
  @Story("Map request to entity")
  @TmsLink("NTF-MAP-001")
  @DisplayName("Maps register device request to entity with expected default active state")
  void toEntityShouldMapRequestToEntityWithExpectedDefaults() {
    UUID userId = UUID.randomUUID();
    RegisterDeviceRequest request = new RegisterDeviceRequest();
    request.setToken("token-123");
    request.setDeviceType("ANDROID");
    request.setUserAgent("Mozilla/5.0");

    DeviceToken entity = mapper.toEntity(request, userId);

    assertNull(entity.getId());
    assertEquals(userId, entity.getUserId());
    assertEquals("token-123", entity.getToken());
    assertEquals("ANDROID", entity.getDeviceType());
    assertEquals("Mozilla/5.0", entity.getUserAgent());
    assertTrue(entity.getIsActive());
    assertNull(entity.getCreatedAt());
    assertNull(entity.getUpdatedAt());
  }

  @Test
  @Story("Map entity to response")
  @TmsLink("NTF-MAP-002")
  @DisplayName("Maps device token entity to response contract")
  void toResponseShouldMapEntityToResponse() {
    UUID id = UUID.randomUUID();
    DeviceToken entity = new DeviceToken();
    entity.setId(id);
    entity.setUserId(UUID.randomUUID());
    entity.setToken("token-xyz");
    entity.setDeviceType("IOS");
    entity.setUserAgent("Safari");
    entity.setIsActive(false);
    entity.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    entity.setUpdatedAt(LocalDateTime.of(2026, 4, 2, 11, 0));

    DeviceTokenResponse response = mapper.toResponse(entity);

    assertEquals(id, response.getId());
    assertEquals("token-xyz", response.getToken());
    assertEquals("IOS", response.getDeviceType());
    assertEquals("Safari", response.getUserAgent());
    assertEquals(false, response.getIsActive());
    assertEquals(LocalDateTime.of(2026, 4, 2, 10, 0), response.getCreatedAt());
    assertEquals(LocalDateTime.of(2026, 4, 2, 11, 0), response.getUpdatedAt());
  }

  @Test
  @Story("Map null source")
  @TmsLink("NTF-MAP-007")
  @DisplayName("Returns null entity when both request and userId are null")
  void toEntityShouldReturnNullWhenRequestAndUserIdAreNull() {
    DeviceToken entity = mapper.toEntity(null, null);

    assertNull(entity);
  }

  @Test
  @Story("Map null source")
  @TmsLink("NTF-MAP-008")
  @DisplayName("Returns null response when device token entity is null")
  void toResponseShouldReturnNullWhenSourceEntityIsNull() {
    DeviceTokenResponse response = mapper.toResponse(null);

    assertNull(response);
  }
}
