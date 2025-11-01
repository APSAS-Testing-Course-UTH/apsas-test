package apsas.notification.service;

import java.util.List;
import java.util.Map;

/**
 * Interface for push notification service.
 */
public interface PushNotificationService {

  /**
   * Send a single push notification
   *
   * @param token Device token
   * @param title Notification title
   * @param body  Notification body
   * @param data  Additional data payload
   */
  void sendNotification(String token, String title, String body, Map<String, String> data);

  /**
   * Send multicast push notification
   *
   * @param tokens List of device tokens
   * @param title  Notification title
   * @param body   Notification body
   * @param data   Additional data payload
   */
  void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data);

  /**
   * Send assignment published notification
   *
   * @param tokens          List of recipient device tokens
   * @param assignmentTitle Title of the assignment
   * @param assignmentId    ID of the assignment
   */
  void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId);

  /**
   * Send submission evaluated notification
   *
   * @param token           Device FCM token
   * @param assignmentTitle Title of the assignment
   * @param score           Score received on submission
   * @param submissionId    ID of the submission
   */
  void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId);

  /**
   * Send support request notification to instructors
   *
   * @param tokens      List of instructor device tokens
   * @param studentName Name of the student requesting support
   * @param message     Initial support message
   * @param sessionId   ID of the support session
   */
  void sendSupportRequestNotification(
      List<String> tokens, String studentName, String message, String sessionId);
}
