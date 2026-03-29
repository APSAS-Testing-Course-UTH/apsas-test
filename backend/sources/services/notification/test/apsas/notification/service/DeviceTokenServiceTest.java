package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.notification.mapper.DeviceTokenMapper;
import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.model.entity.DeviceToken;
import apsas.notification.repository.DeviceTokenRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
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
@Feature("Device Token Service")
@Issue("13")
class DeviceTokenServiceTest {
  @Mock
  private DeviceTokenRepository deviceTokenRepository;

  @Mock
  private DeviceTokenMapper deviceTokenMapper;

  private DeviceTokenService service;

  @BeforeEach
  void setUp() {
    service = new DeviceTokenService(deviceTokenRepository, deviceTokenMapper);
  }

  @Test
  @Tag("unit")
  @Story("Register a new device token")
  @TmsLink("NTF-DEV-001")
  @DisplayName("Should create an active token when token does not exist")
  void registerToken_shouldCreateActiveToken_whenTokenDoesNotExist() {
    UUID userId = UUID.randomUUID();
    RegisterDeviceRequest request = new RegisterDeviceRequest();
    request.setToken("token-new");
    request.setDeviceType("ANDROID");
    request.setUserAgent("agent-1");

    DeviceToken newEntity = new DeviceToken();
    newEntity.setUserId(userId);
    newEntity.setToken("token-new");
    newEntity.setDeviceType("ANDROID");
    newEntity.setUserAgent("agent-1");

    DeviceToken saved = new DeviceToken();
    saved.setId(UUID.randomUUID());
    saved.setUserId(userId);
    saved.setToken("token-new");
    saved.setDeviceType("ANDROID");
    saved.setUserAgent("agent-1");
    saved.setIsActive(true);

    DeviceTokenResponse response = new DeviceTokenResponse();
    response.setId(saved.getId());
    response.setToken(saved.getToken());
    response.setIsActive(true);

    when(deviceTokenRepository.findByToken("token-new")).thenReturn(Optional.empty());
    when(deviceTokenMapper.toEntity(request, userId)).thenReturn(newEntity);
    when(deviceTokenRepository.save(newEntity)).thenReturn(saved);
    when(deviceTokenMapper.toResponse(saved)).thenReturn(response);

    DeviceTokenResponse result = service.registerToken(request, userId);

    assertNotNull(result.getId());
    assertEquals("token-new", result.getToken());
    assertTrue(result.getIsActive());
  }

  @Test
  @Tag("unit")
  @Story("Update an existing device token")
  @TmsLink("NTF-DEV-002")
  @DisplayName("Should update existing token data when token already exists")
  void registerToken_shouldUpdateExistingToken_whenTokenAlreadyExists() {
    UUID userId = UUID.randomUUID();
    RegisterDeviceRequest request = new RegisterDeviceRequest();
    request.setToken("token-existing");
    request.setDeviceType("IOS");
    request.setUserAgent("new-agent");

    DeviceToken existing = new DeviceToken();
    existing.setId(UUID.randomUUID());
    existing.setToken("token-existing");
    existing.setUserId(UUID.randomUUID());
    existing.setDeviceType("ANDROID");
    existing.setUserAgent("old-agent");
    existing.setIsActive(false);

    DeviceTokenResponse response = new DeviceTokenResponse();
    response.setId(existing.getId());
    response.setToken(existing.getToken());
    response.setIsActive(true);

    when(deviceTokenRepository.findByToken("token-existing")).thenReturn(Optional.of(existing));
    when(deviceTokenRepository.save(existing)).thenReturn(existing);
    when(deviceTokenMapper.toResponse(existing)).thenReturn(response);

    DeviceTokenResponse result = service.registerToken(request, userId);

    assertEquals(existing.getId(), result.getId());
    assertTrue(existing.getIsActive());
    assertEquals(userId, existing.getUserId());
    assertEquals("IOS", existing.getDeviceType());
    assertEquals("new-agent", existing.getUserAgent());
    verify(deviceTokenRepository).save(existing);
  }

  @Test
  @Tag("unit")
  @Story("Fetch active tokens by user")
  @TmsLink("NTF-DEV-003")
  @DisplayName("Should return only active token strings for the user")
  void getActiveTokenStringsByUserId_shouldReturnOnlyActiveTokens_whenRepositoryReturnsMixedState() {
    UUID userId = UUID.randomUUID();
    DeviceToken active = new DeviceToken();
    active.setToken("active-token");
    active.setIsActive(true);

    when(deviceTokenRepository.findByUserIdAndIsActive(userId, true)).thenReturn(List.of(active));

    List<String> result = service.getActiveTokenStringsByUserId(userId);

    assertEquals(1, result.size());
    assertEquals("active-token", result.getFirst());
  }

  @Test
  @Tag("unit")
  @Story("Remove a device token")
  @TmsLink("NTF-DEV-004")
  @DisplayName("Should delete token when removal is requested")
  void removeToken_shouldDeleteToken_whenTokenIsProvided() {
    service.removeToken("token-1");

    verify(deviceTokenRepository).deleteByToken("token-1");
  }

  @Test
  @Tag("unit")
  @Story("Handle remove token for missing token")
  @TmsLink("NTF-DEV-EXTRA-001")
  @DisplayName("Should not perform save when deleting a non-existent token")
  void removeToken_shouldNotSaveEntity_whenTokenDoesNotExist() {
    service.removeToken("not-found");

    verify(deviceTokenRepository).deleteByToken("not-found");
    verify(deviceTokenRepository, never()).save(any(DeviceToken.class));
  }

  @Test
  @Tag("unit")
  @Story("Map user devices to response")
  @TmsLink("NTF-DEV-EXTRA-002")
  @DisplayName("Should map user device entities to response DTOs")
  void getUserDevices_shouldMapEntitiesToResponses_whenDevicesExist() {
    UUID userId = UUID.randomUUID();
    DeviceToken token = new DeviceToken();
    token.setToken("token-1");
    DeviceTokenResponse response = new DeviceTokenResponse();
    response.setToken("token-1");

    when(deviceTokenRepository.findByUserId(userId)).thenReturn(List.of(token));
    when(deviceTokenMapper.toResponse(token)).thenReturn(response);

    List<DeviceTokenResponse> result = service.getUserDevices(userId);

    assertEquals(1, result.size());
    assertEquals("token-1", result.getFirst().getToken());
  }
}
