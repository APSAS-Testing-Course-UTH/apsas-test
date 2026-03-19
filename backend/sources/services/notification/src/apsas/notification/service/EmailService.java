package apsas.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
  private static final String KEY_FIRST_NAME = "firstName";

  private final JavaMailSender mailSender;
  private final SpringTemplateEngine templateEngine;

  @Value("${notification.email.from}")
  private String fromEmail;

  @Value("${notification.email.from-name}")
  private String fromName;

  @Value("${notification.url.verification}")
  private String verificationUrlTemplate;

  @Value("${notification.url.reset-password}")
  private String resetPasswordUrlTemplate;

  @Async
  public void sendEmail(String to, String subject, String template, Map<String, Object> variables) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail, fromName);
      helper.setTo(to);
      helper.setSubject(subject);

      Context context = new Context();
      context.setVariables(variables);

      String htmlContent = templateEngine.process(template, context);
      helper.setText(htmlContent, true);

      mailSender.send(message);
    } catch (MessagingException e) {
      log.error("Failed to send email to {} with subject: {}", to, subject, e);
      throw new EmailDeliveryException("Failed to send email", e);
    } catch (Exception e) {
      log.error("Unexpected error while sending email to {}", to, e);
      throw new EmailDeliveryException("Unexpected error while sending email", e);
    }
  }

  public void sendVerificationEmail(
      String to, String firstName, String lastName, String verificationToken) {
    String verificationUrl = verificationUrlTemplate.replace("%token%", verificationToken);

    Map<String, Object> variables =
        Map.of(
        KEY_FIRST_NAME, firstName,
            "lastName", lastName,
            "verificationUrl", verificationUrl
        );

    sendEmail(to, "Xác Thực Email - APSAS", "email/verification-email", variables);
  }

  public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
    String resetUrl = resetPasswordUrlTemplate.replace("%token%", resetToken);

    Map<String, Object> variables = Map.of(KEY_FIRST_NAME, firstName, "resetUrl", resetUrl);

    sendEmail(to, "Đặt Lại Mật Khẩu - APSAS", "email/password-reset-email", variables);
  }

  public void sendAssignmentPublishedEmail(
      String to,
      String firstName,
      String assignmentTitle,
      String description,
      String deadline,
      String assignmentUrl
  ) {
    Map<String, Object> variables =
        Map.of(
        KEY_FIRST_NAME, firstName,
            "assignmentTitle", assignmentTitle,
            "description", description,
            "deadline", deadline,
            "assignmentUrl", assignmentUrl
        );

    sendEmail(
        to,
        "Bài Tập Mới: " + assignmentTitle,
        "email/assignment-published",
        variables
    );
  }

  @SuppressWarnings("java:S107")
  public void sendSubmissionEvaluatedEmail(
      String to,
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
    Map<String, Object> variables =
        Map.of(
        KEY_FIRST_NAME, firstName,
            "assignmentTitle", assignmentTitle,
            "score", score,
            "passed", passed,
            "testsPassed", testsPassed,
            "totalTests", totalTests,
            "executionTime", executionTime,
            "feedback", feedback != null ? feedback : "",
            "submissionUrl", submissionUrl
        );

    sendEmail(
        to, "Bài Nộp Đã Được Chấm: " + assignmentTitle, "email/submission-evaluated", variables);
  }

  public void sendSupportRequestEmail(
      String to,
      String instructorName,
      String studentName,
      String studentEmail,
      String initialMessage,
      String sessionUrl
  ) {
    Map<String, Object> variables =
        Map.of(
            "instructorName", instructorName != null ? instructorName : "Instructor",
            "studentName", studentName,
            "studentEmail", studentEmail,
            "initialMessage", initialMessage,
            "sessionUrl", sessionUrl
        );

    sendEmail(
        to,
        "Yêu Cầu Hỗ Trợ Từ " + studentName,
        "email/support-request",
        variables
    );
  }
}
