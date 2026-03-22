package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class NotificationDispatcherTest {
  private EmailService emailService;
  private PushNotificationService pushNotificationService;
  private NotificationPreferencesService preferencesService;
  private DeviceTokenService deviceTokenService;
  private NotificationDispatcher dispatcher;

  @BeforeEach
  void setUp() {
    emailService = mock(EmailService.class);
    pushNotificationService = mock(PushNotificationService.class);
    preferencesService = mock(NotificationPreferencesService.class);
    deviceTokenService = mock(DeviceTokenService.class);
    dispatcher =
        new NotificationDispatcher(
            emailService,
            pushNotificationService,
            preferencesService,
            deviceTokenService);
  }

  @Test
  void sendAssignmentPublishedNotification_sendsEmailAndPushWhenEnabled() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "email"))
        .thenReturn(true);
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "push"))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of("token-1"));

    dispatcher.sendAssignmentPublishedNotification(
        userId,
        "user@example.com",
        "Lan",
        "Assignment A",
        "2026-03-30",
        "https://host/assignment/A");

    verify(emailService)
        .sendAssignmentPublishedEmail(
            "user@example.com",
            "Lan",
            "Assignment A",
            "2026-03-30",
            "https://host/assignment/A",
            "https://host/assignment/A");
    verify(pushNotificationService)
        .sendAssignmentPublishedNotification(
            List.of("token-1"), "Assignment A", "https://host/assignment/A");
  }

  @Test
  void sendSubmissionEvaluatedNotification_usesPassedStatusForPush() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "email"))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "push"))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of("token-1"));

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        "user@example.com",
        "Lan",
        "Assignment A",
        80,
        true,
        8,
        10,
        "100ms",
        "Good",
        "submission-id");

    ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            eq("token-1"), eq("Assignment A"), eq(80), statusCaptor.capture());
    assertEquals("\u0110\u1ea0T", statusCaptor.getValue());
    verify(emailService, never())
        .sendSubmissionEvaluatedEmail(
            anyString(), anyString(), anyString(), eq(80), eq(true), eq(8), eq(10), anyString(),
            anyString(), anyString());
  }

  @Test
  void sendSubmissionEvaluatedNotification_usesNeedsImprovementStatusForPush() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "email"))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "push"))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of("token-2"));

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        "user@example.com",
        "Lan",
        "Assignment B",
        40,
        false,
        4,
        10,
        "120ms",
        "Retry",
        "submission-id");

    ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            eq("token-2"), eq("Assignment B"), eq(40), statusCaptor.capture());
    assertEquals("C\u1ea6N C\u1ea2I THI\u1ec6N", statusCaptor.getValue());
  }

  @Test
  void sendSupportRequestNotification_swallowsEmailExceptionAndContinuesPush() {
    UUID instructorId = UUID.randomUUID();
    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId)).thenReturn(List.of("token-3"));
    org.mockito.Mockito.doThrow(new RuntimeException("mail down"))
        .when(emailService)
        .sendSupportRequestEmail(
            eq("instructor@example.com"),
            eq("Instructor A"),
            eq("Student A"),
            eq("student@example.com"),
            eq("Need help"),
            eq("session-1"));

    assertDoesNotThrow(
        () ->
            dispatcher.sendSupportRequestNotification(
                Map.of("instructor@example.com", "Instructor A"),
                List.of(instructorId),
                "Student A",
                "student@example.com",
                "Need help",
                "session-1"));

    verify(pushNotificationService)
        .sendSupportRequestNotification(
            List.of("token-3"), "Student A", "Need help", "session-1");
  }
}
