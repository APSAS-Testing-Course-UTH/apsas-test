package apsas.notification.listener;

import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.client.SubmissionFeignClient;
import apsas.feign.client.UserFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.SubmissionResponse;
import apsas.feign.dto.UserResponse;
import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubmissionEventListener {

  private final NotificationDispatcher notificationDispatcher;
  private final SubmissionFeignClient submissionFeignClient;
  private final AssignmentFeignClient assignmentFeignClient;
  private final UserFeignClient userFeignClient;

  @Value("${notification.url.submission}")
  private String submissionUrlTemplate;

  @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_SUBMISSION_EVALUATED_QUEUE)
  public void handleSubmissionEvaluated(SubmissionEvaluatedEvent event) {
    try {
      SubmissionResponse submission = submissionFeignClient.getSubmissionById(event.getSubmissionId());
      if (submission == null) {
        return;
      }

      UserResponse student = userFeignClient.getUserById(submission.getStudentId());
      if (student == null) {
        return;
      }

      AssignmentResponse assignment = assignmentFeignClient.getAssignmentById(submission.getAssignmentId());
      if (assignment == null) {
        return;
      }

      // Calculate test results
      int totalTests = event.getTestCaseResults() != null ? event.getTestCaseResults().size() : 0;
      int testsPassed = 0;
      if (event.getTestCaseResults() != null) {
        testsPassed = (int) event.getTestCaseResults().stream()
            .filter(tc -> Boolean.TRUE.equals(tc.getPassed()))
            .count();
      }

      // Determine if passed (score >= 70)
      boolean passed = event.getScore() != null && event.getScore().intValue() >= 70;

      // Generate feedback if not provided
      String feedback = submission.getFeedback();
      if (feedback == null || feedback.isEmpty()) {
        feedback = passed
            ? "Chúc mừng! Bạn đã hoàn thành bài tập thành công."
            : "Hãy xem lại kết quả các test case và thử lại.";
      }

      // Build submission URL
      String submissionUrl = submissionUrlTemplate.replace("%id%", event.getSubmissionId().toString());

      // Send notification
      notificationDispatcher.sendSubmissionEvaluatedNotification(
          student.getId(),
          student.getEmail(),
          student.getFirstName(),
          assignment.getTitle(),
          event.getScore() != null ? event.getScore().intValue() : 0,
          passed,
          testsPassed,
          totalTests,
          "N/A", // execution time not in event
          feedback,
          submissionUrl
      );
    } catch (Exception e) {
      log.error("Error handling submission evaluated event", e);
    }
  }
}
