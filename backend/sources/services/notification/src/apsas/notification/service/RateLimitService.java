package apsas.notification.service;

import apsas.notification.model.entity.RateLimit;
import apsas.notification.repository.RateLimitRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

  private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

  private final RateLimitRepository rateLimitRepository;

  @Value("${notification.rate-limit.enabled:true}")
  private boolean rateLimitEnabled;

  @Value("${notification.rate-limit.window-minutes:60}")
  private int windowMinutes;

  private Map<String, Integer> limits;

  public RateLimitService(RateLimitRepository rateLimitRepository) {
    this.rateLimitRepository = rateLimitRepository;
    initializeLimits();
  }

  private void initializeLimits() {
    limits = new HashMap<>();
    limits.put("email-verification", 3);
    limits.put("password-reset", 3);
    limits.put("assignment-published", 10);
    limits.put("assignment-reminder", 10);
    limits.put("submission-evaluated", 20);
  }

  @Transactional
  public boolean checkRateLimit(UUID userId, String notificationType) {
    if (!rateLimitEnabled) {
      return true;
    }

    Integer limit = limits.getOrDefault(notificationType, 10);
    LocalDateTime windowStart = calculateWindowStart();

    RateLimit rateLimit =
        rateLimitRepository
            .findByUserIdAndNotificationTypeAndWindowStart(userId, notificationType, windowStart)
            .orElse(null);

    if (rateLimit == null) {
      // First notification in this window
      createRateLimit(userId, notificationType, windowStart, 1);
      return true;
    }

    if (rateLimit.getSentCount() >= limit) {
      logger.warn(
          "Rate limit exceeded for user: {}, type: {}, count: {}/{}",
          userId,
          notificationType,
          rateLimit.getSentCount(),
          limit
      );
      return false;
    }

    // Increment counter
    rateLimit.setSentCount(rateLimit.getSentCount() + 1);
    rateLimitRepository.save(rateLimit);
    return true;
  }

  @Transactional
  public void incrementCounter(UUID userId, String notificationType) {
    if (!rateLimitEnabled) {
      return;
    }

    LocalDateTime windowStart = calculateWindowStart();
    RateLimit rateLimit =
        rateLimitRepository
            .findByUserIdAndNotificationTypeAndWindowStart(userId, notificationType, windowStart)
            .orElse(null);

    if (rateLimit == null) {
      createRateLimit(userId, notificationType, windowStart, 1);
    } else {
      rateLimit.setSentCount(rateLimit.getSentCount() + 1);
      rateLimitRepository.save(rateLimit);
    }
  }

  private void createRateLimit(
      UUID userId, String notificationType, LocalDateTime windowStart, int count) {
    RateLimit rateLimit = new RateLimit();
    rateLimit.setUserId(userId);
    rateLimit.setNotificationType(notificationType);
    rateLimit.setWindowStart(windowStart);
    rateLimit.setSentCount(count);
    rateLimitRepository.save(rateLimit);
  }

  private LocalDateTime calculateWindowStart() {
    LocalDateTime now = LocalDateTime.now();
    int currentMinute = now.getMinute();
    int windowsPerHour = 60 / windowMinutes;
    int windowIndex = currentMinute / windowMinutes;
    int windowStartMinute = windowIndex * windowMinutes;

    return now.withMinute(windowStartMinute).withSecond(0).withNano(0);
  }

  @Scheduled(fixedRate = 3600000) // Run every hour
  @Transactional
  public void resetExpiredWindows() {
    LocalDateTime expiryTime = LocalDateTime.now().minusHours(24);
    rateLimitRepository.deleteExpiredWindows(expiryTime);
    logger.info("Cleaned up expired rate limit windows before: {}", expiryTime);
  }
}
