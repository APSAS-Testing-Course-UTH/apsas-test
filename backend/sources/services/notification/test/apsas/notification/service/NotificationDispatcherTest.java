package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

@Epic("Notification Service")
@Feature("Notification Dispatcher")
@Issue("13")
class NotificationDispatcherTest {
  private static final String USER_EMAIL = "user@example.com";
  private static final String FIRST_NAME = "Lan";
  private static final String LAST_NAME = "Nguyen";
  private static final String VERIFY_TOKEN = "verify-token";
  private static final String RESET_TOKEN = "reset-token";
  private static final String ASSIGNMENT_PUBLISHED = "assignment_published";
  private static final String SUBMISSION_EVALUATED = "submission_evaluated";
  private static final String EMAIL_CHANNEL = "email";
  private static final String PUSH_CHANNEL = "push";
  private static final String ASSIGNMENT_A = "Assignment A";
  private static final String ASSIGNMENT_B = "Assignment B";
  private static final String ASSIGNMENT_DEADLINE = "2026-03-30";
  private static final String ASSIGNMENT_URL = "https://host/assignment/A";
  private static final String SUBMISSION_ID = "submission-id";
  private static final String EXECUTION_TIME_100_MS = "100ms";
  private static final String EXECUTION_TIME_120_MS = "120ms";
  private static final String FEEDBACK_GOOD = "Good";
  private static final String FEEDBACK_RETRY = "Retry";
  private static final String TOKEN_1 = "token-1";
  private static final String TOKEN_2 = "token-2";
  private static final String PUSH_DOWN = "push down";
  private static final String MAIL_DOWN = "mail down";

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
  @Tag("unit")
  @Story("Send verification email")
  @TmsLink("NTF-DIS-001")
  @DisplayName("Should bypass preferences when sending verification email")
  void sendVerificationEmailShouldBypassPreferencesWhenVerificationNotificationIsTriggered() {
    dispatcher.sendVerificationEmail(USER_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);

    verify(emailService).sendVerificationEmail(USER_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);
    verifyNoInteractions(preferencesService);
  }

  @Test
  @Tag("unit")
  @Story("Send verification email")
  @TmsLink("NTF-DIS-010")
  @DisplayName("Should swallow exception when verification email service fails")
  void sendVerificationEmailShouldSwallowExceptionWhenEmailServiceThrows() {
    doThrow(new RuntimeException(MAIL_DOWN))
        .when(emailService)
        .sendVerificationEmail(USER_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);

    assertDoesNotThrow(() -> dispatcher.sendVerificationEmail(USER_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN));

    verify(emailService).sendVerificationEmail(USER_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);
  }

  @Test
  @Tag("unit")
  @Story("Send password reset email")
  @TmsLink("NTF-DIS-006")
  @DisplayName("Should bypass preferences when sending password reset email")
  void sendPasswordResetEmailShouldBypassPreferencesWhenPasswordResetIsTriggered() {
    dispatcher.sendPasswordResetEmail(USER_EMAIL, FIRST_NAME, RESET_TOKEN);

    verify(emailService).sendPasswordResetEmail(USER_EMAIL, FIRST_NAME, RESET_TOKEN);
    verifyNoInteractions(preferencesService);
  }

  @Test
  @Tag("unit")
  @Story("Send password reset email")
  @TmsLink("NTF-DIS-007")
  @DisplayName("Should swallow exception when password reset email sending fails")
  void sendPasswordResetEmailShouldSwallowExceptionWhenEmailServiceThrows() {
    doThrow(new RuntimeException(MAIL_DOWN))
        .when(emailService)
        .sendPasswordResetEmail(USER_EMAIL, FIRST_NAME, RESET_TOKEN);

    assertDoesNotThrow(() -> dispatcher.sendPasswordResetEmail(USER_EMAIL, FIRST_NAME, RESET_TOKEN));

    verify(emailService).sendPasswordResetEmail(USER_EMAIL, FIRST_NAME, RESET_TOKEN);
  }

  @Test
  @Tag("unit")
  @Story("Send assignment published email notification")
  @TmsLink("NTF-DIS-002")
  @DisplayName("Should send assignment email when email channel is enabled")
  void sendAssignmentPublishedNotificationShouldSendEmailWhenEmailChannelIsEnabled() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, EMAIL_CHANNEL))
        .thenReturn(true);
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, PUSH_CHANNEL))
        .thenReturn(false);

    dispatcher.sendAssignmentPublishedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_A,
        ASSIGNMENT_DEADLINE,
        ASSIGNMENT_URL);

    verify(emailService)
        .sendAssignmentPublishedEmail(
            USER_EMAIL,
            FIRST_NAME,
            ASSIGNMENT_A,
            "",
            ASSIGNMENT_DEADLINE,
            ASSIGNMENT_URL);
    verify(pushNotificationService, never())
        .sendAssignmentPublishedNotification(any(), anyString(), anyString());
  }

  @Test
  @Tag("unit")
  @Story("Send assignment published push notification")
  @TmsLink("NTF-DIS-003")
  @DisplayName("Should send assignment push when push channel is enabled and tokens exist")
  void sendAssignmentPublishedNotificationShouldSendPushWhenPushChannelEnabledAndTokensExist() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of(TOKEN_1));

    dispatcher.sendAssignmentPublishedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_A,
        ASSIGNMENT_DEADLINE,
        ASSIGNMENT_URL);

    verify(pushNotificationService)
        .sendAssignmentPublishedNotification(List.of(TOKEN_1), ASSIGNMENT_A, ASSIGNMENT_URL);
  }

  @Test
  @Tag("unit")
  @Story("Send submission evaluated push notification")
  @TmsLink("NTF-DIS-EXTRA-001")
  @DisplayName("Should pass submission identifier to push payload when submission is passed")
  void sendSubmissionEvaluatedNotificationShouldUseSubmissionIdWhenPushEnabledAndSubmissionPassed() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of(TOKEN_1));

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_A,
        80,
        true,
        8,
        10,
        EXECUTION_TIME_100_MS,
        FEEDBACK_GOOD,
        SUBMISSION_ID);

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<Integer> scoreCaptor = ArgumentCaptor.forClass(Integer.class);
    ArgumentCaptor<String> submissionCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(),
            titleCaptor.capture(),
            scoreCaptor.capture(),
            submissionCaptor.capture());

    assertEquals(TOKEN_1, tokenCaptor.getValue());
    assertEquals(ASSIGNMENT_A, titleCaptor.getValue());
    assertEquals(80, scoreCaptor.getValue());
    assertEquals(SUBMISSION_ID, submissionCaptor.getValue());
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
  @Tag("unit")
  @Story("Send submission evaluated push notification")
  @TmsLink("NTF-DIS-EXTRA-002")
  @DisplayName("Should pass submission identifier to push payload when submission is not passed")
  void sendSubmissionEvaluatedNotificationShouldUseSubmissionIdWhenPushEnabledAndSubmissionNotPassed() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of(TOKEN_2));

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_B,
        40,
        false,
        4,
        10,
        EXECUTION_TIME_120_MS,
        FEEDBACK_RETRY,
        SUBMISSION_ID);

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
    ArgumentCaptor<Integer> scoreCaptor = ArgumentCaptor.forClass(Integer.class);
    ArgumentCaptor<String> submissionCaptor = ArgumentCaptor.forClass(String.class);
    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(
            tokenCaptor.capture(),
            titleCaptor.capture(),
            scoreCaptor.capture(),
            submissionCaptor.capture());

    assertEquals(TOKEN_2, tokenCaptor.getValue());
    assertEquals(ASSIGNMENT_B, titleCaptor.getValue());
    assertEquals(40, scoreCaptor.getValue());
    assertEquals(SUBMISSION_ID, submissionCaptor.getValue());
  }

  @Test
  @Tag("unit")
  @Story("Skip submission evaluated push notification")
  @TmsLink("NTF-DIS-004")
  @DisplayName("Should not send submission evaluated push when no active tokens exist")
  void sendSubmissionEvaluatedNotificationShouldNotSendPushWhenNoActiveTokensExist() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of());

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_A,
        80,
        true,
        8,
        10,
        EXECUTION_TIME_100_MS,
        FEEDBACK_GOOD,
        SUBMISSION_ID);

    verify(pushNotificationService, never())
        .sendSubmissionEvaluatedNotification(anyString(), anyString(), anyInt(), anyString());
  }

  @Test
  @Tag("unit")
  @Story("Send submission evaluated email notification")
  @TmsLink("NTF-DIS-008")
  @DisplayName("Should send submission evaluated email when email channel is enabled")
  void sendSubmissionEvaluatedNotificationShouldSendEmailWhenEmailEnabled() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, EMAIL_CHANNEL))
        .thenReturn(true);
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, PUSH_CHANNEL))
        .thenReturn(false);

    dispatcher.sendSubmissionEvaluatedNotification(
        userId,
        USER_EMAIL,
        FIRST_NAME,
        ASSIGNMENT_A,
        80,
        true,
        8,
        10,
        EXECUTION_TIME_100_MS,
        FEEDBACK_GOOD,
        SUBMISSION_ID);

    verify(emailService)
        .sendSubmissionEvaluatedEmail(
            USER_EMAIL,
            FIRST_NAME,
            ASSIGNMENT_A,
            80,
            true,
            8,
            10,
            EXECUTION_TIME_100_MS,
            FEEDBACK_GOOD,
            SUBMISSION_ID);
    verify(pushNotificationService, never())
        .sendSubmissionEvaluatedNotification(anyString(), anyString(), anyInt(), anyString());
  }

  @Test
  @Tag("unit")
  @Story("Send submission evaluated push notification")
  @TmsLink("NTF-DIS-011")
  @DisplayName("Should swallow push exception when submission evaluated push dispatch fails")
  void sendSubmissionEvaluatedNotificationShouldSwallowPushExceptionWhenPushFails() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, SUBMISSION_EVALUATED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of(TOKEN_1));
    doThrow(new RuntimeException(PUSH_DOWN))
        .when(pushNotificationService)
        .sendSubmissionEvaluatedNotification(TOKEN_1, ASSIGNMENT_A, 80, SUBMISSION_ID);

    assertDoesNotThrow(
        () ->
            dispatcher.sendSubmissionEvaluatedNotification(
                userId,
                USER_EMAIL,
                FIRST_NAME,
                ASSIGNMENT_A,
                80,
                true,
                8,
                10,
                EXECUTION_TIME_100_MS,
                FEEDBACK_GOOD,
                SUBMISSION_ID));

    verify(pushNotificationService)
        .sendSubmissionEvaluatedNotification(TOKEN_1, ASSIGNMENT_A, 80, SUBMISSION_ID);
  }

  @Test
  @Tag("unit")
  @Story("Send assignment published push notification")
  @TmsLink("NTF-DIS-009")
  @DisplayName("Should swallow push exception when assignment push dispatch fails")
  void sendAssignmentPublishedNotificationShouldSwallowPushExceptionWhenPushFails() {
    UUID userId = UUID.randomUUID();
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, EMAIL_CHANNEL))
        .thenReturn(false);
    when(preferencesService.isNotificationEnabled(userId, ASSIGNMENT_PUBLISHED, PUSH_CHANNEL))
        .thenReturn(true);
    when(deviceTokenService.getActiveTokenStringsByUserId(userId)).thenReturn(List.of(TOKEN_1));
    doThrow(new RuntimeException(PUSH_DOWN))
        .when(pushNotificationService)
        .sendAssignmentPublishedNotification(List.of(TOKEN_1), ASSIGNMENT_A, ASSIGNMENT_URL);

    assertDoesNotThrow(
        () ->
            dispatcher.sendAssignmentPublishedNotification(
                userId,
                USER_EMAIL,
                FIRST_NAME,
                ASSIGNMENT_A,
                ASSIGNMENT_DEADLINE,
                ASSIGNMENT_URL));

    verify(pushNotificationService)
        .sendAssignmentPublishedNotification(List.of(TOKEN_1), ASSIGNMENT_A, ASSIGNMENT_URL);
  }

}
