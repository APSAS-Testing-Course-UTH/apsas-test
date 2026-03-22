package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.spring6.SpringTemplateEngine;

class EmailServiceTest {
  private JavaMailSender mailSender;
  private SpringTemplateEngine templateEngine;

  @BeforeEach
  void setUp() {
    mailSender = mock(JavaMailSender.class);
    templateEngine = mock(SpringTemplateEngine.class);
  }

  @Test
  void sendVerificationEmail_buildsExpectedVariables() {
    EmailService service = spy(new EmailService(mailSender, templateEngine));
    ReflectionTestUtils.setField(service, "verificationUrlTemplate", "https://host/verify/%token%");
    doNothing().when(service).sendEmail(anyString(), anyString(), anyString(), anyMap());

    service.sendVerificationEmail("to@example.com", "Lan", "Nguyen", "abc123");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, Object>> variablesCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendEmail(
        anyString(),
        anyString(),
        anyString(),
        variablesCaptor.capture());

    Map<String, Object> variables = variablesCaptor.getValue();
    assertEquals("Lan", variables.get("firstName"));
    assertEquals("Nguyen", variables.get("lastName"));
    assertEquals("https://host/verify/abc123", variables.get("verificationUrl"));
  }

  @Test
  void sendSubmissionEvaluatedEmail_setsEmptyFeedbackWhenNull() {
    EmailService service = spy(new EmailService(mailSender, templateEngine));
    doNothing().when(service).sendEmail(anyString(), anyString(), anyString(), anyMap());

    service.sendSubmissionEvaluatedEmail(
        "to@example.com",
        "Minh",
        "Assignment 1",
        95,
        true,
        10,
        10,
        "200ms",
        null,
        "https://host/submissions/1");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, Object>> variablesCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendEmail(
        anyString(),
        anyString(),
        anyString(),
        variablesCaptor.capture());

    assertEquals("", variablesCaptor.getValue().get("feedback"));
  }

  @Test
  void sendSupportRequestEmail_defaultsInstructorNameWhenNull() {
    EmailService service = spy(new EmailService(mailSender, templateEngine));
    doNothing().when(service).sendEmail(anyString(), anyString(), anyString(), anyMap());

    service.sendSupportRequestEmail(
        "instructor@example.com",
        null,
        "Student A",
        "student@example.com",
        "Need help",
        "https://host/support/1");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, Object>> variablesCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendEmail(
        anyString(),
        anyString(),
        anyString(),
        variablesCaptor.capture());

    assertEquals("Instructor", variablesCaptor.getValue().get("instructorName"));
  }

  @Test
  void sendEmail_wrapsUnexpectedExceptionsIntoEmailDeliveryException() {
    EmailService service = new EmailService(mailSender, templateEngine);
    ReflectionTestUtils.setField(service, "fromEmail", "no-reply@example.com");
    ReflectionTestUtils.setField(service, "fromName", "APSAS");

    MimeMessage mimeMessage = new MimeMessage((Session) null);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    when(templateEngine.process(anyString(), any())).thenThrow(new RuntimeException("boom"));

    EmailDeliveryException exception =
        assertThrows(
            EmailDeliveryException.class,
            () ->
                service.sendEmail(
                    "to@example.com",
                    "Subject",
                    "email/template",
                    Map.of("key", "value")));

    assertEquals("Unexpected error while sending email", exception.getMessage());
    assertNotNull(exception.getCause());
    assertEquals("boom", exception.getCause().getMessage());
  }
}
