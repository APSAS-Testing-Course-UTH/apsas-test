package apsas.notification.service;

import java.util.List;
import java.util.Map;

/** Interface for FCM notification service */
public interface IFcmService {

  /**
   * Send a single FCM notification
   *
   * @param token Device FCM token
   * @param title Notification title
   * @param body Notification body
   * @param data Additional data payload
   */
  void sendNotification(String token, String title, String body, Map<String, String> data);

  /**
   * Send multicast FCM notification
   *
   * @param tokens List of device FCM tokens
   * @param title Notification title
   * @param body Notification body
   * @param data Additional data payload
   */
  void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data);

  /**
   * Send assignment published notification
   *
   * @param tokens List of recipient device tokens
   * @param assignmentTitle Title of the assignment
   * @param assignmentId ID of the assignment
   */
  void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId);

  /**
   * Send assignment deadline reminder notification
   *
   * @param token Device FCM token
   * @param assignmentTitle Title of the assignment
   * @param timeRemaining Time remaining until deadline
   * @param assignmentId ID of the assignment
   */
  void sendAssignmentReminderNotification(
      String token, String assignmentTitle, String timeRemaining, String assignmentId);

  /**
   * Send submission evaluated notification
   *
   * @param token Device FCM token
   * @param assignmentTitle Title of the assignment
   * @param score Score received on submission
   * @param submissionId ID of the submission
   */
  void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId);
}
