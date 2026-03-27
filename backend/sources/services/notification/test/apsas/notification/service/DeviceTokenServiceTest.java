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
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
@Feature("Device Token Management")
@Owner("hoanglhh20026")
class DeviceTokenServiceTest {
  @Mock private DeviceTokenRepository deviceTokenRepository;
  @Mock private DeviceTokenMapper deviceTokenMapper;

  private DeviceTokenService service;

  @BeforeEach
  void setUp() {
    service = new DeviceTokenService(deviceTokenRepository, deviceTokenMapper);
  }

  @Test
  @Story("NTF-DEV-001")
  void ntfDev001_registerToken_createsNewTokenAsActive() {
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
  @Story("NTF-DEV-002")
  void ntfDev002_registerToken_updatesExistingTokenData() {
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
  @Story("NTF-DEV-004")
  void ntfDev004_removeToken_deletesExistingToken() {
    service.removeToken("token-1");
    verify(deviceTokenRepository).deleteByToken("token-1");
  }

  @Test
  @Story("NTF-DEV-EXTRA-001")
  void ntfDevExtra_removeToken_handlesMissingTokenWithoutSave() {
    service.removeToken("not-found");
    verify(deviceTokenRepository).deleteByToken("not-found");
    verify(deviceTokenRepository, never()).save(any(DeviceToken.class));
  }

  @Test
  @Story("NTF-DEV-003")
  void ntfDev003_getActiveTokenStringsByUserId_returnsOnlyActiveTokens() {
    UUID userId = UUID.randomUUID();
    DeviceToken active = new DeviceToken();
    active.setToken("active-token");
    active.setIsActive(true);

    when(deviceTokenRepository.findByUserIdAndIsActive(userId, true)).thenReturn(List.of(active));

    List<String> result = service.getActiveTokenStringsByUserId(userId);

    assertEquals(1, result.size());
    assertEquals("active-token", result.get(0));
  }

  @Test
  @Story("NTF-DEV-EXTRA-002")
  void ntfDevExtra_getUserDevices_mapsEntitiesToResponses() {
    UUID userId = UUID.randomUUID();
    DeviceToken t1 = new DeviceToken();
    t1.setToken("token-1");
    DeviceTokenResponse r1 = new DeviceTokenResponse();
    r1.setToken("token-1");

    when(deviceTokenRepository.findByUserId(userId)).thenReturn(List.of(t1));
    when(deviceTokenMapper.toResponse(t1)).thenReturn(r1);

    List<DeviceTokenResponse> result = service.getUserDevices(userId);

    assertEquals(1, result.size());
    assertEquals("token-1", result.get(0).getToken());
  }
}
