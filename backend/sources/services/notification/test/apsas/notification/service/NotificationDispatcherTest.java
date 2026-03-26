package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
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
    void ntfDis001_sendVerificationEmail_bypassesPreferencesAndCallsEmailService() {
        dispatcher.sendVerificationEmail("user@example.com", "Lan", "Nguyen", "verify-token");

        verify(emailService).sendVerificationEmail("user@example.com", "Lan", "Nguyen", "verify-token");
        verifyNoInteractions(preferencesService);
    }

    @Test
    void ntfDis002_sendAssignmentPublishedNotification_sendsEmailWhenEnabled() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "email"))
        .thenReturn(true);
        when(preferencesService.isNotificationEnabled(userId, "assignment_published", "push")).thenReturn(false);

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
    verify(pushNotificationService, never())
        .sendAssignmentPublishedNotification(any(), anyString(), anyString());
  }

  @Test
  void ntfDis003_sendAssignmentPublishedNotification_sendsPushWhenEnabledAndHasTokens() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "email")).thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "push")).thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of("token-1"));

    dispatcher.sendAssignmentPublishedNotification(
        userId,
        "user@example.com",
        "Lan",
        "Assignment A",
        "2026-03-30",
        "https://host/assignment/A");

    verify(pushNotificationService)
        .sendAssignmentPublishedNotification(List.of("token-1"), "Assignment A", "https://host/assignment/A");
  }

  @Test
  void ntfDisExtra_sendSubmissionEvaluatedNotification_usesPassedStatusForPush() {
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

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<Integer> scoreCaptor = ArgumentCaptor.forClass(Integer.class);
    ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(), titleCaptor.capture(), scoreCaptor.capture(), statusCaptor.capture());
    assertEquals("token-1", tokenCaptor.getValue());
    assertEquals("Assignment A", titleCaptor.getValue());
    assertEquals(80, scoreCaptor.getValue());
    assertEquals("\u0110\u1ea0T", statusCaptor.getValue());
    verify(emailService, never())
        .sendSubmissionEvaluatedEmail(
            anyString(), anyString(), anyString(), anyInt(), anyBoolean(), anyInt(), anyInt(), anyString(),
            anyString(), anyString());
  }

  @Test
    void ntfDisExtra_sendSubmissionEvaluatedNotification_usesNeedsImprovementStatusForPush() {
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

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<Integer> scoreCaptor = ArgumentCaptor.forClass(Integer.class);
    ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(), titleCaptor.capture(), scoreCaptor.capture(), statusCaptor.capture());
    assertEquals("token-2", tokenCaptor.getValue());
    assertEquals("Assignment B", titleCaptor.getValue());
    assertEquals(40, scoreCaptor.getValue());
    assertEquals("C\u1ea6N C\u1ea2I THI\u1ec6N", statusCaptor.getValue());
  }

  @Test
  void ntfDis004_sendSubmissionEvaluatedNotification_doesNotSendPushWhenNoTokens() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "email"))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, "submission_evaluated", "push"))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of());

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

    verify(pushNotificationService, never())
        .sendSubmissionEvaluatedNotification(anyString(), anyString(), anyInt(), anyString());
  }

  @Test
    void ntfDisExtra_sendSupportRequestNotification_swallowsEmailExceptionAndContinuesPush() {
    UUID instructorId = UUID.randomUUID();
    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId)).thenReturn(List.of("token-3"));
    org.mockito.Mockito.doThrow(new RuntimeException("mail down"))
        .when(emailService)
        .sendSupportRequestEmail(
            "instructor@example.com",
            "Instructor A",
            "Student A",
            "student@example.com",
            "Need help",
            "session-1");

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

  @Test
  void ntfDis005_sendSupportRequestNotification_sendsToAllInstructors() {
    UUID instructorId1 = UUID.randomUUID();
    UUID instructorId2 = UUID.randomUUID();

    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId1)).thenReturn(List.of("t1"));
    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId2)).thenReturn(List.of("t2"));

    dispatcher.sendSupportRequestNotification(
        Map.of(
            "ins1@example.com", "Instructor 1",
            "ins2@example.com", "Instructor 2"),
        List.of(instructorId1, instructorId2),
        "Student A",
        "student@example.com",
        "Need help",
        "session-1");

    verify(emailService, times(1))
        .sendSupportRequestEmail(
            eq("ins1@example.com"),
            eq("Instructor 1"),
            eq("Student A"),
            eq("student@example.com"),
            eq("Need help"),
            eq("session-1"));
    verify(emailService, times(1))
        .sendSupportRequestEmail(
            eq("ins2@example.com"),
            eq("Instructor 2"),
            eq("Student A"),
            eq("student@example.com"),
            eq("Need help"),
            eq("session-1"));
    verify(pushNotificationService, times(1))
        .sendSupportRequestNotification(
            List.of("t1"), "Student A", "Need help", "session-1");
    verify(pushNotificationService, times(1))
        .sendSupportRequestNotification(
            List.of("t2"), "Student A", "Need help", "session-1");
  }
}
