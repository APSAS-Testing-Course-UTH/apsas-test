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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DeviceTokenService {

  private static final Logger logger = LoggerFactory.getLogger(DeviceTokenService.class);

  private final DeviceTokenRepository deviceTokenRepository;
  private final DeviceTokenMapper deviceTokenMapper;

  public DeviceTokenService(
      DeviceTokenRepository deviceTokenRepository, DeviceTokenMapper deviceTokenMapper) {
    this.deviceTokenRepository = deviceTokenRepository;
    this.deviceTokenMapper = deviceTokenMapper;
  }

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
      logger.info("Updated existing device token for user: {}", userId);
      return deviceTokenMapper.toResponse(saved);
    }

    // Create new token
    DeviceToken deviceToken = deviceTokenMapper.toEntity(request, userId);
    DeviceToken saved = deviceTokenRepository.save(deviceToken);
    logger.info("Registered new device token for user: {}", userId);
    return deviceTokenMapper.toResponse(saved);
  }

  @Transactional
  public void deactivateToken(String token) {
    deviceTokenRepository
        .findByToken(token)
        .ifPresent(
            deviceToken -> {
              deviceToken.setIsActive(false);
              deviceTokenRepository.save(deviceToken);
              logger.info("Deactivated device token: {}", token);
            });
  }

  @Transactional
  public void removeToken(String token) {
    deviceTokenRepository.deleteByToken(token);
    logger.info("Removed device token: {}", token);
  }

  public List<DeviceTokenResponse> getActiveTokensByUserId(UUID userId) {
    return deviceTokenRepository.findByUserIdAndIsActive(userId, true).stream()
        .map(deviceTokenMapper::toResponse)
        .collect(Collectors.toList());
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

  @Transactional
  public void markTokenAsInvalid(String token) {
    deactivateToken(token);
  }
}
