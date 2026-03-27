package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

@Epic("R2 Backend")
@Feature("Notification Dispatcher")
@Owner("hoanglhh20026")
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
    @Story("NTF-DIS-001")
    void ntfDis001_sendVerificationEmail_bypassesPreferencesAndCallsEmailService() {
        dispatcher.sendVerificationEmail("user@example.com", "Lan", "Nguyen", "verify-token");

        verify(emailService).sendVerificationEmail("user@example.com", "Lan", "Nguyen", "verify-token");
        verifyNoInteractions(preferencesService);
    }

    @Test
    @Story("NTF-DIS-002")
    void ntfDis002_sendAssignmentPublishedNotification_sendsEmailWhenEnabled() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "email"))
        .thenReturn(true);
        when(preferencesService.isNotificationEnabled(userId, "assignment_published", "push"))
                .thenReturn(false);

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
            "",
            "2026-03-30",
            "https://host/assignment/A");
    verify(pushNotificationService, never())
        .sendAssignmentPublishedNotification(any(), anyString(), anyString());
  }

  @Test
    @Story("NTF-DIS-003")
    @Description("Sends push notification when push channel is enabled and at least one active token exists.")
  void ntfDis003_sendAssignmentPublishedNotification_sendsPushWhenEnabledAndHasTokens() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, "assignment_published", "email"))
        .thenReturn(false);
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

    verify(pushNotificationService)
                .sendAssignmentPublishedNotification(
                        List.of("token-1"), "Assignment A", "https://host/assignment/A");
  }

  @Test
    @Story("NTF-DIS-EXTRA-001")
    void ntfDisExtra_sendSubmissionEvaluatedNotification_usesSubmissionUrlForPushData() {
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
    ArgumentCaptor<String> submissionCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(), titleCaptor.capture(), scoreCaptor.capture(), submissionCaptor.capture());
    assertEquals("token-1", tokenCaptor.getValue());
    assertEquals("Assignment A", titleCaptor.getValue());
    assertEquals(80, scoreCaptor.getValue());
    assertEquals("submission-id", submissionCaptor.getValue());
    verify(emailService, never())
        .sendSubmissionEvaluatedEmail(
            anyString(),
            anyString(),
            anyString(),
            anyInt(),
            anyBoolean(),
            anyInt(),
            anyInt(),
            anyString(),
            anyString(),
            anyString());
  }

  @Test
    @Story("NTF-DIS-EXTRA-002")
  void ntfDisExtra_sendSubmissionEvaluatedNotification_usesSubmissionUrlForPushDataWhenFailed() {
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
    ArgumentCaptor<String> submissionCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(), titleCaptor.capture(), scoreCaptor.capture(), submissionCaptor.capture());
    assertEquals("token-2", tokenCaptor.getValue());
    assertEquals("Assignment B", titleCaptor.getValue());
    assertEquals(40, scoreCaptor.getValue());
    assertEquals("submission-id", submissionCaptor.getValue());
  }

  @Test
    @Story("NTF-DIS-004")
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
    @Story("NTF-DIS-EXTRA-003")
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
                .sendSupportRequestNotification(List.of("token-3"), "Student A", "Need help", "session-1");
  }

  @Test
    @Story("NTF-DIS-005")
    @Description("Dispatches support-request notifications to all instructors via email and push channels.")
  void ntfDis005_sendSupportRequestNotification_sendsToAllInstructors() {
    UUID instructorId1 = UUID.randomUUID();
    UUID instructorId2 = UUID.randomUUID();

    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId1)).thenReturn(List.of("t1"));
    when(deviceTokenService.getActiveTokenStringsByUserId(instructorId2)).thenReturn(List.of("t2"));

    dispatcher.sendSupportRequestNotification(
        Map.of("ins1@example.com", "Instructor 1", "ins2@example.com", "Instructor 2"),
        List.of(instructorId1, instructorId2),
        "Student A",
        "student@example.com",
        "Need help",
        "session-1");

    verify(emailService, times(1))
        .sendSupportRequestEmail(
            "ins1@example.com",
            "Instructor 1",
            "Student A",
            "student@example.com",
            "Need help",
            "session-1");
    verify(emailService, times(1))
        .sendSupportRequestEmail(
            "ins2@example.com",
            "Instructor 2",
            "Student A",
            "student@example.com",
            "Need help",
            "session-1");
    verify(pushNotificationService, times(1))
        .sendSupportRequestNotification(
            List.of("t1"), "Student A", "Need help", "session-1");
    verify(pushNotificationService, times(1))
        .sendSupportRequestNotification(
            List.of("t2"), "Student A", "Need help", "session-1");
  }
}
