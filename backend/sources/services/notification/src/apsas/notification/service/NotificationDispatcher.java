package apsas.notification.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** Dispatches notifications through email and push channels based on user preferences. */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationDispatcher {
  private final EmailService emailService;
  private final PushNotificationService pushNotificationService;
  private final NotificationPreferencesService preferencesService;
  private final DeviceTokenService deviceTokenService;

  /** Send verification email (bypasses preferences). */
  public void sendVerificationEmail(
      String email, String firstName, String lastName, String verificationToken) {
    try {
      emailService.sendVerificationEmail(email, firstName, lastName, verificationToken);
    } catch (Exception e) {
      log.error("Failed to send verification email to: {}", email, e);
    }
  }

  /** Send password reset email (bypasses preferences). */
  public void sendPasswordResetEmail(String email, String firstName, String resetToken) {
    try {
      emailService.sendPasswordResetEmail(email, firstName, resetToken);
    } catch (Exception e) {
      log.error("Failed to send password reset email to: {}", email, e);
    }
  }

  /** Send assignment published notification via email and push. */
  public void sendAssignmentPublishedNotification(
      UUID userId,
      String email,
      String firstName,
      String assignmentTitle,
      String deadline,
      String assignmentUrl
  ) {
    if (preferencesService.isNotificationEnabled(userId, "assignment_published", "email")) {
      try {
        String description = "";
        emailService.sendAssignmentPublishedEmail(
            email, firstName, assignmentTitle, description, deadline, assignmentUrl);
      } catch (Exception e) {
        log.error("Failed to send assignment published email to: {}", email, e);
      }
    }

    if (preferencesService.isNotificationEnabled(userId, "assignment_published", "push")) {
      try {
        List<String> tokens = deviceTokenService.getActiveTokenStringsByUserId(userId);
        if (!tokens.isEmpty()) {
          pushNotificationService.sendAssignmentPublishedNotification(
              tokens, assignmentTitle, assignmentUrl);
        }
      } catch (Exception e) {
        log.error("Failed to send assignment published push to: {}", userId, e);
      }
    }
  }

  /** Send submission evaluated notification via email and push. */
  @SuppressWarnings("java:S107")
  public void sendSubmissionEvaluatedNotification(
      UUID userId,
      String email,
      String firstName,
      String assignmentTitle,
      Integer score,
      Boolean passed,
      Integer testsPassed,
      Integer totalTests,
      String executionTime,
      String feedback,
      String submissionUrl
  ) {
    if (preferencesService.isNotificationEnabled(userId, "submission_evaluated", "email")) {
      try {
        emailService.sendSubmissionEvaluatedEmail(
            email,
            firstName,
            assignmentTitle,
            score,
            passed,
            testsPassed,
            totalTests,
            executionTime,
            feedback,
            submissionUrl
        );
      } catch (Exception e) {
        log.error("Failed to send submission evaluated email to: {}", email, e);
      }
    }

    if (preferencesService.isNotificationEnabled(userId, "submission_evaluated", "push")) {
      try {
        List<String> tokens = deviceTokenService.getActiveTokenStringsByUserId(userId);
        if (!tokens.isEmpty()) {
          pushNotificationService.sendSubmissionEvaluatedNotification(
              tokens.getFirst(),
              assignmentTitle,
              score,
              submissionUrl
          );
        }
      } catch (Exception e) {
        log.error("Failed to send submission evaluated push to: {}", userId, e);
      }
    }
  }

  /** Send support request notification to all instructors via email and push. */
  public void sendSupportRequestNotification(
      Map<String, String> instructorEmails,
      List<UUID> instructorUserIds,
      String studentName,
      String studentEmail,
      String initialMessage,
      String sessionUrl
  ) {
    for (var instructor : instructorEmails.entrySet()) {
      try {
        emailService.sendSupportRequestEmail(
            instructor.getKey(),
            instructor.getValue(),
            studentName,
            studentEmail,
            initialMessage,
            sessionUrl
        );
      } catch (Exception e) {
        log.error("Failed to send support request email to: {}", instructor.getKey(), e);
      }
    }

    for (UUID instructorId : instructorUserIds) {
      try {
        List<String> tokens = deviceTokenService.getActiveTokenStringsByUserId(instructorId);
        if (!tokens.isEmpty()) {
          pushNotificationService.sendSupportRequestNotification(
              tokens, studentName, initialMessage, sessionUrl);
        }
      } catch (Exception e) {
        log.error("Failed to send support request push to: {}", instructorId, e);
      }
    }
  }
}
