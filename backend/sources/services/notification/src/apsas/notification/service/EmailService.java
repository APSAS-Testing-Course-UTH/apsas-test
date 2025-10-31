package apsas.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class EmailService {

  private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final SpringTemplateEngine templateEngine;

  @Value("${notification.email.from}")
  private String fromEmail;

  @Value("${notification.email.from-name}")
  private String fromName;

  public EmailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
    this.mailSender = mailSender;
    this.templateEngine = templateEngine;
  }

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
      logger.info("Email sent successfully to {} with subject: {}", to, subject);
    } catch (MessagingException e) {
      logger.error("Failed to send email to {} with subject: {}", to, subject, e);
      throw new RuntimeException("Failed to send email", e);
    } catch (Exception e) {
      logger.error("Unexpected error while sending email to {}", to, e);
      throw new RuntimeException("Unexpected error while sending email", e);
    }
  }

  public void sendVerificationEmail(
      String to, String firstName, String lastName, String verificationToken) {
    String verificationUrl =
        String.format(
            "%s?token=%s",
            System.getenv()
                .getOrDefault("VERIFICATION_BASE_URL", "http://localhost:3000/verify-email"),
            verificationToken);

    Map<String, Object> variables =
        Map.of(
            "firstName", firstName,
            "lastName", lastName,
            "verificationUrl", verificationUrl);

    sendEmail(to, "Verify Your Email - APSAS", "email/verification-email", variables);
  }

  public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
    String resetUrl =
        String.format(
            "%s?token=%s",
            System.getenv()
                .getOrDefault("RESET_PASSWORD_BASE_URL", "http://localhost:3000/reset-password"),
            resetToken);

    Map<String, Object> variables = Map.of("firstName", firstName, "resetUrl", resetUrl);

    sendEmail(to, "Reset Your Password - APSAS", "email/password-reset-email", variables);
  }

  public void sendAssignmentPublishedEmail(
      String to,
      String firstName,
      String assignmentTitle,
      String description,
      String deadline,
      String assignmentUrl) {
    Map<String, Object> variables =
        Map.of(
            "firstName", firstName,
            "assignmentTitle", assignmentTitle,
            "description", description,
            "deadline", deadline,
            "assignmentUrl", assignmentUrl);

    sendEmail(
        to,
        "New Assignment Published: " + assignmentTitle,
        "email/assignment-published",
        variables);
  }

  public void sendAssignmentReminderEmail(
      String to,
      String firstName,
      String assignmentTitle,
      String deadline,
      String timeRemaining,
      String assignmentUrl) {
    Map<String, Object> variables =
        Map.of(
            "firstName", firstName,
            "assignmentTitle", assignmentTitle,
            "deadline", deadline,
            "timeRemaining", timeRemaining,
            "assignmentUrl", assignmentUrl);

    sendEmail(
        to,
        "Reminder: Assignment Deadline Approaching - " + assignmentTitle,
        "email/assignment-reminder",
        variables);
  }

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
      String submissionUrl) {
    Map<String, Object> variables =
        Map.of(
            "firstName", firstName,
            "assignmentTitle", assignmentTitle,
            "score", score,
            "passed", passed,
            "testsPassed", testsPassed,
            "totalTests", totalTests,
            "executionTime", executionTime,
            "feedback", feedback != null ? feedback : "",
            "submissionUrl", submissionUrl);

    sendEmail(
        to, "Submission Evaluated: " + assignmentTitle, "email/submission-evaluated", variables);
  }
}
