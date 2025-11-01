package apsas.notification.service;

import apsas.notification.mapper.DeviceTokenMapper;
import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.model.entity.DeviceToken;
import apsas.notification.repository.DeviceTokenRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {
  private final DeviceTokenRepository deviceTokenRepository;
  private final DeviceTokenMapper deviceTokenMapper;

  @Transactional
  public DeviceTokenResponse registerToken(RegisterDeviceRequest request, UUID userId) {
    // Check if token already exists
    DeviceToken existingToken = deviceTokenRepository.findByToken(request.getToken()).orElse(null);

    if (existingToken != null) {
      // Update existing token
      existingToken.setUserId(userId);
      existingToken.setDeviceType(request.getDeviceType());
      existingToken.setUserAgent(request.getUserAgent());
      existingToken.setIsActive(true);
      DeviceToken saved = deviceTokenRepository.save(existingToken);
      return deviceTokenMapper.toResponse(saved);
    }

    // Create new token
    DeviceToken deviceToken = deviceTokenMapper.toEntity(request, userId);
    DeviceToken saved = deviceTokenRepository.save(deviceToken);
    return deviceTokenMapper.toResponse(saved);
  }

  @Transactional
  public void removeToken(String token) {
    deviceTokenRepository.deleteByToken(token);
  }

  public List<String> getActiveTokenStringsByUserId(UUID userId) {
    return deviceTokenRepository.findByUserIdAndIsActive(userId, true).stream()
        .map(DeviceToken::getToken)
        .collect(Collectors.toList());
  }

  public List<DeviceTokenResponse> getUserDevices(UUID userId) {
    return deviceTokenRepository.findByUserId(userId).stream()
        .map(deviceTokenMapper::toResponse)
        .collect(Collectors.toList());
  }
}
