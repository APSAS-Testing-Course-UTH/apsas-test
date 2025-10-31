package apsas.notification.service;

import apsas.notification.mapper.NotificationPreferencesMapper;
import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.notification.model.entity.NotificationPreferences;
import apsas.notification.repository.NotificationPreferencesRepository;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferencesService {

  private static final Logger logger =
      LoggerFactory.getLogger(NotificationPreferencesService.class);

  private final NotificationPreferencesRepository preferencesRepository;
  private final NotificationPreferencesMapper preferencesMapper;

  public NotificationPreferencesService(
      NotificationPreferencesRepository preferencesRepository,
      NotificationPreferencesMapper preferencesMapper
  ) {
    this.preferencesRepository = preferencesRepository;
    this.preferencesMapper = preferencesMapper;
  }

  public NotificationPreferencesResponse getPreferences(UUID userId) {
    NotificationPreferences preferences =
        preferencesRepository
            .findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));
    return preferencesMapper.toResponse(preferences);
  }

  @Transactional
  public NotificationPreferencesResponse updatePreferences(
      UUID userId, NotificationPreferencesRequest request) {
    NotificationPreferences preferences =
        preferencesRepository
            .findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));

    preferencesMapper.updateEntity(request, preferences);
    NotificationPreferences saved = preferencesRepository.save(preferences);
    logger.info("Updated notification preferences for user: {}", userId);
    return preferencesMapper.toResponse(saved);
  }

  private NotificationPreferences createDefaultPreferences(UUID userId) {
    NotificationPreferences preferences = new NotificationPreferences();
    preferences.setUserId(userId);
    NotificationPreferences saved = preferencesRepository.save(preferences);
    logger.info("Created default notification preferences for user: {}", userId);
    return saved;
  }

  public boolean isNotificationEnabled(UUID userId, String notificationType, String channel) {
    NotificationPreferences preferences = preferencesRepository.findByUserId(userId).orElse(null);

    if (preferences == null) {
      return true; // Default to enabled if no preferences exist
    }

    // Check channel enabled
    if ("email".equals(channel) && !preferences.getEmailEnabled()) {
      return false;
    }
    if ("push".equals(channel) && !preferences.getPushEnabled()) {
      return false;
    }

    // Check specific notification type
    return switch (channel + "_" + notificationType) {
      case "email_verification" -> preferences.getEmailVerification();
      case "email_password_reset" -> preferences.getEmailPasswordReset();
      case "email_assignment_published" -> preferences.getEmailAssignmentPublished();
      case "email_assignment_reminder" -> preferences.getEmailAssignmentReminder();
      case "email_submission_evaluated" -> preferences.getEmailSubmissionEvaluated();
      case "push_assignment_published" -> preferences.getPushAssignmentPublished();
      case "push_assignment_reminder" -> preferences.getPushAssignmentReminder();
      case "push_submission_evaluated" -> preferences.getPushSubmissionEvaluated();
      default -> true;
    };
  }
}
